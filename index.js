var enot = module['exports'] = {};

var matches = require('matches-selector');
var eachCSV = require('each-csv');
var evt = require('muevents');
var str = require('mustring');
var types = require('mutypes');

var isString = types['isString'];
var isElement = types['isElement'];
var isPlain = types['isPlain'];
var isArray = types['isArray'];
var has = types['has'];
var bind = evt['on'];
var unbind = evt['off'];
var fire = evt['emit'];
var unprefixize = str['unprefixize'];
var upper = str['upper'];

var global = (1, eval)('this');
var doc = global.document;



/** @type {RegExp} Use as `.split(commaSplitRe)` */

var commaSplitRe = /\s*,\s*/;


/**
 * Return parsed event object from event reference.
 *
 * @param  {Element|Object}   target   A target to parse (optional)
 * @param  {string}   string   Event notation
 * @param  {Function} callback Handler
 * @return {Object}            Result of parsing
 */

function parseReference(target, string, callback) {
	var result = {};

	//get event name - the first token from the end
	var eventString = string.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	string = string.slice(0, -eventString.length).trim();
	result.targets = parseTarget(target, string);

	//parse modifiers
	var eventParams = unprefixize(eventString, 'on').split(':');

	//get event name
	result.evt = eventParams.shift();
	result.modifiers = eventParams;

	//save resulting handler
	if (callback) {
		//transform redirect statement to callback
		if (isPlain(callback)) {
			callback = getRedirector(callback);
		}
		result.handler = applyModifiers(callback, result.evt, result.modifiers);
	}

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
	if (!str){
		return target;
	}

	//try to query selector in DOM environment
	if (/^[.#[]/.test(str) && doc) {
		return doc.querySelectorAll(str);
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

	else if(str === 'body') return doc.body;
	else if(str === 'root') return doc.documentElement;

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

	modifiers.sort(function(a,b){
		return /^one/.test(a) ? 1 : -1;
		//:defer should be the first because it delays call
		return /^defer/.test(a) ? -1 : 1;
	})
	.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length + 1, -1);

		if (enot.modifiers[modifierName]) {
			targetFn = enot.modifiers[modifierName](evt, targetFn, modifierParams);
		}
	});

	return targetFn;
}


/**
 * Set of modified callbacks associated with fns:
 * `{fn: {evtRef: modifiedFn, evtRef: modifiedFn}}`
 *
 * @type {WeakMap}
 */
var modifiedCbCache = new WeakMap();


/**
* Listed reference binder
*/
// enot['addEventListener'] =
// enot['bind'] =
enot['on'] = function(target, evtRefs, fn){
	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}
	if (!evtRefs) return false;

	eachCSV(evtRefs, function(evtRef){
		on(target, evtRef, fn);
	});
};

//cache of redirectors
var redirectCbCache = new WeakMap();

//single reference binder
function on(target, evtRef, fn) {
	//ignore empty fn
	if (!fn) return;

	var evtObj = parseReference(target, evtRef, fn);

	var newTarget = evtObj.targets;
	var targetFn = evtObj.handler;

	//ignore not bindable sources
	if (!newTarget) return false;

	//iterate list of targets
	if (newTarget.length && !isElement(newTarget)) {
		for (var i = newTarget.length; i--;){
			on(newTarget[i], evtObj.evt, targetFn);
		}

		return;
	}

	//catch redirect (stringy callback)
	else if (isPlain(fn)) {
		//save redirect fn to cache
		if (!redirectCbCache.has(newTarget)) redirectCbCache.set(newTarget, {});
		var redirectSet = redirectCbCache.get(newTarget);

		//ignore existing binding
		if (redirectSet[evtObj.evt]) return false;

		//bind to old target
		if (target) targetFn = targetFn.bind(target);

		redirectSet[evtObj.evt] = targetFn;
	}

	//if fn has been modified - save modified fn (in order to unbind it properly)
	else if (targetFn !== fn) {
		//bind new event
		if (!modifiedCbCache.has(fn)) modifiedCbCache.set(fn, {});
		var modifiedCbs = modifiedCbCache.get(fn);

		//ignore bound event
		if (modifiedCbs[evtObj.evt]) return false;

		//bind to old target
		// if (target) targetFn = targetFn.bind(target);

		//save modified callback
		modifiedCbs[evtObj.evt] = targetFn;
	}

	bind(newTarget, evtObj.evt, targetFn);
}


/**
 * Listed reference unbinder
 */
// enot['removeEventListener'] =
// enot['unbind'] =
enot['off'] = function(target, evtRefs, fn){
	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//FIXME: remove all listeners?
	if (!evtRefs) return;

	eachCSV(evtRefs, function(evtRef){
		off(target, evtRef, fn);
	});
};

//single reference unbinder
function off(target, evtRef, fn){
	// console.log('off', evtRef, fn)
	var evtObj = parseReference(target, evtRef);
	var newTarget = evtObj.targets;
	var targetFn = fn;

	if (!newTarget) return;

	//iterate list of targets
	if (newTarget.length && !isElement(newTarget)) {
		for (var i = newTarget.length; i--;){
			off(newTarget[i], evtObj.evt, targetFn);
		}

		return;
	}

	//catch redirect (stringy callback)
	if (isPlain(fn)) {
		fn += '';
		var redirectSet = redirectCbCache.get(newTarget);
		if (!redirectSet) return;

		targetFn = redirectSet[evtObj.evt];

		redirectSet[evtObj.evt] = null;
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

	unbind(newTarget, evtObj.evt, targetFn);
}


/**
* Dispatch event to any target
*/
// enot['trigger'] =
// enot['fire'] =
// enot['dispatchEvent'] =
enot['emit'] = function(target, evtRefs, data, bubbles){
	//if no target specified
	if (isString(target)) {
		bubbles = data;
		data = evtRefs;
		evtRefs = target;
		target = null;
	}

	if (evtRefs instanceof Event) {
		return fire(target, evtRefs);
	}

	if (!evtRefs) return false;

	eachCSV(evtRefs, function(evtRef){
		var evtObj = parseReference(target, evtRef);

		if (!evtObj.evt) return false;

		return applyModifiers(function(){
			var target = evtObj.targets;

			if (!target) return target;

			//iterate list of targets
			if (target.length && !isElement(target)) {
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
}



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

//list of available event modifiers
var DENY_EVT_CODE = 1;
enot.modifiers = {};

//call callback once
// enot.modifiers['once'] =
enot.modifiers['one'] = function(evt, fn){
	var cb = function(e){
		// console.log('once cb', fn)
		var result = fn && fn.call(this, e);
		//FIXME: `this` is not necessarily has `off`
		result !== DENY_EVT_CODE && enot.off(this, evt, cb);
		return result;
	}
	return cb;
}

//filter keys
// enot.modifiers['keypass'] =
// enot.modifiers['mousepass'] =
// enot.modifiers['filter'] =
enot.modifiers['pass'] = function(evt, fn, keys){
	keys = keys.split(commaSplitRe).map(upper);

	var cb = function(e){
		var pass = false, key;
		for (var i = keys.length; i--;){
			key = keys[i]
			var which = 'originalEvent' in e ? e.originalEvent.which : e.which;
			if ((key in keyDict && keyDict[key] == which) || which == key){
				pass = true;
				return fn.call(this, e);
			}
		};
		return DENY_EVT_CODE;
	}
	return cb
}

//white-filter target
// enot.modifiers['live'] =
// enot.modifiers['on'] =
enot.modifiers['delegate'] = function(evtName, fn, selector){
	var cb = function(evt){
		var el = evt.target;
		// console.log('delegate', evt.target.tagName)

		//filter document/object/etc
		if (!isElement(el)) return DENY_EVT_CODE;

		//intercept bubbling event by delegator
		while (el && el !== this) {
			if (matches(el, selector)) {
				//set proper current el
				evt.delegateTarget = el;
				// evt.currentTarget = el;
				//NOTE: PhantomJS fails on this
				Object.defineProperty(evt, 'currentTarget', {
					get: function(){
						return el
					}
				})
				return fn.call(this, evt);
			}
			el = el.parentNode;
		}

		return DENY_EVT_CODE;
	}

	return cb;
}

//black-filter target
enot.modifiers['not'] = function(evt, fn, selector){
	var cb = function(e){
		// console.log('not cb', e, selector)
		var target = e.target;

		//traverse each node from target to holder and filter if event happened within banned element
		while (target && target !== this) {
			if (matches(target, selector)) return DENY_EVT_CODE;
			target = target.parentNode;
		}

		return fn.call(this, e);
	}
	return cb;
}

//throttle call
var throttleCache = new WeakMap();
enot.modifiers['throttle'] = function(evt, fn, interval){
	interval = parseFloat(interval)
	// console.log('thro', evt, fn, interval)
	var cb = function(e){
		// console.log('thro cb')
		var self = this;

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

	return cb
}


/**
 * Defer call - afnet Nms after real method/event
 * @param  {string}   evt   Event name
 * @param  {Function} fn    Handler
 * @param  {number|string}   delay Number of ms to wait
 * @return {Function}         Modified handler
 */

// enot.modifiers['after'] =
// enot.modifiers['async'] =
enot.modifiers['defer'] = function(evt, fn, delay){
	delay = parseFloat(delay);
	// console.log('defer', evt, delay)
	var cb = function(e){
		// console.log('defer cb', fn);
		var self = this;
		setTimeout(function(){
			return fn.call(self, e);
		}, delay);
	};

	return cb;
};



/**
 * Return redirection statements handler
 *
 * @param    {string}   redirectTo   Redirect declaration (other event notation)
 *
 * @return   {function}   Callback which fires redirects
 */

function getRedirector(redirectTo){
	var cb = function(e){
	// console.log('redirect', re)
		var self = this;
		eachCSV(redirectTo, function(evt){
			// console.log('redirect', evt)
			enot['emit'](self, evt, e.detail);
		});
	}

	return cb;
}