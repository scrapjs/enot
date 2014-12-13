/**
 * @module  enot/emitter
 */

module.exports = Enot;


var Emitter = require('emmy/Emitter');
var on = require('./on');
var emit = require('./emit');
var off = require('./off');


/**
 * @constructor
 * @module enot
 *
 * Mixins any object passed.
 * Implements EventEmitter interface.
 * Static methods below are useful for an old API.
 */
function Enot(target){
	if (!target) return target;

	//mixin any object passed
	for (var meth in proto){
		target[meth] = proto[meth];
	}

	return target;
}

/** Prototype should be instanceof Emitter (also fill basic methods like `listeners`) */
var proto = Enot.prototype = Object.create(Emitter.prototype);


proto['on'] = function(a,b){
	return on(this, a,b);
};

proto['off'] = function(a,b){
	return off(this, a,b);
};

proto['emit'] = function(a,b,c){
	return emit(this, a,b,c);
};
