/**
 * @module  enot
 */


var slice = require('sliced');
var Emitter = require('emmy');
var isFn = require('mutype/is-fn');
var isObject = require('mutype/is-object');
var eachCSV = require('each-csv');
var isString = require('mutype/is-string');
var unprefix = require('mustring/unprefix');
var q = require('query-relative');
var paren = require('parenthesis');


var _on = Emitter.on, _off= Emitter.off, _emit = Emitter.emit;


/**
 * @constructor
 *
 * Mixins any object passed.
 * Implements EventEmitter interface.
 * Static methods below are useful as wrappers.
 */
function Enot(target){
	if (!target) return target;

	//mixin any object passed
	for (var meth in proto){
		target[meth] = proto[meth];
	}

	return target;
}



/**
 * Prototype should be instanceof Emitter
 * also fill basic event methods like `listeners`
 */
var proto = Enot.prototype = Object.create(Emitter.prototype);


//prototype methods
proto['on'] = function(){
	return on.apply(this, arguments);
};

proto['off'] = function(){
	return off.apply(this, arguments);
};

proto['emit'] = function(){
	return emit.apply(this, arguments);
};


/**
 * Storage of modified fns for orig fns, per-event
 *
 * e.g.
 * fn: {evt: [cb1, cb2, ...]}
 */
var cbCache = new WeakMap;

/**
 * Static wrapper API
 */
var on = Enot['on'] = function(){
	invoke(function(target, ref, fn){
		if (!fn) return;

		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];
		var targets = getTargets(target, parts[0]);

		//get fn wrapper with pseudos applied
		var modFn = getCallback(target, parts[1], fn);

		//save modified fn to the callback cache to unbind
		var cbSet, cbList;
		if (!(cbSet = cbCache.get(fn))) cbCache.set(fn, cbSet = {});
		cbList = cbSet[evt] || (cbSet[evt] = []);
		cbList.push(modFn);

		_on(targets, evt, modFn);
	}, arguments);

	return Enot;
};
var off = Enot['off'] = function(){
	invoke(function (target, ref, fn) {
		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];
		var targets = getTargets(target, parts[0]);

		if (fn) {
			var cbSet = cbCache.get(fn);
			if (!cbSet) return;

			//get all listeners for the specific fn & evt
			var cbList = cbSet[evt];
			_off(targets, evt, cbList);

			//clean cb reference
			cbSet[evt] = null;
		}
		else {
			_off(targets, evt);
		}
	}, arguments);

	return Enot;
};
var emit = Enot['emit'] = function(){
	invoke(function(target, ref){
		var evt;
		if (isString(ref)) {
			var parts = getParts(ref);
			evt = parts[1].split(':')[0];
			target = getTargets(target, parts[0]);
		}

		//no-string reference pass as is
		else {
			evt = ref;
			target = getTargets(target);
		}

		_emit.apply(target, [target, evt].concat(slice(arguments, 2)));

	}, arguments);

	return Enot;
};


/** Redirect, parse event notations and call target method */
function invoke(fn, args){
	var target = args[0], refs = args[1];

	//if no target specified - use mediator
	//refs can be both object/string, so first check an fn
	// emit('document click'), emit(document, 'click')
	// on(document, {sett}), on('document sett')
	if (isFn(refs) || isString(target)) {
		target = null;
		refs = args[0];
		args = slice(args, 1);
	}
	else {
		args = slice(args, 2);
	}

	//ignore absent evtRefs/fn
	if (!refs) return;


	//batch refs
	if (isObject(refs)) {
		for (var evtRefs in refs){
			eachCSV(evtRefs, function(evtRef){
				fn.apply(this, [target, evtRef].concat(refs[evtRef]));
			});
		}

		return;
	}

	//string refs
	if (isString(refs)) {
		eachCSV(refs, function(evtRef){
			fn.apply(target, [target, evtRef].concat(args));
		});

		return;
	}

	//non-string refs
	fn.apply(target, [target, refs].concat(args));
}






/**
 * Detect event/target parts in event reference.
 * Event reference (basic event notation) looks:
 * '[target] event'
 * Event goes last.
 *
 * Exact order, in theory, could be detected
 * because list of exact tags is known
 * as well as dashed-notation for custom elements
 * so the order could be guessed
 * but it complicates parsing
 * and it is illogical (Subject → Verb scheme is natural).
 *
 * @example
 * 'a b' → ['a', 'b']
 * 'document click': ['document', 'click']
 *
 *
 * @param  {string}   str   Event notation
 *
 * @return {Array}  Result of parsing: ['<target part>', '<event part>']
 */
function getParts(str){
	var result = ['',''];

	//get event name - the last token
	var eventString = str.match(/[\w\.\:\$\-]+(?:\:[\w\.\:\-\$]+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	result[0] = str.slice(0, -eventString.length).trim();

	//parse event
	result[1] = unprefix(eventString, 'on');

	return result;
}


/**
 * Get target el by a query string
 *
 * @param  {Element|Object} target A target(s) to relate
 * @param  {string}         str    Target reference
 *
 * @return {*}                     Resulting target found
 */
function getTargets(target, str) {
	// console.log('parseTarget `' + str + '`', target)

	//no target means global target (mediator)
	if (!target) target = document;

	//no string means self evt
	if (!str){
		return target;
	}

	//some reserved words
	if(str === 'window') return window;
	else if(str === 'document') return document;

	//query relative selector
	else {
		return q(target, str, true);
	}
}


/**
 * Get callback for the event string
 * basically wrap passed event
 *
 * @example
 * 'click:once:on(.element)' - apply `once` wrapper, `on` wrapper
 *
 * @param {function} fn An initial function to wrap
 * @param {string} str A string containing event part
 *
 * @return {function} Constructed callback for the event string
 */
function getCallback(target, evtStr, fn){
	if (!fn) return;

	var targetFn = fn;

	//escape all parentheses
	var parens = paren.parse(evtStr);

	//get pseudos list & evt
	var pseudoList = parens[0].split(':');
	var evt = pseudoList.shift();

	//wrap each modifier
	pseudoList
	//:once should go last
	.sort(function(a, b){
		if (a === 'once' || a === 'one') return -1;
		if (b === 'once' || b === 'one') return 1;
		return 0;
	})
	.forEach(function(pseudo){
		//get pseudo name/ref parts from parenthesis token
		var parts = pseudo.split('\\');

		var pseudoName = parts[0];
		var pseudoParams = paren.stringify(parens[parts[1]], parens);

		//for :once method pass special `off` as param
		if (!pseudoParams) pseudoParams = function(target, evt, cb){
			off(target, evt, cb);
			off(target, evt, fn);
		};

		if (pseudos[pseudoName]) {
			targetFn = pseudos[pseudoName](target, evt, targetFn, pseudoParams);
		}
	});

	return targetFn;
}



/**
 * Dics of pseudos.
 * Includes all xtags ones: delegate, pass.
 *
 * @module  enot/pseudos
 */

var pseudos = {};

pseudos.on =
pseudos.delegate =
require('emmy/delegate').wrap;

pseudos.pass =
pseudos.keypass =
require('emmy/keypass').wrap;

pseudos.one =
pseudos.once =
require('emmy/once').wrap;

pseudos.throttle =
require('emmy/throttle').wrap;

pseudos.later =
require('emmy/later').wrap;


pseudos.order = [
	'one', 'once'
];




module.exports = Enot;