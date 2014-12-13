/**
 * @module  enot/on
 */
module.exports = on;


var eachCSV = require('each-csv');
var parseRef = require('./src/parser');
var isArrayLike = require('mutype/is-array-like');
var _on = require('emmy/on');
var isString = require('mutype/is-string');
var isObject = require('mutype/is-object');


/**
 * Listed reference binder (comma-separated references)
 *
 * @alias addEventListener
 * @alias bind
 * @chainable
 *
 * @param {[type]} evtRefs [description]
 * @param {Function} fn [description]
 *
 * @return {[type]} [description]
 */
function on(target, evtRefs, fn){
	//if no target specified - use global target
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = global;
	}

	//if no events passed - don’t do anything
	if (!evtRefs) return target;

	//handle batch events
	if (isObject(evtRefs)){
		for (var evtRef in evtRefs){
			on(target, evtRef, evtRefs[evtRef]);
		}

		return;
	}

	//ignore empty fn
	if (!fn) return;


	//bind each comma-separated event reference
	eachCSV(evtRefs, function(evtRef){
		// console.log('on', newTarget, evtObj.evt, evtObj.modifiers)
		_on.apply(target, parseRef(target, evtRef, fn));
	});

	return;
}