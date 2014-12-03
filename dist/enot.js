!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global = (1, eval)('this');

//doc shorthand & DOM detector
var doc = global.document;

if (doc) {
	var matches = require('matches-selector');
	var q = require('query-relative');
} else {
	var matches = noop;
	var q = noop;
}

var eachCSV = require('each-csv');
var Emitter = require('emmy');
var type = require('mutype');


var isString = type.isString;
var isElement = type.isElement;
var isArrayLike = type.isArrayLike;
var has = type.has;
var unprefix = require('mustring/unprefix');
var upper = require('mustring/upper');



/** Separator to specify events, e.g. click-1 (means interval=1 planned callback of click) */
var evtSeparator = '-';


/* ------------------------------ C O N S T R U C T O R ------------------------------ */


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
	for (var meth in EnotProto){
		target[meth] = EnotProto[meth];
	}

	return target;
}

var EnotProto = Enot.prototype = Object.create(Emitter.prototype);



/* -----------------------------------  O  N  ---------------------------------------- */


/**
 * Listed reference binder (comma-separated references)
 *
 * @alias addEventListener
 * @alias bind
 * @chainable
 */
EnotProto.addEventListener =
EnotProto.on = function(evtRefs, fn){
	var target = this;

	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//no events passed
	if (!evtRefs) return target;

	//in bulk events passed
	if (type.isObject(evtRefs)){
		for (var evtRef in evtRefs){
			EnotProto.on.call(target, evtRef, evtRefs[evtRef]);
		}

		return target;
	}

	eachCSV(evtRefs, function(evtRef){
		_on(target, evtRef, fn);
	});

	return target;
};


/**
 * Listed ref binder with :one modifier
 *
 * @chainable
 */
EnotProto.once =
EnotProto.one = function(evtRefs, fn){
	var target = this;

	//append ':one' to each event from the references passed
	var processedRefs = '';
	eachCSV(evtRefs, function(item){
		processedRefs += item + ':one, ';
	});
	processedRefs = processedRefs.slice(0, -2);

	return EnotProto.on.call(target, processedRefs, fn);
};




/**
 * Bind single reference (no comma-declared references).
 *
 * @param {*} target A target to relate reference, `document` by default.
 * @param {string} evtRef Event reference, like `click:defer` etc.
 * @param {Function} fn Callback.
 */
function _on(target, evtRef, fn) {
	//ignore empty fn
	if (!fn) return target;

	var evtObj = parseReference(target, evtRef);

	var targets = evtObj.targets;

	//ignore not bindable sources
	if (!targets) return target;

	//iterate list of targets
	if (isArrayLike(targets)) {
		for (var i = targets.length; i--;){
			// _on(targets[i], evtObj.evt, fn);
			Emitter.on(targets[i], evtObj.evt, getModifiedFn(target, fn, targets[i], evtObj.evt, evtObj.modifiers));
		}

		return target;
	}

	//target is one indeed
	var newTarget = targets;
	// console.log('on', newTarget, evtObj.evt, evtObj.modifiers)
	Emitter.on(newTarget, evtObj.evt, getModifiedFn(target, fn, newTarget, evtObj.evt, evtObj.modifiers));

	return target;
}



/* -----------------------------------  O  F  F  ------------------------------------- */


/**
 * Listed reference unbinder
 *
 * @alias removeEventListener
 * @alias unbind
 * @chainable
 */
EnotProto.removeEventListener =
EnotProto.removeListener =
EnotProto.removeAllListeners =
EnotProto.off = function(evtRefs, fn){
	var target = this;

	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//unbind all events
	if(!evtRefs) {
		Emitter.off(target);
	}

	//in bulk events passed
	else if (type.isObject(evtRefs)){
		for (var evtRef in evtRefs){
			EnotProto.off.call(target, evtRef, evtRefs[evtRef]);
		}
	}

	else {
		eachCSV(evtRefs, function(evtRef){
			_off(target, evtRef, fn);
		});
	}

	return target;
};


/**
 * Single reference unbinder
 *
 * @param {Element} target Target to unbind event, optional
 * @param {string} evtRef Event notation
 * @param {Function} fn callback
 */
function _off(target, evtRef, fn){
	var evtObj = parseReference(target, evtRef);
	var targets = evtObj.targets;
	var targetFn = fn;

	if (!targets) return target;

	//iterate list of targets
	if (isArrayLike(targets)) {
		for (var i = targets.length; i--;){
			//FIXME: check whether it is possible to use Emitter.off straightforwardly
			_off(targets[i], evtObj.evt, fn, true);
		}

		return target;
	}

	var newTarget = targets;

	//clear planned calls for an event
	if (dfdCalls[evtObj.evt]) {
		for (var i = 0; i < dfdCalls[evtObj.evt].length; i++){
			if (intervalCallbacks[dfdCalls[evtObj.evt][i]] === fn)
				Emitter.off(newTarget, evtObj.evt + evtSeparator + dfdCalls[evtObj.evt][i]);
		}
	}

	//unbind all
	if (!fn) {
		Emitter.off(newTarget, evtObj.evt);
	}

	//unbind all callback modified variants
	else {
		var modifiedFns = getModifiedFns(fn, newTarget, evtObj.evt);
		for (var i = modifiedFns.length, unbindCb; i--;){
			unbindCb = modifiedFns.pop();
			Emitter.off(newTarget, evtObj.evt, unbindCb);
		}
	}
}


/**
 * Dispatch event to any target.
 *
 * @alias trigger
 * @alias fire
 * @alias dispatchEvent
 * @chainable
 */
EnotProto.dispatchEvent =
EnotProto.emit = function(evtRefs, data, bubbles){
	var target = this;

	//if no target specified
	if (isString(target)) {
		bubbles = data;
		data = evtRefs;
		evtRefs = target;
		target = null;
	}

	//just fire straight event passed
	if (evtRefs instanceof Event) {
		Emitter.emit(target, evtRefs, data, bubbles);
		return target;
	}

	if (!evtRefs) return target;

	eachCSV(evtRefs, function(evtRef){
		var evtObj = parseReference(target, evtRef);

		if (!evtObj.evt) return target;

		return applyModifiers(function(){
			var target = evtObj.targets;

			if (!target) return target;

			//iterate list of targets
			if (isArrayLike(target)) {
				for (var i = target.length; i--;){
					Emitter.emit(target[i], evtObj.evt, data, bubbles);
				}
			}

			//fire single target
			else {
				// console.log('emit', target, evtObj.evt)
				Emitter.emit(target, evtObj.evt, data, bubbles);
			}

		}, evtObj.evt, evtObj.modifiers)();
	});

	return target;
};



/* -------------------------------- M O D I F I E R S -------------------------------- */


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
Enot.modifiers = {};


/** call callback once */
//TODO: think up the way to use Emmy.one instead
Enot.modifiers['once'] =
Enot.modifiers['one'] = function(evt, fn, emptyArg, sourceFn){
	var cb = function(e){
		var result = fn && fn.call(this, e);
		//FIXME: `this` is not necessarily has `off`
		// console.log('off', fn, Emitter.listeners(this, evt)[0] === sourceFn)
		result !== DENY_EVT_CODE && Enot.off(this, evt, sourceFn);
		return result;
	};
	return cb;
};


/**
 * filter keys
 * @alias keypass
 * @alias mousepass
 * @alias filter
 */

Enot.modifiers['pass'] = function(evt, fn, keys){
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
 * @alias on
 */
Enot.modifiers['delegate'] = function(evtName, fn, selector){
	// console.log('del', selector)
	var cb = function(evt){
		var el = evt.target;

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
	};

	return cb;
};


/**
 * black-filter target
 */
Enot.modifiers['not'] = function(evt, fn, selector){
	var cb = function(e){
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
Enot.modifiers['throttle'] = function(evt, fn, interval){
	interval = parseFloat(interval);
	// console.log('thro', evt, fn, interval)
	var cb = function(e){
		return Enot.throttle.call(this, fn, interval, e);
	};

	return cb;
};
Enot.throttle = function(fn, interval, e){
	var self = this;

	//FIXME: multiple throttles may interfere on target (key throttles by id)
	if (throttleCache.get(self)) return DENY_EVT_CODE;
	else {
		var result = fn.call(self, e);

		//if cb falsed, ignore
		if (result === DENY_EVT_CODE) return result;

		throttleCache.set(self, setTimeout(function(){
			clearInterval(throttleCache.get(self));
			throttleCache.delete(self);
		}, interval));
	}
};


/**
 * List of postponed calls intervals, keyed by evt name
 * @example
 * {
 * 	click: 1,
 *  track: 2
 * }
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
 *
 * @alias async
 * @alias after
 *
 * @return {Function}         Modified handler
 */
Enot.modifiers['defer'] = function(evt, fn, delay, sourceFn){
	delay = parseFloat(delay) || 0;

	var cb = function(e){
		var self = this;

		//plan fire of this event after N ms
		var interval = setTimeout(function(){
			var evtName =  evt + evtSeparator + interval;

			//fire once planned evt
			Emitter.emit(self, evtName, {sourceEvent: e});
			Emitter.off(self, evtName);

			//forget interval
			var idx = dfdCalls[evt].indexOf(interval);
			if (idx > -1) dfdCalls[evt].splice(idx, 1);
			intervalCallbacks[interval] = null;
		}, delay);

		//bind :one fire of this event
		Emitter.on(self, evt + evtSeparator + interval, sourceFn);

		//save planned interval for an evt
		(dfdCalls[evt] = dfdCalls[evt] || []).push(interval);

		//save callback for interval
		intervalCallbacks[interval] = sourceFn;

		return interval;
	};

	return cb;
};



/* -------------------------------  H  E  L  P  E  R  S ------------------------------ */


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

	result.targets = parseTargets(target, string);

	//parse modifiers
	var eventParams = unprefix(eventString, 'on').split(':');

	//get event name
	result.evt = eventParams.shift();
	result.modifiers = eventParams.sort(function(a,b){
		//one should go last because it turns off passed event
		return /^one/.test(a) ? 1 : a > b ? 1 : -1;
	});

	return result;
}


/**
 * Retrieve source element from string
 *
 * @param  {Element|Object} target A target to relate to
 * @param  {string}         str    Target reference
 *
 * @return {*}                     Resulting target found
 */
function parseTargets(target, str) {
	// console.log('parseTarget `' + str + '`', target)

	//no target mean global target
	if (!target) target = global;

	//no string mean self evt
	if (!str){
		return target;
	}

	//return self reference
	if(str[0] === '@'){
		return getProperty(target, str.slice(1));
	}

	else if(str === 'window') return global;
	else if(str === 'document') return doc;

	//query relative selector
	else {
		return q(target, str, true);
	}
}


/**
 * Get property defined by dot notation in string.
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


/** Per-callback target cache */
var targetsCache = new WeakMap();


/** Get modified fn taking into account all possible specific case params
 *
 * Fn has a dict of targets
 * Target has a dict of events
 * Event has a list of modified-callbacks
 */
function getModifiedFn(initialTarget, fn, target, evt, modifiers){
	if (!fn) return fn;

	var targetFn = fn;

	if (!initialTarget) initialTarget = target;

	targetFn = getRedirector(targetFn);

	var modifierFns = getModifiedFns(targetFn, target, evt);

	//save callback
	var modifiedCb = applyModifiers(targetFn, evt, modifiers);

	//rebind context, if targets differs
	if (initialTarget !== target) {
		//FIXME: simplify bind here - it is too weighty
		modifiedCb = modifiedCb.bind(initialTarget);
	}
	modifierFns.push(modifiedCb);

	return modifiedCb;
}


/**
 * Return dict of modified fns for an fn, keyed by modifiers
 */
function getModifiedFns(targetFn, target, evt){
	targetFn = getRedirector(targetFn);

	//fn has a set of targets (contexts)
	var targetsDict = targetsCache.get(targetFn);
	if (!targetsDict) {
		//FIXME: think about flattening this
		targetsDict = new WeakMap();
		targetsCache.set(targetFn, targetsDict);
	}

	//target has a set of events (bound events)
	var eventsDict = targetsDict.get(target);
	if (!eventsDict) {
		eventsDict = {};
		targetsDict.set(target, eventsDict);
	}

	//each event bound has a list of modified cbs (not dict due to we don’t need dict cause off always for all modified cbs)
	var modifiersList = eventsDict[evt];
	if (!modifiersList) {
		modifiersList = [];
		eventsDict[evt] = modifiersList;
	}

	return modifiersList;
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

	modifiers.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length + 1, -1);

		if (Enot.modifiers[modifierName]) {
			//create new context each call
			targetFn = Enot.modifiers[modifierName](evt, targetFn, modifierParams, fn);
		}
	});

	return targetFn;
}


/** set of redirect functions keyed by redirect cb
 * They’re context independent so we can keep them in memory
 */
var redirectSet = {};


/**
 * Return redirection statements handler.
 *
 * @param    {string}   redirectTo   Redirect declaration (other event notation)
 * @return   {function}   Callback which fires redirects
 */
function getRedirector(redirectTo){
	//return non-plain redirector
	if (!type.isPlain(redirectTo)) return redirectTo;

	//return redirector, if exists
	if (redirectSet[redirectTo]) return redirectSet[redirectTo];

	//create redirector
	var cb = function(e){
		var self = this;
		eachCSV(redirectTo, function(evt){
			if (defaultRedirectors[evt]) defaultRedirectors[evt].call(self, e);
			Enot.emit(self, evt, e.detail, e.bubbles);
		});
	};

	//save redirect fn to cache
	redirectSet[redirectTo] = cb;

	return cb;
}


/**
 * Utility callbacks shortcuts
 */
var defaultRedirectors = {
	preventDefault: function (e) {
		e.preventDefault && e.preventDefault();
	},
	stopPropagation: function (e) {
		e.stopPropagation && e.stopPropagation();
	},
	stopImmediatePropagation: function (e) {
		e.stopImmediatePropagation && e.stopImmediatePropagation();
	},
	noop: noop
};

function noop(){};


/** Static aliases for old API compliance */
Emitter.bindStaticAPI.call(Enot);


/** @module enot */
module.exports = Enot;
},{"each-csv":2,"emmy":3,"matches-selector":5,"mustring/unprefix":7,"mustring/upper":8,"mutype":10,"query-relative":23}],2:[function(require,module,exports){
module.exports = eachCSV;

/** match every comma-separated element ignoring 1-level parenthesis, e.g. `1,2(3,4),5` */
var commaMatchRe = /(,[^,]*?(?:\([^()]+\)[^,]*)?)(?=,|$)/g;

/** iterate over every item in string */
function eachCSV(str, fn){
	if (!str) return;

	//force string be primitive
	str += '';

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
var icicle = require('icicle');


/** environment guarant */
var $ = typeof jQuery === 'undefined' ? undefined : jQuery;
var doc = typeof document === 'undefined' ? undefined : document;
var win = typeof window === 'undefined' ? undefined : window;


/** Lists of methods */
var onNames = ['on', 'bind', 'addEventListener', 'addListener'];
var oneNames = ['one', 'once', 'addOnceEventListener', 'addOnceListener'];
var offNames = ['off', 'unbind', 'removeEventListener', 'removeListener'];
var emitNames = ['emit', 'trigger', 'fire', 'dispatchEvent'];

/** Locker flags */
var emitFlag = emitNames[0], onFlag = onNames[0], oneFlag = onNames[0], offFlag = offNames[0];


/**
 * @constructor
 *
 * Main EventEmitter interface.
 * Wraps any target passed to an Emitter interface
 */
function Emmy(target){
	if (!target) return;

	//create emitter methods on target, if none
	if (!getMethodOneOf(target, onNames)) target.on = EmmyPrototype.on.bind(target);
	if (!getMethodOneOf(target, offNames)) target.off = EmmyPrototype.off.bind(target);
	if (!getMethodOneOf(target, oneNames)) target.one = target.once = EmmyPrototype.one.bind(target);
	if (!getMethodOneOf(target, emitNames)) target.emit = EmmyPrototype.emit.bind(target);

	return target;
}


/** Make DOM objects be wrapped as jQuery objects, if jQuery is enabled */
var EmmyPrototype = Emmy.prototype;


/**
 * Return target’s method one of the passed in list, if target is eventable
 * Use to detect whether target has some fn
 */
function getMethodOneOf(target, list){
	var result;
	for (var i = 0, l = list.length; i < l; i++) {
		result = target[list[i]];
		if (result) return result;
	}
}


/** Set of target callbacks, {target: [cb1, cb2, ...]} */
var targetCbCache = new WeakMap;


/**
* Bind fn to the target
* @todo  recognize jquery object
* @chainable
*/
EmmyPrototype.on =
EmmyPrototype.addEventListener = function(evt, fn){
	var target = this;

	//walk by list of instances
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.on.call(target, evt, fn[i]);
		}
		return target;
	}

	//target events
	var onMethod = getMethodOneOf(target, onNames);

	//use target event system, if possible
	//avoid self-recursions from the outside
	if (onMethod && onMethod !== EmmyPrototype.on) {
		//if it’s frozen - ignore call
		if (icicle.freeze(target, onFlag + evt)){
			onMethod.call(target, evt, fn);
			icicle.unfreeze(target, onFlag + evt);
		}
		else {
			return target;
		}
	}

	saveCallback(target, evt, fn);

	return target;
};


/**
 * Add callback to the list of callbacks associated with target
 */
function saveCallback(target, evt, fn){
	//ensure callbacks array for target exists
	if (!targetCbCache.has(target)) targetCbCache.set(target, {});
	var targetCallbacks = targetCbCache.get(target);

	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);
}


/**
 * Add an event listener that will be invoked once and then removed.
 *
 * @return {Emmy}
 * @chainable
 */
EmmyPrototype.once =
EmmyPrototype.one = function(evt, fn){
	var target = this;

	//walk by list of instances
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.one.call(target, evt, fn[i]);
		}
		return target;
	}

	//target events
	var oneMethod = getMethodOneOf(target, oneNames);

	//use target event system, if possible
	//avoid self-recursions from the outside
	if (oneMethod && oneMethod !== EmmyPrototype.one) {
		if (icicle.freeze(target, oneFlag + evt)){
			//use target event system, if possible
			oneMethod.call(target, evt, fn);
			saveCallback(target, evt, fn);
			icicle.unfreeze(target, oneFlag + evt);
		}

		else {
			return target;
		}
	}

	//wrap callback to once-call
	function cb() {
		EmmyPrototype.off.call(target, evt, cb);
		fn.apply(target, arguments);
	}

	cb.fn = fn;

	//bind wrapper default way
	EmmyPrototype.on.call(target, evt, cb);

	return target;
};


/**
* Bind fn to a target
* @chainable
*/
EmmyPrototype.off =
EmmyPrototype.removeListener =
EmmyPrototype.removeAllListeners =
EmmyPrototype.removeEventListener = function (evt, fn){
	var target = this;

	//unbind all listeners passed
	if (fn instanceof Array){
		for (var i = fn.length; i--;){
			EmmyPrototype.off.call(target, evt, fn[i]);
		}
		return target;
	}


	//unbind all listeners if no fn specified
	if (fn === undefined) {
		var callbacks = targetCbCache.get(target);
		if (!callbacks) return target;
		//unbind all if no evtRef defined
		if (evt === undefined) {
			for (var evtName in callbacks) {
				EmmyPrototype.off.call(target, evtName, callbacks[evtName]);
			}
		}
		else if (callbacks[evt]) {
			EmmyPrototype.off.call(target, evt, callbacks[evt]);
		}
		return target;
	}


	//target events
	var offMethod = getMethodOneOf(target, offNames);

	//use target event system, if possible
	//avoid self-recursion from the outside
	if (offMethod && offMethod !== EmmyPrototype.off) {
		if (icicle.freeze(target, offFlag + evt)){
			offMethod.call(target, evt, fn);
			icicle.unfreeze(target, offFlag + evt);
		}
		//if it’s frozen - ignore call
		else {
			return target;
		}
	}


	//Forget callback
	//ignore if no event specified
	if (!targetCbCache.has(target)) return target;

	var evtCallbacks = targetCbCache.get(target)[evt];

	if (!evtCallbacks) return target;

	//remove specific handler
	for (var i = 0; i < evtCallbacks.length; i++) {
		if (evtCallbacks[i] === fn || evtCallbacks[i].fn === fn) {
			evtCallbacks.splice(i, 1);
			break;
		}
	}

	return target;
};



/**
* Event trigger
* @chainable
*/
EmmyPrototype.emit =
EmmyPrototype.dispatchEvent = function(eventName, data, bubbles){
	var target = this, emitMethod, evt = eventName;
	if (!target) return;

	//Create proper event for DOM objects
	if (target.nodeType || target === doc || target === win) {
		//NOTE: this doesnot bubble on disattached elements

		if (eventName instanceof Event) {
			evt = eventName;
		} else {
			evt =  document.createEvent('CustomEvent');
			evt.initCustomEvent(eventName, bubbles, true, data);
		}

		// var evt = new CustomEvent(eventName, { detail: data, bubbles: bubbles })

		emitMethod = target.dispatchEvent;
	}

	//create event for jQuery object
	else if ($ && target instanceof $) {
		//TODO: decide how to pass data
		var evt = $.Event( eventName, data );
		evt.detail = data;
		emitMethod = bubbles ? targte.trigger : target.triggerHandler;
	}

	//Target events
	else {
		emitMethod = getMethodOneOf(target, emitNames);
	}


	//use locks to avoid self-recursion on objects wrapping this method (e. g. mod instances)
	if (emitMethod && emitMethod !== EmmyPrototype.emit) {
		if (icicle.freeze(target, emitFlag + eventName)) {
			//use target event system, if possible
			emitMethod.call(target, evt, data, bubbles);
			icicle.unfreeze(target, emitFlag + eventName);
			return target;
		}
		//if event was frozen - perform normal callback
	}


	//fall back to default event system
	//ignore if no event specified
	if (!targetCbCache.has(target)) return target;

	var evtCallbacks = targetCbCache.get(target)[evt];

	if (!evtCallbacks) return target;

	//copy callbacks to fire because list can be changed in some handler
	var fireList = evtCallbacks.slice();
	for (var i = 0; i < fireList.length; i++ ) {
		fireList[i] && fireList[i].call(target, {
			detail: data,
			type: eventName
		});
	}

	return target;
};


/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

EmmyPrototype.listeners = function(evt){
	var callbacks = targetCbCache.get(this);
	return callbacks && callbacks[evt] || [];
};


/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

EmmyPrototype.hasListeners = function(evt){
	return !!EmmyPrototype.listeners.call(this, evt).length;
};



/** Static aliases for old API compliance */
Emmy.bindStaticAPI = function(){
	var self = this, proto = self.prototype;

	for (var name in proto) {
		if (proto[name]) self[name] = createStaticBind(name);
	}

	function createStaticBind(methodName){
		return function(a, b, c, d){
			var res = proto[methodName].call(a,b,c,d);
			return res === a ? self : res;
		};
	}
};
Emmy.bindStaticAPI();


/** @module muevents */
module.exports = Emmy;
},{"icicle":4}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
//lowercasify
module.exports = function(str){
	return str.toLowerCase();
}
},{}],7:[function(require,module,exports){
// onEvt → envt
module.exports = function(str, pf){
	return (str.slice(0,pf.length) === pf) ? require('./lower')(str.slice(pf.length)) : str;
}
},{"./lower":6}],8:[function(require,module,exports){
//uppercaser
module.exports = function(str){
	return str.toUpperCase();
}

},{}],9:[function(require,module,exports){
//speedy impl,ementation of `in`
//NOTE: `!target[propName]` 2-3 orders faster than `!(propName in target)`
module.exports = function(a, b){
	if (!a) return false;
	//NOTE: this causes getter fire
	if (a[b]) return true;
	return b in a;
	// return a.hasOwnProperty(b);
}

},{}],10:[function(require,module,exports){
/**
* Trivial types checkers.
* Because there’re no common lib for that ( lodash_ is a fatguy)
*/
//TODO: make main use as `is.array(target)`
//TODO: separate by libs, included per-file

module.exports = {
	has: require('./has'),
	isObject: require('./is-object'),
	isFn: require('./is-fn'),
	isString: require('./is-string'),
	isNumber: require('./is-number'),
	isBoolean: require('./is-bool'),
	isPlain: require('./is-plain'),
	isArray: require('./is-array'),
	isArrayLike: require('./is-array-like'),
	isElement: require('./is-element'),
	isPrivateName: require('./is-private-name'),
	isRegExp: require('./is-regex'),
	isEmpty: require('./is-empty')
};

},{"./has":9,"./is-array":12,"./is-array-like":11,"./is-bool":13,"./is-element":14,"./is-empty":15,"./is-fn":16,"./is-number":17,"./is-object":18,"./is-plain":19,"./is-private-name":20,"./is-regex":21,"./is-string":22}],11:[function(require,module,exports){
var isString = require('./is-string');
var isArray = require('./is-array');
var isFn = require('./is-fn');

//FIXME: add tests from http://jsfiddle.net/ku9LS/1/
module.exports = function (a){
	return isArray(a) || (a && !isString(a) && !a.nodeType && (typeof window != 'undefined' ? a != window : true) && !isFn(a) && typeof a.length === 'number');
}
},{"./is-array":12,"./is-fn":16,"./is-string":22}],12:[function(require,module,exports){
module.exports = function(a){
	return a instanceof Array;
}
},{}],13:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'boolean' || a instanceof Boolean;
}
},{}],14:[function(require,module,exports){
module.exports = function(target){
	return typeof document !== 'undefined' && target instanceof HTMLElement;
}
},{}],15:[function(require,module,exports){
module.exports = function(a){
	if (!a) return true;
	for (var k in a) {
		return false;
	}
	return true;
}
},{}],16:[function(require,module,exports){
module.exports = function(a){
	return !!(a && a.apply);
}
},{}],17:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'number' || a instanceof Number;
}
},{}],18:[function(require,module,exports){
var isPlain = require('./is-plain');
var isArray = require('./is-array');
var isElement = require('./is-element');
var isFn = require('./is-fn');
var has = require('./has');

//isPlainObject
module.exports = function(a){
	var Ctor, result;

	if (isPlain(a) || isArray(a) || isElement(a) || isFn(a)) return false;

	// avoid non `Object` objects, `arguments` objects, and DOM elements
	if (
		//FIXME: this condition causes weird behaviour if a includes specific valueOf or toSting
		!(a && ('' + a) === '[object Object]') ||
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

},{"./has":9,"./is-array":12,"./is-element":14,"./is-fn":16,"./is-plain":19}],19:[function(require,module,exports){
var isString = require('./is-string'),
	isNumber = require('./is-number'),
	isBool = require('./is-bool');

module.exports = function isPlain(a){
	return !a || isString(a) || isNumber(a) || isBool(a);
};
},{"./is-bool":13,"./is-number":17,"./is-string":22}],20:[function(require,module,exports){
module.exports = function(n){
	return n[0] === '_' && n.length > 1;
}

},{}],21:[function(require,module,exports){
module.exports = function(target){
	return target instanceof RegExp;
}
},{}],22:[function(require,module,exports){
module.exports = function(a){
	return typeof a === 'string' || a instanceof String;
}
},{}],23:[function(require,module,exports){
var doc = document, root = doc.documentElement;


var _q = require('tiny-element');
var matches = require('matches-selector');


//TODO: detect inner parenthesis, like :closest(:not(abc))

/**
 * @module query-relative
 */
module.exports = function(targets, str, multiple){
	//no target means global target
	if (typeof targets === 'string') {
		multiple = str;
		str = targets;
		targets = doc;
	}

	var res = q(targets,str);

	return !multiple && isList(res) ? res[0] : unique(res);
};


/**
 * Query selector including initial pseudos, return list
 *
 * @param {string} str A query string
 * @param {Element}? target A query context element
 *
 * @return {[type]} [description]
 */
function q(targets, str) {
	//if targets is undefined, perform usual global query
	if (!targets) targets = this;


	//treat empty string as a target itself
	if (!str){
		// console.groupEnd();
		return targets;
	}

	//filter window etc non-queryable objects
	if (targets === window) targets === doc;
	else if (!(targets instanceof Node) && !isList(targets)) {
		// console.groupEnd();
		return targets;
	}


	var m, result;
	// console.group(targets, str, isList(targets))

	//detect whether query includes special pseudos
	if (m = /:(parent|closest|next|prev|root)(?:\(([^\)]*)\))?/.exec(str)) {
		var pseudo = m[1], idx = m.index, param = m[2], token = m[0];

		//1. pre-query
		if (idx) {
			targets = queryList(targets, str.slice(0, idx), true);
		}

		//2. query
		result = transformSet(targets, pseudos[pseudo], param);

		if (!result) {
			// console.groupEnd();
			return null;
		}
		if (isList(result) && !result.length) return result;

		//2.1 if rest str starts with >, add scoping
		var strRest = str.slice(idx + token.length).trim();
		if (strRest[0] === '>') {
			if (scopeAvail) {
				strRest = ':scope ' + strRest;
			}
			//fake selector via fake id on selected element
			else {
				var id = genId();
				transformSet(result, function(el, id){ el.setAttribute('data-__qr', id); }, id);

				strRest = '[data-__qr' + id + ']' + strRest;
			}
		}

		//3. Post-query or die
		result = q(result, strRest);
	}

	//make default query
	else {
		result = queryList(targets, str);
	}

	// console.groupEnd();
	return result;
}

/** Query elements from a list of targets, return list of queried items */
function queryList (targets, query) {
	if (isList(targets)) {
		return transformSet(targets, function(item, query){
			return _q.call(item, query, true);
		}, query);
	}
	//q single
	else return _q.call(targets, query, true);
}


/** Apply transformaion function on each element from a list, return resulting set */
function transformSet(list, fn, arg) {
	var res = [];
	if (!isList(list)) list = [list];
	for (var i = list.length, el, chunk; i--;) {
		el = list[i];
		if (el) {
			chunk = fn(el, arg);
			if (chunk) {
				res = [].concat(chunk, res);
			}
		}
	}
	return res;
}


//detect :scope
var scopeAvail = true;
try {
	doc.querySelector(':scope');
}
//scope isn’t supported
catch (e){
	scopeAvail = false;
}

/** generate unique id for selector */
var counter = Date.now() % 1e9;
function genId(e, q){
	return (Math.random() * 1e9 >>> 0) + (counter++);
}


/** Custom :pseudos */
var pseudos = {
	/** Get parent, if any */
	parent: function(e, q){
		//root el is considered the topmost
		if (e === doc) return root;
		var res = e.parentNode;
		return res === doc ? e : res;
	},

	/**
	* Get closest parent matching selector (or self)
	*/
	closest: function(e, q){
		//root el is considered the topmost
		if (e === doc) return root;
		if (!q || (q instanceof Node ? e == q : matches(e, q))) return e;
		while ((e = e.parentNode) !== doc) {
			if (!q || (q instanceof Node ? e == q : matches(e, q))) return e;
		}
	},

	/**
	 * Find the prev sibling matching selector
	 */
	prev: function(e, q){
		while (e = e.previousSibling) {
			if (e.nodeType !== 1) continue;
			if (!q || (q instanceof Node ? e == q : matches(e, q))) return e;
		}
	},

	/**
	 * Get the next sibling matching selector
	 */
	next: function(e, q){
		while (e = e.nextSibling) {
			if (e.nodeType !== 1) continue;
			if (!q || (q instanceof Node ? e == q : matches(e, q))) return e;
		}
	},

	/**
	 * Get root for any request
	 */
	root: function(){
		return root;
	}
};


/** simple list checker */
function isList(a){
	return a instanceof Array || a instanceof NodeList;
}


/**
 * uniquify an array
 * http://jszen.com/best-way-to-get-unique-values-of-an-array-in-javascript.7.html
 */
function unique(arr){
	if (!(arr instanceof Array)) return arr;

	var n = [];
	for(var i = 0; i < arr.length; i++)
	{
		if (n.indexOf(arr[i]) == -1) n.push(arr[i]);
	}
	return n;
}


//export pseudos
exports.closest = pseudos.closest;
exports.parent = pseudos.parent;
exports.next = pseudos.next;
exports.prev = pseudos.prev;
},{"matches-selector":5,"tiny-element":24}],24:[function(require,module,exports){
var slice = [].slice;

module.exports = function (selector, multiple) {
  var ctx = this === window ? document : this;

  return (typeof selector == 'string')
    ? (multiple) ? slice.call(ctx.querySelectorAll(selector), 0) : ctx.querySelector(selector)
    : (selector instanceof Node || selector === window || !selector.length) ? (multiple ? [selector] : selector) : slice.call(selector, 0);
};
},{}]},{},[1])(1)
});