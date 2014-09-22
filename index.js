/** @module enot */
var enot = module.exports = {};

var matches = require('matches-selector');
var eachCSV = require('each-csv');
var evt = require('muevents');
var str = require('mustring');
var types = require('mutypes');

var isString = types.isString;
var isElement = types.isElement;
var isArray = types.isArray;
var has = types.has;
var bind = evt.on;
var unbind = evt.off;
var fire = evt.emit;
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
	if (targets instanceof NodeList || isArray(targets)) {
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
	bind(newTarget, evtObj.evt, targetFn);
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

	unbind(newTarget, evtObj.evt, targetFn);
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
		fire(target, evtRefs, data, bubbles);
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
			if (target instanceof NodeList || isArray(target)) {
				for (var i = target.length; i--;){
					fire(target[i], evtObj.evt, data, bubbles);
				}
			}

			//fire single target
			else {
				fire(target, evtObj.evt, data, bubbles);
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