!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var enot = module.exports = {};

var id = require('object-id');
var matches = require('matches-selector');


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
* Dispatch event to any target
*/
enot.fire = function(target, evtRef, data, bubbles){
	var eventName;

	if (evtRef instanceof Event) {
		return fireEvent(target, evtRef);
	}

	else {
		if (!evtRef) return false;

		var evtObj = enot.parse(target, evtRef);

		if (!evtObj.evt) return false;
	}

	return enot.applyModifiers(function(){
		fireEvent(evtObj.el, evtObj.evt, data, bubbles);
	}, evtObj)();
}


/**
* Event trigger
*/
function fireEvent(target, eventName, data, bubbles){
	if (!target) return target;

	//DOM events
	if (enot.isEventTarget(target)) {
		if ($){
			//TODO: decide how to pass data
			var evt = $.Event( eventName, data );
			evt.detail = data;
			bubbles ? $(target).trigger(evt) : $(target).triggerHandler(evt);
		} else {
			//NOTE: this doesnot bubble in disattached elements
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
		target._callbacks = target._callbacks || {};
		var callbacks = target._callbacks[eventName];

		if (callbacks) {
			callbacks = callbacks.slice(0);
			for (var i = 0, len = callbacks.length; i < len; ++i) {
				callbacks[i].call(target, data);
			}
		}
	}
}


/**
* Bind any target
*/
enot.on = function (target, evtRef, fn) {
	//use DOM events
	var evtObj = enot.parse(target, evtRef, fn);

	target = evtObj.el;
	var targetFn = evtObj.handler;

	//ignore not bindable sources
	if (!target) return false;

	var modifiedFnKey = '_on' + id(target) + evtRef;

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

	//fall back to default events
	//FIXME: hide _callbacks to scope
	else {
		target._callbacks = target._callbacks || {};
		(target._callbacks[evtObj.evt] = target._callbacks[evtObj.evt] || [])
			.push(fn);
	}

	return fn;
}


/**
* Unbind any target
*/
enot.off = function(target, evtRef, fn){
	//FIXME: remove all event listeners? Find use-case
	if (!fn) return;

	var evtObj = enot.parse(target, evtRef);
	var target = evtObj.el;

	if (!target) return;

	var modifiedFnKey = '_on' + id(target) + evtRef;
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
		target._callbacks = target._callbacks || {};

		// specific event
		var callbacks = target._callbacks[evtObj.evt];
		if (!callbacks) return target;

		// remove specific handler
		var cb;
		for (var i = 0; i < callbacks.length; i++) {
			cb = callbacks[i];
			if (cb === fn || cb.fn === fn) {
				callbacks.splice(i, 1);
				break;
			}
		}
	}

	return fn;
}




//list of available event modifiers
var DENY_EVT_CODE = 1;
enot.modifiers = {
	//call callback once
	one: function(evt, fn){
		var cb = function(e){
			// console.log('once cb', fn)
			var result = fn && fn.call(this, e);
			//FIXME: `this` is not necessarily has `off`
			result !== DENY_EVT_CODE && enot.off(this, evt, cb);
			return result;
		}
		return cb;
	},

	//filter keys
	pass: function(evt, fn, keys){
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
	},

	//filter target
	delegate: function(evt, fn, selector){
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
	},

	//throttle call
	throttle: function(evt, fn, interval){
		interval = parseFloat(interval)
		// console.log('thro', evt, fn, interval)
		var cb = function(e){
			// console.log('thro cb')
			var self = this,
				scope = getScope(self),
				throttleKey = '_throttle' + evt;

			if (scope[throttleKey]) return DENY_EVT_CODE;
			else {
				var result = fn.call(self, e);
				if (result === DENY_EVT_CODE) return result;
				scope[throttleKey] = setTimeout(function(){
					clearInterval(scope[throttleKey]);
					scope[throttleKey] = null;
				}, interval);
			}
		}

		return cb
	},

	//defer call - call Nms later invoking method/event
	after: function(evt, fn, delay){
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
},{"matches-selector":2,"object-id":3}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
(function(){

/**
 * Check if we need to do an IE hack.
 */

var bug = !Object.defineProperty;

/**
 * If we need to do an IE hack, see if we
 * really can by seeing if we can override `toLocaleString`.
 *
 * @see http://stackoverflow.com/questions/17934888/how-to-add-non-enumerable-property-in-javascript-for-ie8/17935125#17935125
 */

if (bug) {
  for (var k in { toLocaleString: 3 }) {
    if (k === 'toLocaleString') {
      bug = false;
    }
  }
}

/**
 * get/set id.
 */

if (bug) {
  var get = function get(obj){
    return obj.toLocaleString || set(obj);
  };

  var set = function set(obj){
    return obj.toLocaleString = get.id++;
  };
} else {
  var get = function get(obj){
    return obj.__id__ || set(obj);
  };

  var set = function set(obj){
    return Object.defineProperty(obj, '__id__', { enumerable: false, value: get.id++ }) && obj.__id__;
  };
}

/**
 * Incremented `id`.
 */

get.id = 1;

/**
 * Get id from object.
 */

if ('undefined' === typeof module) {
  this.objectId = get;
} else {
  module.exports = get;
}

})();
},{}]},{},[1])(1)
});