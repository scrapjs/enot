/**
 * Parsing utils.
 *
 * @module  enot/parser
 */

var unprefix = require('mustring/unprefix');
var q = require('query-relative');
var pseudos = require('./pseudos');
var paren = require('parenthesis');


/**
 * Return list of arguments for emitter methods.
 *
 * @return {Array} Arguments to pass to emitter on/off/emit: target, event, function
 */
module.exports = function(target, evtRef, fn){
	var parts = getParts(evtRef);
	var targets = getTargets(target, parts[0]);
	var fn = getCallback(target, parts[1], fn);

	return [
		targets,
		parts[1].split(':')[0],
	];
};


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
	pseudoList.forEach(function(pseudo){
		//get pseudo name/ref parts from parenthesis token
		var parts = pseudo.split('\\');

		var pseudoName = parts[0];
		var pseudoParams = parens[parts[1]];

		if (pseudos[pseudoName]) {
			targetFn = pseudos[pseudoName](target, evt, targetFn, pseudoParams);

			//save source fn to each modifier
			targetFn.fn = fn;
		}
	});

	return targetFn;
}