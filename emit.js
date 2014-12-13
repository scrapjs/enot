/**
 * @module enot/emit
 */

module.exports = emit;


var eachCSV = require('each-csv');
var isString = require('mutype/is-string');
var isObject = require('mutype/is-object');
var isEvent = require('mutype/is-event');
var parseRef = require('./src/parser');
var _emit = require('emmy/emit');
var slice = require('sliced');


/**
 * Dispatch event to any target.
 *
 * @alias trigger
 * @alias fire
 * @alias dispatchEvent
 * @chainable
 */
function emit(target, evtRefs, data, bubbles){
	var args = arguments;

	//if no target specified - use mediator
	if (isString(target)) {
		bubbles = data;
		data = evtRefs;
		evtRefs = target;
		target = null;
		args = slice(args, 1);
	}
	else {
		args = slice(args, 2);
	}

	//ignore absent evtRefs
	if (!evtRefs) return;

	//just fire straight event passed
	if (isEvent(evtRefs)) {
		_emit(target, evtRefs, data, bubbles);
		return;
	}


	//bind each comma-separated event reference
	eachCSV(evtRefs, function(evtRef){
		_emit.apply(target, parseRef(target, evtRef).concat(args));
	});

	return target;
}