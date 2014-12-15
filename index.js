/**
 * @module  enot
 */


var slice = require('sliced');
var parser = require('./src/parser');
var Emitter = require('emmy');
var isFn = require('mutype/is-fn');
var isObject = require('mutype/is-object');
var eachCSV = require('each-csv');


var _on = Emitter.on, _off= Emitter.off, _emit = Emitter.emit;
var getTargets = parser.getTargets, getParts = parser.getParts, getCallback = parser.getCallback;


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
	invoke(function(target, ref, fn){
		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];

		var cbSet = cbCache.get(fn);
		if (!cbSet) return;

		//get all listeners for the specific fn & evt
		var cbList = cbSet[evt];
		_off(target, evt, cbList);
	}, arguments);

	return Enot;
};
var emit = Enot['emit'] = function(){
	invoke(function(target, ref, fn){
		var parts = getParts(ref);
		var evt = parts[1].split(':')[0];
		var targets = getTargets(target, parts[0]);
		fn = getCallback(target, parts[1], fn);

		_emit(target, evt, fn);
	}, arguments);

	return Enot;
};


/** Redirect, parse event notations and call target method */
function invoke(fn, args){
	var target = args[0], refs = args[1];

	//if no target specified - use mediator
	//refs can be both object/string, so first check an fn
	if (isFn(refs)) {
		target = null;
		refs = args[0];
		args = slice(args, 1);
	}
	else {
		args = slice(args, 2);
	}

	//ignore absent evtRefs
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

	//TODO: move to emmy
	//just fire straight event passed
	// else if (isEvent(args[0])) {
	// 	_emit(target, evtRefs, data, bubbles);
	// 	return;
	// }

	eachCSV(refs, function(evtRef){
		fn.apply(target, [target, evtRef].concat(args));
	});
}


module.exports = Enot;