!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/** @module enot */
var enot = module.exports = {};

var matches = require('matches-selector');
var eachCSV = require('each-csv');
var evt = require('muevents');
var str = require('mustring');
var types = require('mutypes');

var isString = types.isString;
var isElement = types.isElement;
var isArrayLike = types.isArrayLike;
var has = types.has;
var unprefixize = str.unprefixize;
var upper = str.upper;

var global = (1, eval)('this');
var doc = global.document;


/** Separator to specify events, e.g. click-1 (means interval=1 planned callback of click) */
var evtSeparator = '-';



/** @type {RegExp} Use as `.split(commaSplitRe)` */

var commaSplitRe = /\s*,\s*/;


/**
 * Return parsed event object from event reference.
 *
 * @param  {Element|Object}   target   A target to parse (optional)
 * @param  {string}   string   Event notation
 * @param  {Function} callback Handler
 * @return {Object}            Result of parsing: {evt, modifiers, targets}
 */

function parseReference(target, string) {
	var result = {};

	//get event name - the first token from the end
	var eventString = string.match(/[\w\.\:\$\-]+(?:\:[\w\.\:\-\$]+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	string = string.slice(0, -eventString.length).trim();
	result.targets = parseTarget(target, string);

	//parse modifiers
	var eventParams = unprefixize(eventString, 'on').split(':');
	//get event name
	result.evt = eventParams.shift();
	result.modifiers = eventParams;

	return result;
}


/** @type {string} Reference to a self target members, e. g. `'@a click'` */

var selfReference = '@';


/**
 * Retrieve source element from string
 * @param  {Element|Object} target A target to relate to
 * @param  {string}         str    Target reference
 * @return {*}                     Resulting target found
 */

function parseTarget(target, str) {
	//make target global, if none
	if (!target) target = doc;

	// console.log('parseTarget `' + str + '`', target)
	if (!str){
		return target;
	}

	//try to query selector in DOM environment
	if (/^[.#[]/.test(str)) {
		if (!isElement(target)) target = doc;
		return target.querySelectorAll(str);
	}

	//return self reference
	else if (/^this\./.test(str)){
		return getProperty(target, str.slice(5));
	}
	else if(str[0] === selfReference){
		return getProperty(target, str.slice(1));
	}

	else if(str === 'this') return target;
	else if(str === selfReference) return target;

	else if(/^body|^html/.test(str)) {
		return doc.querySelectorAll(str);
	}
	else if(str === 'root') return doc.documentElement;
	else if(str === 'window') return global;

	//return global variable
	else {
		return getProperty(global, str);
	}
}


/**
 * Get property defined by dot notation in string
 * @param  {Object} holder   Target object where to look property up
 * @param  {string} propName Dot notation, like 'this.a.b.c'
 * @return {[type]}          [description]
 */

function getProperty(holder, propName){
	var propParts = propName.split('.');
	var result = holder, lastPropName;
	while ((lastPropName = propParts.shift()) !== undefined) {
		if (!has(result, lastPropName)) return undefined;
		result = result[lastPropName];
	}
	return result;
}


/**
 * Apply event modifiers to string.
 * Returns wrapped fn.
 *
 * @param  {Function}   fn   Source function to be transformed
 * @param  {string}   evt   Event name to pass to modifiers
 * @param  {Array}   modifiers   List of string chunks representing modifiers
 * @return {Function}   Callback with applied modifiers
 */

function applyModifiers(fn, evt, modifiers){
	var targetFn = fn;
	var self = this;

	modifiers.sort(function(a,b){
		//one should go last because it offs passed event
		return /^one/.test(a) ? 1 : -1;
	})
	.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length + 1, -1);

		if (enot.modifiers[modifierName]) {
			//create new context each call
			targetFn = enot.modifiers[modifierName].call(self, evt, targetFn, modifierParams, fn);
		}
	});

	return targetFn;
}


/**
 * Set of modified callbacks associated with fns:
 *
 * @example
 * `{fn: {evtRef: modifiedFn, evtRef: modifiedFn}}`
 *
 * @type {WeakMap}
 */

var modifiedCbCache = new WeakMap();


/**
 * Listed reference binder (comma-separated references)
 *
 * @alias addEventListener
 * @alias bind
 * @chainable
 */
enot.on = function(target, evtRefs, fn){
	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	if (!evtRefs) return enot;

	eachCSV(evtRefs, function(evtRef){
		on(target, evtRef, fn);
	});

	return enot;
};


/**
 * Listed ref binder with :one modifier
 *
 * @chainable
 */
enot.one = function(target, evtRefs, fn){
	//append ':one' to each event from the references passed
	var processedRefs = '';
	eachCSV(evtRefs, function(item){
		processedRefs += item + ':one';
	});
	return enot.on(target, processedRefs, fn);
};


/**
 * Cache of redirectors
 *
 * @example
 * cache[target][evtRef]
 */
var redirectCbCache = new WeakMap();


/**
 * Bind single reference (no comma-declared references).
 *
 * @param {*} target A target to relate reference, `document` by default.
 * @param {string} evtRef Event reference, like `click:defer` etc.
 * @param {Function} fn Callback.
 */

function on(target, evtRef, fn) {
	//ignore empty fn
	if (!fn) return;

	var evtObj = parseReference(target, evtRef);

	var targets = evtObj.targets,

		//get modified fn or redirector
		targetFn = isString(fn) ? getRedirector(fn, target) : fn;
		targetFn = applyModifiers.call(target, targetFn, evtObj.evt, evtObj.modifiers);


	//ignore not bindable sources
	if (!targets) return false;

	//iterate list of targets
	if (isArrayLike(targets)) {
		for (var i = targets.length; i--;){
			on(targets[i], evtObj.evt, targetFn);
		}

		return;
	}

	//target is one indeed
	var newTarget = targets;

	//catch redirect (stringy callback)
	if (isString(fn)) {
		//save redirect fn to cache
		if (!redirectCbCache.has(target)) redirectCbCache.set(target, {});
		var redirectSet = redirectCbCache.get(target);

		//ignore existing binding
		if (redirectSet[evtRef]) return false;

		redirectSet[evtRef] = targetFn;
	}

	//if fn has been modified - save modified fn (in order to unbind it properly)
	else {
		//bind new event
		if (!modifiedCbCache.has(fn)) modifiedCbCache.set(fn, {});
		var modifiedCbs = modifiedCbCache.get(fn);

		//ignore bound event
		if (modifiedCbs[evtObj.evt] && targetFn !== fn) return false;

		//save modified callback
		modifiedCbs[evtObj.evt] = targetFn;
	}

	// console.log('bind', evtRef, newTarget, evtObj.evt)
	evt.on(newTarget, evtObj.evt, targetFn);
}


/**
 * Return redirection statements handler.
 *
 * @param    {string}   redirectTo   Redirect declaration (other event notation)
 * @return   {function}   Callback which fires redirects
 */

function getRedirector(redirectTo, ctx){

	var cb = function(e){
		eachCSV(redirectTo, function(evt){
			if (redirectors[evt]) redirectors[evt].call(ctx, e);
			// console.log('redirect', ctx, evt)
			enot.emit(ctx, evt, e.detail, e.bubbles);
		});
	};

	return cb;
}


/**
 * Utility callbacks shortcuts
 */

var redirectors = {
	preventDefault: function (e) {
		e.preventDefault && e.preventDefault();
	},
	stopPropagation: function (e) {
		e.stopPropagation && e.stopPropagation();
	},
	stopImmediatePropagation: function (e) {
		e.stopImmediatePropagation && e.stopImmediatePropagation();
	},
	noop: function(){}
};


/**
 * Listed reference unbinder
 *
 * @alias removeEventListener
 * @alias unbind
 * @chainable
 */

enot.off = function(target, evtRefs, fn){
	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//FIXME: remove all listeners?
	if (!evtRefs) return enot;

	eachCSV(evtRefs, function(evtRef){
		off(target, evtRef, fn);
	});

	return enot;
};


/**
 * Single reference unbinder
 *
 * @param {Element} target Target to unbind event, optional
 * @param {string} evtRef Event notation
 * @param {Function} fn callback
 */

function off(target, evtRef, fn){
	var evtObj = parseReference(target, evtRef);
	var targets = evtObj.targets;
	var targetFn = fn;

	if (!targets) return;

	//iterate list of targets
	if (targets.length && !isElement(targets)) {
		for (var i = targets.length; i--;){
			off(targets[i], evtObj.evt, targetFn);
		}

		return;
	}

	var newTarget = targets;

	//clear planned calls for an event
	if (dfdCalls[evtObj.evt]) {
		for (var i = 0; i < dfdCalls[evtObj.evt].length; i++){
			if (intervalCallbacks[dfdCalls[evtObj.evt][i]] === fn)
				enot.off(newTarget, evtObj.evt + evtSeparator + dfdCalls[evtObj.evt][i]);
		}
	}

	//catch redirect (stringy callback)
	if (fn) {
		//unbind callback
		if (isString(fn)) {
			fn += '';
			var redirectSet = redirectCbCache.get(target);

			if (!redirectSet) return;

			targetFn = redirectSet[evtRef];

			redirectSet[evtRef] = null;
		}

		//try to clean cached modified callback
		else if (modifiedCbCache.has(fn)) {
			var modifiedCbs = modifiedCbCache.get(fn);
			if (modifiedCbs[evtObj.evt]) {
				targetFn = modifiedCbs[evtObj.evt];
				//clear reference
				modifiedCbs[evtObj.evt] = null;
			}
		}
	}

	evt.off(newTarget, evtObj.evt, targetFn);
}


/**
 * Dispatch event to any target.
 *
 * @alias trigger
 * @alias fire
 * @alias dispatchEvent
 * @chainable
 */

enot.emit = function(target, evtRefs, data, bubbles){
	//if no target specified
	if (isString(target)) {
		bubbles = data;
		data = evtRefs;
		evtRefs = target;
		target = null;
	}
	//just fire straight event passed
	if (evtRefs instanceof Event) {
		evt.emit(target, evtRefs, data, bubbles);
		return enot;
	}

	if (!evtRefs) return enot;

	eachCSV(evtRefs, function(evtRef){
		var evtObj = parseReference(target, evtRef);

		if (!evtObj.evt) return;

		return applyModifiers.call(target, function(){
			var target = evtObj.targets;

			if (!target) return;

			//iterate list of targets
			if (isArrayLike(target)) {
				for (var i = target.length; i--;){
					evt.emit(target[i], evtObj.evt, data, bubbles);
				}
			}

			//fire single target
			else {
				evt.emit(target, evtObj.evt, data, bubbles);
			}

		}, evtObj.evt, evtObj.modifiers)();
	});

	return enot;
};



/* ---------------------- M O D I F I E R S ------------------ */


/** @type {Object} Keys shortcuts */
var keyDict = {
	'ENTER': 13,
	'ESCAPE': 27,
	'TAB': 9,
	'ALT': 18,
	'CTRL': 17,
	'SHIFT': 16,
	'SPACE': 32,
	'PAGE_UP': 33,
	'PAGE_DOWN': 34,
	'END': 35,
	'HOME': 36,
	'LEFT': 37,
	'UP': 38,
	'RIGHT': 39,
	'DOWN': 40,

	'F1': 112,
	'F2': 113,
	'F3': 114,
	'F4': 115,
	'F5': 116,
	'F6': 117,
	'F7': 118,
	'F8': 119,
	'F9': 120,
	'F10': 121,
	'F11': 122,
	'F12': 123,

	'LEFT_MOUSE': 1,
	'RIGHT_MOUSE': 3,
	'MIDDLE_MOUSE': 2
};


/** Return code to stop event chain */
var DENY_EVT_CODE = 1;


/** list of available event modifiers */
enot.modifiers = {};


/** call callback once */
enot.modifiers['once'] =
enot.modifiers['one'] = function(evt, fn, emptyArg, sourceFn){
	var cb = function(e){
		// console.log('once cb', fn)
		var result = fn && fn.call(this, e);
		//FIXME: `this` is not necessarily has `off`
		// console.log('off', fn)
		result !== DENY_EVT_CODE && enot.off(this, evt, sourceFn);
		return result;
	};
	return cb;
};


/**
 * filter keys
 * @alias keypass
 * @alias mousepass
 *
*/

enot.modifiers['filter'] =
enot.modifiers['pass'] = function(evt, fn, keys){
	keys = keys.split(commaSplitRe).map(upper);

	var cb = function(e){
		var pass = false, key;
		for (var i = keys.length; i--;){
			key = keys[i];
			var which = 'originalEvent' in e ? e.originalEvent.which : e.which;
			if ((key in keyDict && keyDict[key] == which) || which == key){
				pass = true;
				return fn.call(this, e);
			}
		}
		return DENY_EVT_CODE;
	};
	return cb;
};


/**
 * white-filter target
 * @alias live
 */

enot.modifiers['on'] =
enot.modifiers['delegate'] = function(evtName, fn, selector){
	// console.log('del', selector)
	var cb = function(evt){
		var el = evt.target;
		// console.log('delegate')

		//filter document/object/etc
		if (!isElement(el)) return DENY_EVT_CODE;

		//intercept bubbling event by delegator
		while (el && el !== doc && el !== this) {
			if (matches(el, selector)) {
				//set proper current el
				evt.delegateTarget = el;
				// evt.currentTarget = el;
				//NOTE: PhantomJS && IE8 fails on this
				// Object.defineProperty(evt, 'currentTarget', {
				// 	get: function(){
				// 		return el;
				// 	}
				// });
				return fn.call(this, evt);
			}
			el = el.parentNode;
		}

		return DENY_EVT_CODE;
	}

	return cb;
};


/**
 * black-filter target
 */

enot.modifiers['not'] = function(evt, fn, selector){
	var cb = function(e){
		// console.log('not cb', e, selector)
		var target = e.target;

		//traverse each node from target to holder and filter if event happened within banned element
		while (target) {
			if (target === doc || target === this) {
				return fn.call(this, e);
			}
			if (matches(target, selector)) return DENY_EVT_CODE;
			target = target.parentNode;
		}

		return DENY_EVT_CODE;
	};
	return cb;
};


var throttleCache = new WeakMap();


/**
 * throttle call
 */

enot.modifiers['throttle'] = function(evt, fn, interval){
	interval = parseFloat(interval);
	// console.log('thro', evt, fn, interval)
	var cb = function(e){
		// console.log('thro cb')
		var self = this;

		//FIXME: multiple throttles may interfere on target (key throttles by id)
		if (throttleCache.get(self)) return DENY_EVT_CODE;
		else {
			var result = fn.call(self, e);
			if (result === DENY_EVT_CODE) return result;
			throttleCache.set(self, setTimeout(function(){
				clearInterval(throttleCache.throttleKey);
				throttleCache.delete(self);
			}, interval));
		}
	}

	return cb;
};


/**
 * List of postponed calls intervals, keyed by evt name
 * @example
 * {click: 1,
 * track: 2}
 */
var dfdCalls = {};


/**
 * List of callbacks for intervals
 * To check passed off callback
 * To avoid unbinding all
 *
 * @example
 * {
 *  1: fn,
 *  2: fnRef
 * }
 */

var intervalCallbacks = {};


/**
 * Defer call - afnet Nms after real method/event
 *
 * @alias postpone
 * @param  {string}   evt   Event name
 * @param  {Function} fn    Handler
 * @param  {number|string}   delay Number of ms to wait
 * @param  {Function|string} sourceFn Source (unmodified) callback
 * @alias async
 * @return {Function}         Modified handler
 */

enot.modifiers['after'] =
enot.modifiers['defer'] = function(evt, fn, delay, sourceFn){
	delay = parseFloat(delay) || 0;

	var self = this;

	var cb = function(e){
		//plan fire of this event after N ms
		var interval = setTimeout(function(){
			var evtName =  evt + evtSeparator + interval;

			//fire once planned evt
			enot.emit(self, evtName, {sourceEvent: e});
			enot.off(self, evtName);

			//forget interval
			var idx = dfdCalls[evt].indexOf(interval);
			if (idx > -1) dfdCalls[evt].splice(idx, 1);
			intervalCallbacks[interval] = null;
		}, delay);

		//bind :one fire of this event
		enot.on(self, evt + evtSeparator + interval, sourceFn);

		//save planned interval for an evt
		(dfdCalls[evt] = dfdCalls[evt] || []).push(interval);

		//save callback for interval
		intervalCallbacks[interval] = sourceFn;

		return interval;
	};

	return cb;
};
},{"each-csv":2,"matches-selector":3,"muevents":4,"mustring":6,"mutypes":7}],2:[function(require,module,exports){
module.exports = eachCSV;

//match every comma-separated element ignoring 1-level parenthesis, like `1,2(3,4),5`
var commaMatchRe = /(,[^,]*?(?:\([^()]+\)[^,]*)?)(?=,|$)/g

//iterate over every item in string
function eachCSV(str, fn){
	if (typeof str !== 'string') return;

	var list = (',' + str).match(commaMatchRe) || [''];
	for (var i = 0; i < list.length; i++) {
		// console.log(matchStr)
		var matchStr = list[i].trim();
		if (matchStr[0] === ',') matchStr = matchStr.slice(1);
		matchStr = matchStr.trim();
		fn(matchStr, i);
	}
};
},{}],3:[function(require,module,exports){
'use strict';

var proto = Element.prototype;
var vendor = proto.matches
  || proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = el.parentNode.querySelectorAll(selector);
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == el) return true;
  }
  return false;
}
},{}],4:[function(require,module,exports){
var icicle = require('icicle');

/** @module muevents */
module.exports = {
	on: bind,
	off: unbind,
	emit: fire
};


/** jquery guarant */
var $ = typeof jQuery === 'undefined' ? undefined : jQuery;


/** set of target callbacks, {target: [cb1, cb2, ...]} */
var targetCbCache = new WeakMap;


/**
* Bind fn to the target
* @todo  recognize jquery object
* @chainable
*/
function bind(target, evt, fn){
	//walk by list of instances
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			bind(target, evt, fn[i]);
		}
		return;
	}


	//DOM events
	if (isDOMEventTarget(target)) {
		//bind target fn
		if ($){
			//delegate to jquery
			$(target).on(evt, fn);
		} else {
			//listen to element
			target.addEventListener(evt, fn);
		}
		//FIXME: old IE
	}

	//target events
	else {
		var onMethod = getMethodOneOf(target, onNames);

		//use target event system, if possible
		//avoid self-recursions from the outside
		if (onMethod) {
			//if it’s frozen - ignore call
			if (!icicle.freeze(target, onFlag)) return this;
			onMethod.call(target, evt, fn);
			icicle.unfreeze(target, onFlag);
		}
	}


	//Save callback
	//ensure callbacks array for target exist
	if (!targetCbCache.has(target)) targetCbCache.set(target, {});
	var targetCallbacks = targetCbCache.get(target);

	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);


	return this;
}



/**
* Bind fn to a target
* @chainable
*/
function unbind(target, evt, fn){
	//unbind all listeners passed
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			unbind(target, evt, fn[i]);
		}
		return;
	}


	//unbind all listeners if no fn specified
	if (fn === undefined) {
		var callbacks = targetCbCache.get(target);
		if (!callbacks) return;
		//unbind all if no evtRef defined
		if (evt === undefined) {
			for (var evtName in callbacks) {
				unbind(target, evtName, callbacks[evtName]);
			}
		}
		else if (callbacks[evt]) {
			unbind(target, evt, callbacks[evt]);
		}
		return;
	}


	//DOM events
	if (isDOMEventTarget(target)) {
		//delegate to jquery
		if ($){
			$(target).off(evt, fn);
		}

		//listen to element
		else {
			target.removeEventListener(evt, fn);
		}
	}

	//target events
	else {
		var offMethod = getMethodOneOf(target, offNames);

		//use target event system, if possible
		//avoid self-recursion from the outside
		if (offMethod) {
			//if it’s frozen - ignore call
			if (!icicle.freeze(target, offFlag)) return this;
			offMethod.call(target, evt, fn);
			icicle.unfreeze(target, offFlag);
		}
	}


	//Forget callback
	//ignore if no event specified
	if (!targetCbCache.has(target)) return;

	var evtCallbacks = targetCbCache.get(target)[evt];

	if (!evtCallbacks) return;

	//remove specific handler
	for (var i = 0; i < evtCallbacks.length; i++) {
		if (evtCallbacks[i] === fn) {
			evtCallbacks.splice(i, 1);
			break;
		}
	}


	return this;
}



/**
* Event trigger
* @chainable
*/
function fire(target, eventName, data, bubbles){
	if (!target) return;


	//DOM events
	if (isDOMEventTarget(target)) {
		if ($){
			//TODO: decide how to pass data
			var evt = $.Event( eventName, data );
			evt.detail = data;
			bubbles ? $(target).trigger(evt) : $(target).triggerHandler(evt);
		} else {
			//NOTE: this doesnot bubble on disattached elements
			var evt;

			if (eventName instanceof Event) {
				evt = eventName;
			} else {
				evt =  document.createEvent('CustomEvent');
				evt.initCustomEvent(eventName, bubbles, true, data);
			}

			// var evt = new CustomEvent(eventName, { detail: data, bubbles: bubbles })

			target.dispatchEvent(evt);
		}
	}

	//no-DOM events
	else {
		//Target events
		var emitMethod = getMethodOneOf(target, emitNames);

		//use locks to avoid self-recursion on objects wrapping this method (e. g. mod instances)
		if (emitMethod) {
			if (icicle.freeze(target, emitFlag)) {
				//use target event system, if possible
				emitMethod.call(target, eventName, data);
				icicle.unfreeze(target, emitFlag);
				return this;
			}
			//if event was frozen - perform normal callback
		}


		//fall back to default event system
		//ignore if no event specified
		if (!targetCbCache.has(target)) return this;

		var evtCallbacks = targetCbCache.get(target)[eventName];

		if (!evtCallbacks) return this;

		//copy callbacks to fire because list can change in some handler
		var fireList = evtCallbacks.slice();
		for (var i = 0; i < fireList.length; i++ ) {
			fireList[i] && fireList[i].call(target, {
				detail: data,
				type: eventName
			});
		}
	}


	return this;
}



/**
 * detect whether DOM element implements EventTarget interface
 * @todo detect eventful objects in a more wide way
 */
function isDOMEventTarget (target){
	return target && target.addEventListener;
}


/** List of methods */
var onNames = ['on', 'bind', 'addEventListener', 'addListener'];
var offNames = ['off', 'unbind', 'removeEventListener', 'removeListener'];
var emitNames = ['emit', 'trigger', 'fire', 'dispatchEvent'];


/** Locker flags */
var emitFlag = emitNames[0], onFlag = onNames[0], offFlag = offNames[0];


/**
 * Return target’s method one of passed list, if it is eventable
 */
function getMethodOneOf (target, list){
	var result;
	for (var i = 0, l = list.length; i < l; i++) {
		result = target[list[i]];
		if (result) return result;
	}
}
},{"icicle":5}],5:[function(require,module,exports){
/**
 * @module Icicle
 */
module.exports = {
	freeze: lock,
	unfreeze: unlock,
	isFrozen: isLocked
};


/** Set of targets  */
var lockCache = new WeakMap;


/**
 * Set flag on target with the name passed
 *
 * @return {bool} Whether lock succeeded
 */
function lock(target, name){
	var locks = lockCache.get(target);
	if (locks && locks[name]) return false;

	//create lock set for a target, if none
	if (!locks) {
		locks = {};
		lockCache.set(target, locks);
	}

	//set a new lock
	locks[name] = true;

	//return success
	return true;
}


/**
 * Unset flag on the target with the name passed.
 *
 * Note that if to return new value from the lock/unlock,
 * then unlock will always return false and lock will always return true,
 * which is useless for the user, though maybe intuitive.
 *
 * @param {*} target Any object
 * @param {string} name A flag name
 *
 * @return {bool} Whether unlock failed.
 */
function unlock(target, name){
	var locks = lockCache.get(target);
	if (!locks || !locks[name]) return false;

	locks[name] = null;

	return true;
}


/**
 * Return whether flag is set
 *
 * @param {*} target Any object to associate lock with
 * @param {string} name A flag name
 *
 * @return {Boolean} Whether locked or not
 */
function isLocked(target, name){
	var locks = lockCache.get(target);
	return (locks && locks[name]);
}
},{}],6:[function(require,module,exports){
module.exports = {
	camel:camel,
	dashed:dashed,
	upper:upper,
	lower:lower,
	capfirst:capfirst,
	unprefixize:unprefixize
};

//camel-case → CamelCase
function camel(str){
	return str && str.replace(/-[a-z]/g, function(match, position){
		return upper(match[1])
	})
}

//CamelCase → camel-case
function dashed(str){
	return str && str.replace(/[A-Z]/g, function(match, position){
		return (position ? '-' : '') + lower(match)
	})
}

//uppercaser
function upper(str){
	return str.toUpperCase();
}

//lowercasify
function lower(str){
	return str.toLowerCase();
}

//aaa → Aaa
function capfirst(str){
	str+='';
	if (!str) return str;
	return upper(str[0]) + str.slice(1);
}

// onEvt → envt
function unprefixize(str, pf){
	return (str.slice(0,pf.length) === pf) ? lower(str.slice(pf.length)) : str;
}
},{}],7:[function(require,module,exports){
/**
* Trivial types checkers.
* Because there’re no common lib for that ( lodash_ is a fatguy)
*/
//TODO: make main use as `is.array(target)`

module.exports = {
	has: has,
	isObject: isObject,
	isFn: isFn,
	isString: isString,
	isNumber: isNumber,
	isBool: isBool,
	isPlain: isPlain,
	isArray: isArray,
	isArrayLike: isArrayLike,
	isElement: isElement,
	isPrivateName: isPrivateName
};

var win = typeof window === 'undefined' ? this : window;

//speedy impl,ementation of `in`
//NOTE: `!target[propName]` 2-3 orders faster than `!(propName in target)`
function has(a, b){
	if (!a) return false;
	//NOTE: this causes getter fire
	if (a[b]) return true;
	return b in a;
	// return a.hasOwnProperty(b);
}

//isPlainObject
function isObject(a){
	var Ctor, result;

	if (isPlain(a) || isArray(a) || isElement(a) || isFn(a)) return false;

	// avoid non `Object` objects, `arguments` objects, and DOM elements
	if (
		//FIXME: this condition causes weird behaviour if a includes specific valueOf or toSting
		// !(a && ('' + a) === '[object Object]') ||
		(!has(a, 'constructor') && (Ctor = a.constructor, isFn(Ctor) && !(Ctor instanceof Ctor))) ||
		!(typeof a === 'object')
		) {
		return false;
	}
	// In most environments an object's own properties are iterated before
	// its inherited properties. If the last iterated property is an object's
	// own property then there are no inherited enumerable properties.
	for(var key in a) {
		result = key;
	};

	return typeof result == 'undefined' || has(a, result);
}

function isFn(a){
	return !!(a && a.apply);
}

function isString(a){
	return typeof a === 'string';
}

function isNumber(a){
	return typeof a === 'number';
}

function isBool(a){
	return typeof a === 'boolean';
}

function isPlain(a){
	return !a || isString(a) || isNumber(a) || isBool(a);
}

function isArray(a){
	return a instanceof Array;
}

//FIXME: add tests from http://jsfiddle.net/ku9LS/1/
function isArrayLike(a){
	return isArray(a) || (a && !isString(a) && !a.nodeType && a != win && !isFn(a) && typeof a.length === 'number');
}

function isElement(target){
	if (typeof doc === 'undefined') return;
	return target instanceof HTMLElement;
}

function isPrivateName(n){
	return n[0] === '_' && n.length > 1;
}
},{}]},{},[1])(1)
});