/**
 * @module  enot
 */


var slice = require('sliced');
var emitter = require('emmy').prototype;
var eachCSV = require('each-csv');
var isFn = require('mutype/is-fn');
var isObject = require('mutype/is-object');
var isString = require('mutype/is-string');
var isArrayLike = require('mutype/is-array-like');
var unprefix = require('mustring/unprefix');
var q = require('queried');
var paren = require('parenthesis');


var _on = require('emmy/on'), _off= require('emmy/off'), _emit = require('emmy/emit'), _once = require('emmy/once');


//TODO: query multiple targets in on/off/emit - now callback is got improperly


/**
 * @constructor
 *
 * Mixins any object passed.
 * Implements EventEmitter interface.
 * Static methods below are useful as wrappers.
 */
function Enot (target) {
	if (!target) return target;

	//mixin any object passed
	for (var meth in proto) {
		target[meth] = proto[meth];
	}

	return target;
}



/**
 * Prototype should be instanceof Emitter
 * also fill basic event methods like `listeners`
 */
var proto = Enot.prototype = Object.create(emitter);


//prototype methods
proto['on'] = function (a,b,c) {
	on(this, a,b,c);
	return this;
};
proto['once'] = function (a,b,c) {
	once(this, a,b,c);
	return this;
};

proto['off'] = function (a,b) {
	//call super off (some fns could’ve been bound outside)
	_off(this, a,b);

	off(this, a,b);
	return this;
};

proto['emit'] = function () {
	emit.apply(this, [this].concat(slice(arguments)));
	return this;
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
var on = Enot['on'] = function on () {
	invoke(function (target, ref, fn) {
		if (!fn) return;

		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];

		//get fn wrapper with pseudos applied
		var modFn = getCallback(target, parts[1], fn);

		//save modified fn to the callback cache to unbind
		var cbSet, cbList;
		if (!(cbSet = cbCache.get(fn))) cbCache.set(fn, cbSet = {});
		cbList = cbSet[evt] || (cbSet[evt] = []);
		cbList.push(modFn);

		_on(target, evt, modFn);
	}, arguments);

	return Enot;
};
var off = Enot['off'] = function off () {
	invoke(function (target, ref, fn) {
		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];
		//clean cb reference
		if (fn) {
			var cbSet = cbCache.get(fn);
			if (!cbSet) return;

			var cbList = cbSet[evt];

			if (!cbList) return;

			for (var i = cbList.length; i--;) {
				_off(target, evt, cbList[i]);

				//FIXME: remove reference to avoid leaks
				// cbList.splice(i,1);
			}
		} else {
			_off(target, evt, fn);
		}

	}, arguments);

	return Enot;
};
var emit = Enot['emit'] = function emit () {
	invoke(function (target, ref) {
		if (isString(ref)) {
			ref = getParts(ref)[1].split(':')[0];
		}
		_emit.apply(target, [target, ref].concat(slice(arguments, 2)));

	}, arguments);

	return Enot;
};
var once = Enot['once'] = function once () {
	_once.apply(this, arguments);
	return Enot;
}


/** Redirect, parse event notations and call target method */
function invoke (fn, args) {
	var target = args[0], refs = args[1];

	//if no target specified - use mediator
	//refs can be both object/string, so first check an fn
	// emit('document click'), emit(document, 'click')
	// on(document, {sett}), on('document sett')
	if (isFn(refs) || isString(target)) {
		target = null;
		refs = args[0];
		args = slice(args, 0);
	}
	else {
		args = slice(args, 1);
	}

	//ignore absent evtRefs/fn
	if (!refs) return;


	//shorten args, exclude refs
	args = slice(args, 1);

	//batch refs
	if (isObject(refs)) {
		for (var evtRefs in refs) {
			eachCSV(evtRefs, function (evtRef) {
				invoke(fn, [target, evtRef].concat(refs[evtRef]));
			});
		}

		return;
	}


	//string refs
	if (isString(refs)) {
		eachCSV(refs, function (evtRef) {
			//get targets to apply
			var parts = getParts(evtRef);
			var targets = getTargets(target, parts[0]);

			//iterate over each target
			for (var i = 0, l = targets.length; i < l; i++) {
				fn.apply(targets[i], [targets[i], evtRef].concat(args));
			}
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
function getParts(str) {
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
 * Get targets by a query string.
 * Ensures result is array.
 *
 * @param  {Element|Object} target A target(s) to relate
 * @param  {string}         str    Target reference
 *
 * @return {Array}                 Resulting targets found
 */
function getTargets (target, str) {
	// console.log('parseTarget `' + str + '`', target)

	//no target means global target (mediator)
	if (!target) target = [document];

	//no string means self evt
	if (!str) {
		return isArrayLike(target) ? target : [target];
	}

	//some reserved words
	if(str === 'window') return [window];
	else if(str === 'document') return [document];

	//query relative selector
	else {
		return q.all(str, target);
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
function getCallback (target, evtStr, fn) {
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
	.sort(function (a, b) {
		if (a === 'once' || a === 'one') return -1;
		if (b === 'once' || b === 'one') return 1;
		return 0;
	})
	.forEach(function (pseudo) {
		//get pseudo name/ref parts from parenthesis token
		var parts = pseudo.split('\\');

		var pseudoName = parts[0];
		var pseudoParams = paren.stringify(parens[parts[1]], parens);

		//for :once method pass special `off` as param
		if (!pseudoParams) pseudoParams = function (target, evt, cb) {
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

pseudos['on'] =
pseudos['delegate'] =
require('emmy/delegate').wrap;

pseudos['not'] =
require('emmy/not').wrap;

pseudos['pass'] =
pseudos['keypass'] =
require('emmy/keypass').wrap;

pseudos['one'] =
pseudos['once'] =
require('emmy/once').wrap;

pseudos['throttle'] =
require('emmy/throttle').wrap;

pseudos['later'] =
require('emmy/later').wrap;



module.exports = Enot;