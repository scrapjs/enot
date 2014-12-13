/**
 * @module  enot/off
 */
module.exports = off;


var eachCSV = require('each-csv');
var parseRef = require('./src/parser');
var isArrayLike = require('mutype/is-array-like');
var isFn = require('mutype/is-fn');
var _off = require('emmy/off');
var isString = require('mutype/is-string');
var isObject = require('mutype/is-object');
var isFn = require('mutype/is-fn');


/**
 * Single reference unbinder
 *
 * @param {(Element|Object)} target Target to unbind event, optional
 * @param {(string|Object)} evtRef Event notation, or object with events to unbind
 * @param {Function} fn callback
 */
function off(target, evtRefs, fn) {
	//if no target specified - take proper args
	//evtRefs can be both object/string, so first check an fn
	if (isFn(evtRefs)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//batch events
	if (isObject(evtRefs)) {
		for (var evtRef in evtRefs){
			off(target, evtRef, evtRefs[evtRef]);
		}

		return;
	}

	//for list of refs - unbing single refs
	eachCSV(evtRefs, function(evtRef){
		//TODO: clear planned calls for an event
		// if (dfdCalls[evtObj.evt]) {
		// 	for (var i = 0; i < dfdCalls[evtObj.evt].length; i++){
		// 		if (intervalCallbacks[dfdCalls[evtObj.evt][i]] === fn)
		// 			Emitter.off(newTarget, evtObj.evt + evtSeparator + dfdCalls[evtObj.evt][i]);
		// 	}
		// }

		_off.apply(target, parseRef(target, evtRef, fn));
	});

	return;
}