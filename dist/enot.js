!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var g=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("muevents"),m=require("mustring"),n=require("mutypes"),p=n.isString,q=n.isElement,r=n.has,s=l.on,t=l.off,u=l.emit,v=m.unprefixize,w=m.upper,x=(0,eval)("this"),y=x.document,z=/\s*,\s*/;
function A(c,a,b){var d={},e=a.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];a=a.slice(0,-e.length).trim();var f;(f=c)||(f=y);a&&(/^[.#[]/.test(a)?(q(f)||(f=y),f=f.querySelectorAll(a)):f=/^this\./.test(a)?B(f,a.slice(5)):a[0]===C?B(f,a.slice(1)):"this"===a?f:a===C?f:/^body|^html/.test(a)?document.querySelectorAll(a):"root"===a?y.documentElement:"window"===a?x:B(x,a));d.c=f;e=v(e,"on").split(":");d.a=e.shift();d.b=e;b&&(p(b)&&(b=E(b,c)),d.d=F(b,d.a,d.b));return d}var C="@";
function B(c,a){for(var b=a.split("."),d=c,e;void 0!==(e=b.shift());){if(!r(d,e))return;d=d[e]}return d}function F(c,a,b){var d=c;b.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(b){var f=b.split("(")[0];b=b.slice(f.length+1,-1);g.b[f]&&(d=g.b[f](a,d,b,c))});return d}var G=new WeakMap;g.on=function(c,a,b){p(c)&&(b=a,a=c,c=null);if(!a)return!1;k(a,function(a){H(c,a,b)})};var I=new WeakMap;
function H(c,a,b){if(b){a=A(c,a,b);var d=a.c,e=a.d;if(d)if(d.length&&!q(d))for(c=d.length;c--;)H(d[c],a.a,e);else{if(p(b)){I.has(d)||I.set(d,{});b=I.get(d);if(b[a.a])return;c&&(e=e.bind(c));b[a.a]=e}else if(e!==b){G.has(b)||G.set(b,{});c=G.get(b);if(c[a.a])return;c[a.a]=e}s(d,a.a,e)}}}g.off=function(c,a,b){p(c)&&(b=a,a=c,c=null);a&&k(a,function(a){J(c,a,b)})};
function J(c,a,b){c=A(c,a);a=c.c;var d=b;if(a)if(a.length&&!q(a))for(b=a.length;b--;)J(a[b],c.a,d);else{if(b)if(p(b)){b=I.get(a);if(!b)return;d=b[c.a];b[c.a]=null}else G.has(b)&&(b=G.get(b),b[c.a]&&(d=b[c.a],b[c.a]=null));t(a,c.a,d)}}
g.emit=function(c,a,b,d){p(c)&&(d=b,b=a,a=c,c=null);if(a instanceof Event)return u(c,a);if(!a)return!1;k(a,function(a){var f=A(c,a);return f.a?F(function(){var a=f.c;if(!a)return a;if(a.length&&!q(a))for(var c=a.length;c--;)u(a[c],f.a,b,d);else u(a,f.a,b,d)},f.a,f.b)():!1})};
var K={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2};g.b={};g.b.once=g.b.one=function(c,a,b,d){return function(b){b=a&&a.call(this,b);1!==b&&g.off(this,c,d);return b}};
g.b.filter=g.b.pass=function(c,a,b){b=b.split(z).map(w);return function(d){for(var c,f=b.length;f--;){c=b[f];var D="originalEvent"in d?d.originalEvent.which:d.which;if(c in K&&K[c]==D||D==c)return a.call(this,d)}return 1}};g.b.on=g.b.delegate=function(c,a,b){return function(c){var e=c.target;if(!q(e))return 1;for(;e&&e!==document&&e!==this;){if(h(e,b))return c.delegateTarget=e,a.call(this,c);e=e.parentNode}return 1}};
g.b.not=function(c,a,b){return function(c){for(var e=c.target;e&&e!==document&&e!==this;){if(h(e,b))return 1;e=e.parentNode}return a.call(this,c)}};var L=new WeakMap;g.b.throttle=function(c,a,b){b=parseFloat(b);return function(c){var e=this;if(L.get(e))return 1;c=a.call(e,c);if(1===c)return c;L.set(e,setTimeout(function(){clearInterval(L.e);L.delete(e)},b))}};g.b.async=g.b.after=g.b.defer=function(c,a,b){b=parseFloat(b);return function(c){var e=this;setTimeout(function(){return a.call(e,c)},b)}};
function E(c,a){return function(b){k(c,function(c){g.emit(a,c,b.detail)})}};

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
	// console.log('on', fn)
	;(targetCallbacks[evt] = targetCallbacks[evt] || []).push(fn);
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
		else if (callbacks[evt]) {
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
	// console.log('off', '\n> cb:\n', evtCallbacks[0], '\n> passed:\n', fn)

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
	if (!target) return;

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

		//copy callbacks to fire because list can change in some handler
		var fireList = evtCallbacks.slice();
		// console.log(fireList)
		for (var i = 0; i < fireList.length; i++ ) {
			fireList[i] && fireList[i].call(target, {
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