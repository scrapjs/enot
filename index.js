//TODO: unbind all callbacks
//TODO: enhance keys detection
//TODO: detect sequence events notation

var enot = module.exports = {};

var id = require('object-id');
var matches = require('matches-selector');
var eachCSV = require('each-csv');


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
enot.parse = function(target, string, callback) {
	// console.group('parse reference', '`' + string + '`')
	var result = {};

	//get event name - the first token from the end
	var eventString = string.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	string = string.slice(0, -eventString.length).trim();
	result.el = enot.parseTarget(target, string);

	//parse modifiers
	var eventParams = unprefixize(eventString, 'on').split(':');

	//get event name
	result.evt = eventParams.shift();
	result.modifiers = eventParams;

	//save resulting handler
	if (callback) {
		result.handler = enot.applyModifiers(callback, result);
	}


	// console.groupEnd();
	return result;
}


/**
* Retrieve source element from string
*/
enot.parseTarget = function(target, str) {
	if (!str){
		return target
	}

	//try to query selector in DOM environment
	if (/^[.#[]/.test(str) && doc) {
		return doc.querySelector(str);
	}

	//return self reference
	else if (/^this\./.test(str)){
		return target[str.slice(5)]
	}
	else if(str[0] === '@'){
		return target[str.slice(1)]
	}

	else if(str === 'this') return target;
	else if(str === '@') return target;

	else if(str === 'body') return document.body;
	else if(str === 'root') return document.documentElement;

	//return global variable
	else {
		return global[str];
	}
}


/**
* Apply event modifiers to string.
* Returns wrapped fn.
*/
enot.applyModifiers = function(fn, evtObj){
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




/**
* Listed reference binder
*/
enot['addEventListener'] =
enot['bind'] =
enot['on'] = function(target, evtRefs, fn){
	if (!evtRefs) return false;

	eachCSV(evtRefs, function(evtRef){
		on(target, evtRef, fn);
	});
}

//single reference binder
function on(target, evtRef, fn) {
	//use DOM events
	var evtObj = enot.parse(target, evtRef, fn);

	target = evtObj.el;
	var targetFn = evtObj.handler;

	//ignore not bindable sources
	if (!target) return false;

	var targetId = id(target);

	var modifiedFnKey = '_on' + targetId + evtRef;

	//ignore bound method reference
	if (fn[modifiedFnKey]) return false;

	fn[modifiedFnKey] = targetFn;

	//use DOM events, if available
	if (enot.isEventTarget(target)) {
		//bind target fn
		if ($){
			//delegate to jquery
			$(target).on(evtObj.evt, targetFn);
		} else {
			//listen element
			target.addEventListener(evtObj.evt, targetFn)
		}
	}

	else {
		//save callback
		var targetCallbacks = callbacks[targetId] = callbacks[targetId] || {};
		(targetCallbacks[evtObj.evt] = targetCallbacks[evtObj.evt] || [])
			.push(targetFn);
	}

	return fn;
}


/**
* Listed reference unbinder
*/
enot['removeEventListener'] =
enot['unbind'] =
enot['off'] = function(target, evtRefs, fn){
	//FIXME: remove all listeners?
	if (!evtRefs) return false;

	eachCSV(evtRefs, function(evtRef){
		off(target, evtRef, fn);
	});
}

//single reference unbinder
function off(target, evtRef, fn){
	//FIXME: remove all event listeners? Find use-case
	if (!fn) return;

	var evtObj = enot.parse(target, evtRef);
	var target = evtObj.el;

	if (!target) return;

	var targetId = id(target);

	var modifiedFnKey = '_on' + targetId + evtRef;
	var targetFn = fn[modifiedFnKey] || fn;

	//clear link
	fn[modifiedFnKey] = null;

	//use DOM events on elements
	if (enot.isEventTarget(target)) {
		//delegate to jquery
		if ($){
			$(target).off(evtObj.evt, targetFn);
		}

		//listen element
		else {
			target.removeEventListener(evtObj.evt, targetFn)
		}
	}

	//use events mechanism
	else {
		var targetCallbacks = callbacks[targetId] = callbacks[targetId] || {};

		// specific event
		var evtCallbacks = targetCallbacks[evtObj.evt];
		if (!evtCallbacks) return;

		// remove specific handler
		var cb;
		for (var i = 0; i < evtCallbacks.length; i++) {
			cb = evtCallbacks[i];
			if (cb === fn || cb.fn === fn) {
				evtCallbacks.splice(i, 1);
				break;
			}
		}
	}

	return fn;
}


/**
* Dispatch event to any target
*/
enot['fire'] =
enot['emit'] =
enot['dispatchEvent'] =
enot['trigger'] = function(target, evtRefs, data, bubbles){
	if (evtRefs instanceof Event) {
		return fire(target, evtRefs);
	}

	if (!evtRefs) return false;

	eachCSV(evtRefs, function(evtRef){
		var evtObj = enot.parse(target, evtRef);

		if (!evtObj.evt) return false;

		return enot.applyModifiers(function(){
			fire(evtObj.el, evtObj.evt, data, bubbles);
		}, evtObj)();
	});
}


/**
* Event trigger
*/
function fire(target, eventName, data, bubbles){
	if (!target) return target;

	var targetId = id(target);

	//DOM events
	if (enot.isEventTarget(target)) {
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
		var targetCallbacks = callbacks[targetId] = callbacks[targetId] || {};
		var evtCallbacks = targetCallbacks[eventName];

		if (evtCallbacks) {
			evtCallbacks = evtCallbacks.slice(0);
			for (var i = 0, len = evtCallbacks.length; i < len; ++i) {
				evtCallbacks[i].call(target, data);
			}
		}
	}
}



//list of available event modifiers
var DENY_EVT_CODE = 1;
enot.modifiers = {};

//call callback once
enot.modifiers['one'] =
enot.modifiers['once'] = function(evt, fn){
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
enot.modifiers['keypass'] =
enot.modifiers['mousepass'] =
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

//filter target
enot.modifiers['live'] =
enot.modifiers['on'] =
enot.modifiers['delegate'] = function(evt, fn, selector){
	var cb = function(e){
		// console.log('delegate cb', e, selector)
		if (!(e.target instanceof HTMLElement)) return DENY_EVT_CODE;

		var target = e.target;

		while (target && target !== this) {
			if (matches(target, selector)) return fn.call(this, e);
			target = target.parentNode;
		}

		return DENY_EVT_CODE;
	}
	return cb;
}

//throttle call
var throttleKeys = {};
enot.modifiers['throttle'] = function(evt, fn, interval){
	interval = parseFloat(interval)
	// console.log('thro', evt, fn, interval)
	var cb = function(e){
		// console.log('thro cb')
		var self = this,
			throttleKey = '_throttle' + id(self) + evt;

		if (throttleKeys[throttleKey]) return DENY_EVT_CODE;
		else {
			var result = fn.call(self, e);
			if (result === DENY_EVT_CODE) return result;
			throttleKeys[throttleKey] = setTimeout(function(){
				clearInterval(throttleKeys[throttleKey]);
				throttleKeys[throttleKey] = null;
			}, interval);
		}
	}

	return cb
}

//defer call - call Nms later invoking method/event
enot.modifiers['after'] =
enot.modifiers['async'] =
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


//detects whether element is able to emit/dispatch events
//TODO: detect eventful objects in a more wide way
enot.isEventTarget = function(target){
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