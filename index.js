//TODO: unbind all callbacks
//TODO: enhance keys detection
//TODO: detect sequence events notation

var enot = module['exports'] = {};

var matches = require('matches-selector');
var eachCSV = require('each-csv');
var _ = require('mutypes');
var isString = _['isString'];
var isElement = _['isElement'];
var isPlain = _['isPlain'];


var global = (1,eval)('this');
var doc = global.document;


//:pass shortcuts
var keyDict = {
	//kbd keys
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

	//mouse keys
	'LEFT_MOUSE': 1,
	'RIGHT_MOUSE': 3,
	'MIDDLE_MOUSE': 2
};

//jquery guarant
var $ = global.jQuery;

var commaSplitRe = /\s*,\s*/;

//target callbacks storage
var callbacks = {};

/**
* Returns parsed event object from event reference
*/
function parse(target, string, callback) {
	// console.group('parse reference', '`' + string + '`')
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
		result.handler = applyModifiers(callback, result);
	}


	// console.groupEnd();
	return result;
}


/**
* Retrieve source element from string
*/
var selfReference = '@';
function parseTarget(target, str) {
	if (!str){
		return target
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

	else if(str === 'body') return document.body;
	else if(str === 'root') return document.documentElement;

	//return global variable
	else {
		return getProperty(global, str);
	}
}

//get dot property by string
function getProperty(holder, propName){
	var propParts = propName.split('.');
	var result = holder, lastPropName;
	while ((lastPropName = propParts.shift()) !== undefined) {
		result = result[lastPropName];
	}
	return result;
}


/**
* Apply event modifiers to string.
* Returns wrapped fn.
*/
function applyModifiers(fn, evtObj){
	var targetFn = fn;

	//:one modifier should be the last one
	evtObj.modifiers.sort(function(a,b){
		return /^one/.test(a) ? 1 : -1
	})
	.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length + 1, -1);

		if (enot.modifiers[modifierName]) {
			targetFn = enot.modifiers[modifierName](evtObj.evt, targetFn, modifierParams);
		}
	});

	return targetFn;
}


//set of modified callbacks associated with fns, {fn: {evtRef: modifiedFn, evtRef: modifiedFn}}
var modifiedCbCache = new WeakMap;

//set of target callbacks, {target: [cb1, cb2, ...]}
var targetCbCache = new WeakMap;


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
}

//cache of redirectors
var redirectCbCache = {};

//single reference binder
function on(target, evtRef, fn) {
	var evtObj = parse(target, evtRef, fn);

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

	//empty fn means target method
	//FIXME: this line causes getter fire
	if (fn === undefined) targetFn = fn = newTarget[evtObj.evt];

	//catch redirect (stringy callback)
	else if (isPlain(fn)) {
		fn += '';
		//FIXME: make sure it's ok that parsed targetFn looses here
		//create fake redirector callback for stringy fn
		targetFn = enot.modifiers.fire(evtRef, null, fn);

		//save redirect fn to cache
		redirectCbCache[fn] = redirectCbCache[fn] || {}

		//ignore existing binding
		if (redirectCbCache[fn][evtObj.evt]) return false;

		//bind to old target
		if (target) targetFn = targetFn.bind(target);

		redirectCbCache[fn][evtObj.evt] = targetFn;
	}

	//if fn has been modified - save modified fn (in order to unbind it properly)
	else if (targetFn !== fn) {
		//bind new event
		if (!modifiedCbCache.has(fn)) modifiedCbCache.set(fn, {});
		var modifiedCbs = modifiedCbCache.get(fn);

		//ignore bound event
		if (modifiedCbs[evtObj.evt]) return false;

		//bind to old target
		if (target) targetFn = targetFn.bind(target);

		//save modified callback
		modifiedCbs[evtObj.evt] = targetFn;
	}

	bind(newTarget, evtObj.evt, targetFn);
}
//immediate bind
function bind(target, evt, fn){
	//DOM events
	if (isEventTarget(target)) {
		//bind target fn
		if ($){
			//delegate to jquery
			$(target).on(evt, fn);
		} else {
			//listen element
			target.addEventListener(evt, fn)
		}
	}

	//Non-DOM events
	else {
		//ensure callbacks array for target exist
		if (!targetCbCache.has(target)) targetCbCache.set(target, {});
		var targetCallbacks = targetCbCache.get(target);

		//save callback
		(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);
	}
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
}

//single reference unbinder
function off(target, evtRef, fn){
	var evtObj = parse(target, evtRef);
	var target = evtObj.targets;
	var targetFn = fn;

	if (!target) return;

	//iterate list of targets
	if (target.length && !isElement(target)) {
		for (var i = target.length; i--;){
			off(target[i], evtObj.evt, targetFn);
		}

		return;
	}

	//empty fn means target method
	if (fn === undefined) targetFn = fn = target[evtObj.evt];

	//catch redirect (stringy callback)
	if (isPlain(fn)) {
		fn += '';
		if (redirectCbCache[fn]) {
			targetFn = redirectCbCache[fn][evtObj.evt];
			redirectCbCache[fn][evtObj.evt] = null;
		}
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

	//unbind single target
	unbind(target, evtObj.evt, targetFn);
}

//immediate unbinder
function unbind(target, evt, fn){
	//DOM events on elements
	if (isEventTarget(target)) {
		//delegate to jquery
		if ($){
			$(target).off(evt, fn);
		}

		//listen element
		else {
			target.removeEventListener(evt, fn)
		}
	}

	//non-DOM events
	else {
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
	}
}

/**
* Dispatch event to any target
*/
// enot['trigger'] =
// enot['emit'] =
// enot['dispatchEvent'] =
enot['fire'] = function(target, evtRefs, data, bubbles){
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
		var evtObj = parse(target, evtRef);

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

		}, evtObj)();
	});
}


/**
* Event trigger
*/
function fire(target, eventName, data, bubbles){
	//DOM events
	if (isEventTarget(target)) {
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
				evt =  doc.createEvent('CustomEvent');
				evt.initCustomEvent(eventName, bubbles, null, data)
			}

			// var evt = new CustomEvent(eventName, { detail: data, bubbles: bubbles })

			target.dispatchEvent(evt);
		}
	}

	//no-DOM events
	else {
		//ignore if no event specified
		if (!targetCbCache.has(target)) return;
		var evtCallbacks = targetCbCache.get(target)[eventName];

		if (!evtCallbacks) return;

		for (var i = 0, len = evtCallbacks.length; i < len; i++) {
			evtCallbacks[i] && evtCallbacks[i].call(target, {
				detail: data,
				type: eventName
			});
		}
	}
}



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
enot.modifiers['delegate'] = function(evt, fn, selector){
	var cb = function(e){
		var target = e.target;

		// console.log('delegate cb', e, selector)
		//filter document/object/etc
		if (!isElement(target)) return DENY_EVT_CODE;

		//intercept bubbling event by delegator
		while (target && target !== this) {
			if (matches(target, selector)) {
				//set proper current target
				e.delegateTarget = target;
				Object.defineProperty(e, 'currentTarget', {
					get: function(){
						return target
					}
				})
				return fn.call(this, e);
			}
			target = target.parentNode;
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
var throttleCache = new WeakMap;
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

//defer call - call Nms later invoking method/event
// enot.modifiers['after'] =
// enot.modifiers['async'] =
enot.modifiers['defer'] = function(evt, fn, delay){
	delay = parseFloat(delay)
	// console.log('defer', evt, delay)
	var cb = function(e){
		// console.log('defer cb')
		var self = this;
		setTimeout(function(){
			return fn.call(self, e);
		}, delay);
	}

	return cb
}

//redirector
// enot.modifiers['redirect'] =
enot.modifiers['fire'] = function(evt, fn, evtRef){
	var evts = evtRef + '';
	var cb = function(e){
		var self = this;
		eachCSV(evts, function(evt){
			// console.log('fire', evt, self)
			fire(self, evt, e.detail);
		});
	}

	return cb
}


//detects whether element is able to emit/dispatch events
//TODO: detect eventful objects in a more wide way
function isEventTarget (target){
	return target && !!target.addEventListener;
}


// onEvt → Evt
function unprefixize(str, pf){
	return (str.slice(0,pf.length) === pf) ? str.slice(pf.length) : str;
}

//simple uppercaser
function upper(str){
	return str.toUpperCase();
}