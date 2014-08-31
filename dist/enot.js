!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var f=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("muevents"),m=require("mustring"),n=require("mutypes"),p=n.isString,q=n.isElement,r=n.has,s=l.on,t=l.off,u=l.emit,v=m.unprefixize,w=m.upper,x=(0,eval)("this"),y=x.document,z=/\s*,\s*/;
function A(b,a,c){var e={},d=a.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];a=a.slice(0,-d.length).trim();b||(b=y);a?/^[.#[]/.test(a)?(q(b)||(b=y),a=b.querySelectorAll(a)):a=/^this\./.test(a)?B(b,a.slice(5)):a[0]===C?B(b,a.slice(1)):"this"===a?b:a===C?b:"body"===a?y.body:"root"===a?y.documentElement:B(x,a):a=b;e.c=a;d=v(d,"on").split(":");e.a=d.shift();e.b=d;c&&(p(c)&&(c=E(c)),e.d=F(c,e.a,e.b));return e}var C="@";
function B(b,a){for(var c=a.split("."),e=b,d;void 0!==(d=c.shift());){if(!r(e,d))return;e=e[d]}return e}function F(b,a,c){var e=b;c.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(c){var b=c.split("(")[0];c=c.slice(b.length+1,-1);f.b[b]&&(e=f.b[b](a,e,c))});return e}var G=new WeakMap;f.on=function(b,a,c){p(b)&&(c=a,a=b,b=null);if(!a)return!1;k(a,function(a){H(b,a,c)})};var I=new WeakMap;
function H(b,a,c){if(c){a=A(b,a,c);var e=a.c,d=a.d;if(e)if(e.length&&!q(e))for(b=e.length;b--;)H(e[b],a.a,d);else{if(p(c)){I.has(e)||I.set(e,{});c=I.get(e);if(c[a.a])return;b&&(d=d.bind(b));c[a.a]=d}else if(d!==c){G.has(c)||G.set(c,{});b=G.get(c);if(b[a.a])return;b[a.a]=d}s(e,a.a,d)}}}f.off=function(b,a,c){p(b)&&(c=a,a=b,b=null);a&&k(a,function(a){J(b,a,c)})};
function J(b,a,c){b=A(b,a);a=b.c;var e=c;if(a)if(a.length&&!q(a))for(c=a.length;c--;)J(a[c],b.a,e);else{if(c)if(p(c)){c=I.get(a);if(!c)return;e=c[b.a];c[b.a]=null}else G.has(c)&&(c=G.get(c),c[b.a]&&(e=c[b.a],c[b.a]=null));t(a,b.a,e)}}
f.emit=function(b,a,c,e){p(b)&&(e=c,c=a,a=b,b=null);if(a instanceof Event)return u(b,a);if(!a)return!1;k(a,function(a){var g=A(b,a);return g.a?F(function(){var a=g.c;if(!a)return a;if(a.length&&!q(a))for(var b=a.length;b--;)u(a[b],g.a,c,e);else u(a,g.a,c,e)},g.a,g.b)():!1})};
var K={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2};f.b={};f.b.once=f.b.one=function(b,a){function c(e){e=a&&a.call(this,e);1!==e&&f.off(this,b,c);return e}return c};
f.b.filter=f.b.pass=function(b,a,c){c=c.split(z).map(w);return function(b){for(var d,g=c.length;g--;){d=c[g];var D="originalEvent"in b?b.originalEvent.which:b.which;if(d in K&&K[d]==D||D==d)return a.call(this,b)}return 1}};f.b.on=f.b.delegate=function(b,a,c){return function(b){var d=b.target;if(!q(d))return 1;for(;d&&d!==document&&d!==this;){if(h(d,c))return b.delegateTarget=d,a.call(this,b);d=d.parentNode}return 1}};
f.b.not=function(b,a,c){return function(b){for(var d=b.target;d&&d!==document&&d!==this;){if(h(d,c))return 1;d=d.parentNode}return a.call(this,b)}};var L=new WeakMap;f.b.throttle=function(b,a,c){c=parseFloat(c);return function(b){var d=this;if(L.get(d))return 1;b=a.call(d,b);if(1===b)return b;L.set(d,setTimeout(function(){clearInterval(L.e);L.delete(d)},c))}};f.b.async=f.b.after=f.b.defer=function(b,a,c){c=parseFloat(c);return function(b){var d=this;setTimeout(function(){return a.call(d,b)},c)}};
function E(b){return function(a){var c=this;k(b,function(b){f.emit(c,b,a.detail)})}};

},{"each-csv":2,"matches-selector":3,"muevents":4,"mustring":5,"mutypes":6}],2:[function(require,module,exports){
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
		if (evt === undefined) {
			for (var evtName in callbacks) {
				unbind(target, evtName, callbacks[evtName]);
			}
		}
		else {
			unbind(target, evt, callbacks[evt]);
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