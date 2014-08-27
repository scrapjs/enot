!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var g=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("muevent"),m=require("mustring"),n=require("mutypes"),p=n.isString,q=n.isElement,r=n.isPlain,s=n.has,t=l.on,u=l.off,v=l.emit,w=m.unprefixize,x=m.upper,y=(0,eval)("this"),z=y.document,A={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,
RIGHT_MOUSE:3,MIDDLE_MOUSE:2},B=/\s*,\s*/;function C(a,b,c){var d={},e=b.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];a=(b=b.slice(0,-e.length).trim())?/^[.#[]/.test(b)&&z?z.querySelectorAll(b):/^this\./.test(b)?D(a,b.slice(5)):b[0]===E?D(a,b.slice(1)):"this"===b?a:b===E?a:"body"===b?z.body:"root"===b?z.documentElement:D(y,b):a;d.c=a;e=w(e,"on").split(":");d.a=e.shift();d.b=e;c&&(d.d=G(c,d));return d}var E="@";
function D(a,b){for(var c=b.split("."),d=a,e;void 0!==(e=c.shift());){if(!s(d,e))return;d=d[e]}return d}function G(a,b){var c=a;b.b.sort(function(d){return/^one/.test(d)?1:-1}).forEach(function(d){var a=d.split("(")[0];d=d.slice(a.length+1,-1);g.b[a]&&(c=g.b[a](b.a,c,d))});return c}var H=new WeakMap;g.on=function(a,b,c){p(a)&&(c=b,b=a,a=null);if(!b)return!1;k(b,function(d){I(a,d,c)})};var J=new WeakMap;
function I(a,b,c){if(void 0!==c){var d=C(a,b,c),e=d.c,f=d.d;if(e)if(e.length&&!q(e))for(a=e.length;a--;)I(e[a],d.a,f);else{if(r(c)){f=g.b.redirect(b,null,c+"");J.has(e)||J.set(e,{});b=J.get(e);if(b[d.a])return;a&&(f=f.bind(a));b[d.a]=f}else if(f!==c){H.has(c)||H.set(c,{});a=H.get(c);if(a[d.a])return;a[d.a]=f}t(e,d.a,f)}}}g.off=function(a,b,c){p(a)&&(c=b,b=a,a=null);b&&k(b,function(d){K(a,d,c)})};
function K(a,b,c){a=C(a,b);b=a.c;var d=c;if(b)if(b.length&&!q(b))for(c=b.length;c--;)K(b[c],a.a,d);else{if(r(c)){c=J.get(b);if(!c)return;d=c[a.a];c[a.a]=null}else H.has(c)&&(c=H.get(c),c[a.a]&&(d=c[a.a],c[a.a]=null));u(b,a.a,d)}}g.emit=function(a,b,c,d){p(a)&&(d=c,c=b,b=a,a=null);if(b instanceof Event)return v(a,b);if(!b)return!1;k(b,function(b){var f=C(a,b);return f.a?G(function(){var b=f.c;if(!b)return b;if(b.length&&!q(b))for(var a=b.length;a--;)v(b[a],f.a,c,d);else v(b,f.a,c,d)},f)():!1})};
g.b={};g.b.one=function(a,b){function c(d){d=b&&b.call(this,d);1!==d&&g.off(this,a,c);return d}return c};g.b.pass=function(a,b,c){c=c.split(B).map(x);return function(d){for(var a,f=c.length;f--;){a=c[f];var F="originalEvent"in d?d.originalEvent.which:d.which;if(a in A&&A[a]==F||F==a)return b.call(this,d)}return 1}};
g.b.delegate=function(a,b,c){return function(a){var e=a.target;if(!q(e))return 1;for(;e&&e!==this;){if(h(e,c))return a.delegateTarget=e,Object.defineProperty(a,"currentTarget",{get:function(){return e}}),b.call(this,a);e=e.parentNode}return 1}};g.b.not=function(a,b,c){return function(a){for(var e=a.target;e&&e!==this;){if(h(e,c))return 1;e=e.parentNode}return b.call(this,a)}};var L=new WeakMap;
g.b.throttle=function(a,b,c){c=parseFloat(c);return function(a){var e=this;if(L.get(e))return 1;a=b.call(e,a);if(1===a)return a;L.set(e,setTimeout(function(){clearInterval(L.e);L.delete(e)},c))}};g.b.defer=function(a,b,c){c=parseFloat(c);return function(a){var e=this;setTimeout(function(){return b.call(e,a)},c)}};g.b.redirect=function(a,b,c){var d=c+"";return function(a){var b=this;k(d,function(c){g.emit(b,c,a.detail)})}};

},{"each-csv":2,"matches-selector":3,"muevent":4,"mustring":5,"mutypes":6}],2:[function(require,module,exports){
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
module.exports = {
	on: bind,
	off: unbind,
	emit: fire
};

var _ = require('mutypes');



//jquery guarant
var $ = typeof jQuery === 'undefined' ? undefined : jQuery;

//set of target callbacks, {target: [cb1, cb2, ...]}
var targetCbCache = new WeakMap;


/**
* Bind fn to a target
*/
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
		//FIXME: old IE
	}

	//Non-DOM events
	//ensure callbacks array for target exist
	if (!targetCbCache.has(target)) targetCbCache.set(target, {});
	var targetCallbacks = targetCbCache.get(target);

	//save callback
	(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);
}



/**
* Bind fn to a target
*/
function unbind(target, evt, fn){
	//unbind all listeners passed
	if (_.isArray(fn)){
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
		if (evtRef === undefined) {
			for (var evtName in callbacks) {
				off(target, evtName, callbacks[evtName]);
			}
		}
		else {
			off(target, evtRef, callbacks[evtRef]);
		}
		return;
	}

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
				evt =  document.createEvent('CustomEvent');
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




//detects whether element is able to emit/dispatch events
//TODO: detect eventful objects in a more wide way
function isEventTarget (target){
	return target && !!target.addEventListener;
}
},{"mutypes":6}],5:[function(require,module,exports){
var S = module.exports = {
	//camel-case → CamelCase
	camel: function (str){
		return str && str.replace(/-[a-z]/g, function(match, position){
			return S.upper(match[1])
		})
	},

	//CamelCase → camel-case
	dashed: function (str){
		return str && str.replace(/[A-Z]/g, function(match, position){
			return (position ? '-' : '') + S.lower(match)
		})
	},

	//uppercaser
	upper: function (str){
		return str.toUpperCase();
	},

	//lowercasify
	lower: function (str){
		return str.toLowerCase();
	},

	//aaa → Aaa
	capfirst: function (str){
		str+='';
		if (!str) return str;
		return S.upper(str[0]) + str.slice(1);
	},

	// onEvt → envt
	unprefixize: function (str, pf){
		return (str.slice(0,pf.length) === pf) ? S.lower(str.slice(pf.length)) : str;
	}
};
},{}],6:[function(require,module,exports){
/**
* Trivial types checkers.
* Because there’re no common lib for that ( lodash_ is a fatguy)
*/
var _ = module.exports = {
	//speedy impl,ementation of `in`
	//NOTE: `!target[propName]` 2-3 orders faster than `!(propName in target)`
	has: function(a, b){
		if (!a) return false;
		//NOTE: this causes getter fire
		if (a[b]) return true;
		return b in a;
		// return a.hasOwnProperty(b);
	},

	//isPlainObject
	isObject: function(a){
		var Ctor, result;

		if (_.isPlain(a) || _.isArray(a) || _.isElement(a) || _.isFn(a)) return false;

		// avoid non `Object` objects, `arguments` objects, and DOM elements
		if (
			//FIXME: this condition causes weird behaviour if a includes specific valueOf or toSting
			// !(a && ('' + a) === '[object Object]') ||
			(!_.has(a, 'constructor') && (Ctor = a.constructor, isFn(Ctor) && !(Ctor instanceof Ctor))) ||
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

		return typeof result == 'undefined' || _.has(a, result);
	},

	isFn: function(a){
		return !!(a && a.apply);
	},

	isString: function(a){
		return typeof a === 'string'
	},

	isNumber: function(a){
		return typeof a === 'number'
	},

	isBool: function(a){
		return typeof a === 'boolean'
	},

	isPlain: function(a){
		return !a || _.isString(a) || _.isNumber(a) || _.isBool(a);
	},

	isArray: function(a){
		return a instanceof Array;
	},

	isElement: function(target){
		return target instanceof HTMLElement
	},

	isPrivateName: function(n){
		return n[0] === '_' && n.length > 1
	}
}
},{}]},{},[1])(1)
});