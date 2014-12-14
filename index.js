/**
 * @module  enot
 */


var slice = require('sliced');
var parseRef = require('./src/parser');
var Emitter = require('emmy');
var isFn = require('mutype/is-fn');
var isObject = require('mutype/is-object');
var eachCSV = require('each-csv');


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
 * Static wrapper API
 */
var on = Enot['on'] = function(){
	invoke(_on, arguments);
	return Enot;
};
var off = Enot['off'] = function(){
	invoke(_off, arguments);
	return Enot;
};
var emit = Enot['emit'] = function(){
	invoke(_emit, arguments);
	return Enot;
};


/** Redirect, parse event notations and call target method */
function invoke(method, args){
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
	if (!refs) return true;


	//batch refs
	if (isObject(refs)) {
		for (var evtRef in refs){
			invoke(method, [target, evtRef, refs[evtRef]]);
		}

		return true;
	}

	//TODO: move to emmy
	//just fire straight event passed
	// else if (isEvent(args[0])) {
	// 	_emit(target, evtRefs, data, bubbles);
	// 	return;
	// }


	//bind each comma-separated event reference\
	eachCSV(refs, function(evtRef){
		method.apply(target, parseRef(target, evtRef, args[0]));
	});

	return true;
}


module.exports = Enot;