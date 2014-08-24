!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var f=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("mutypes"),m=l.isString,n=l.isElement,p=(0,eval)("this"),q=p.document,r={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2},$=p.jQuery,s=/\s*,\s*/;
function t(a,b,c){var d={},e=b.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];a=(b=b.slice(0,-e.length).trim())?/^[.#[]/.test(b)&&q?q.querySelectorAll(b):/^this\./.test(b)?u(a,b.slice(5)):b[0]===v?u(a,b.slice(1)):"this"===b?a:b===v?a:"body"===b?document.body:"root"===b?document.documentElement:u(p,b):a;d.c=a;e=("on"===e.slice(0,2)?e.slice(2):e).split(":");d.a=e.shift();d.b=e;c&&(d.d=w(c,d));return d}var v="@";function u(a,b){for(var c=b.split("."),d=a,e;void 0!==(e=c.shift());)d=d[e];return d}
function w(a,b){var c=a;b.b.sort(function(d){return/^one/.test(d)?1:-1}).forEach(function(d){var a=d.split("(")[0];d=d.slice(a.length+1,-1);f.b[a]&&(c=f.b[a](b.a,c,d))});return c}var x=new WeakMap,y=new WeakMap;f.on=function(a,b,c){m(a)&&(c=b,b=a,a=null);if(!b)return!1;k(b,function(d){z(a,d,c)})};
function z(a,b,c){var d=t(a,b,c);a=d.c;var e=d.d;if(a)if(a.length&&!n(a))for(b=a.length;b--;)z(a[b],d.a,e);else{void 0===c&&(e=c=a[d.a]);m(c)&&(c=new String(c),e=f.b.fire(b,null,c));if(e!==c){x.has(c)||x.set(c,{});b=x.get(c);if(b[d.a])return;b[d.a]=e}d=d.a;if(a&&a.addEventListener)if($)$(a).on(d,e);else a.addEventListener(d,e);else y.has(a)||y.set(a,{}),a=y.get(a),(a[d]=a[d]||[]).push(e)}}f.off=function(a,b,c){m(a)&&(c=b,b=a,a=null);b&&k(b,function(d){A(a,d,c)})};
function A(a,b,c){var d=t(a,b);a=d.c;b=c;if(a)if(a.length&&!n(a))for(c=a.length;c--;)A(a[c],d.a,b);else if(void 0===c&&(b=c=a[d.a]),x.has(c)&&(c=x.get(c),c[d.a]&&(b=c[d.a]),c[d.a]=null),d=d.a,a&&a.addEventListener)$?$(a).off(d,b):a.removeEventListener(d,b);else if(y.has(a)&&(a=y.get(a)[d]))for(d=0;d<a.length;d++)if(a[d]===b){a.splice(d,1);break}}
f.fire=function(a,b,c,d){m(a)&&(d=c,c=b,b=a,a=null);if(b instanceof Event)return B(a,b);if(!b)return!1;k(b,function(b){var g=t(a,b);return g.a?w(function(){var a=g.c;if(!a)return a;if(a.length&&!n(a))for(var b=a.length;b--;)B(a[b],g.a,c,d);else B(a,g.a,c,d)},g)():!1})};
function B(a,b,c,d){if(a&&a.addEventListener)if($){var e=$.Event(b,c);e.detail=c;d?$(a).trigger(e):$(a).triggerHandler(e)}else b instanceof Event?e=b:(e=q.createEvent("CustomEvent"),e.initCustomEvent(b,d,null,c)),a.dispatchEvent(e);else if(y.has(a)&&(d=y.get(a)[b]))for(var e=0,g=d.length;e<g;e++)d[e]&&d[e].call(a,{detail:c,type:b})}f.b={};f.b.one=function(a,b){function c(d){d=b&&b.call(this,d);1!==d&&f.off(this,a,c);return d}return c};
f.b.pass=function(a,b,c){c=c.split(s).map(D);return function(a){for(var e,g=c.length;g--;){e=c[g];var C="originalEvent"in a?a.originalEvent.which:a.which;if(e in r&&r[e]==C||C==e)return b.call(this,a)}return 1}};f.b.delegate=function(a,b,c){return function(a){var e=a.target;if(!n(e))return 1;for(;e&&e!==this;){if(h(e,c))return a.delegateTarget=e,Object.defineProperty(a,"currentTarget",{get:function(){return e}}),b.call(this,a);e=e.parentNode}return 1}};
f.b.not=function(a,b,c){return function(a){for(var e=a.target;e&&e!==this;){if(h(e,c))return 1;e=e.parentNode}return b.call(this,a)}};var E=new WeakMap;f.b.throttle=function(a,b,c){c=parseFloat(c);return function(a){var e=this;if(E.get(e))return 1;a=b.call(e,a);if(1===a)return a;E.set(e,setTimeout(function(){clearInterval(E.e);E.delete(e)},c))}};f.b.defer=function(a,b,c){c=parseFloat(c);return function(a){var e=this;setTimeout(function(){return b.call(e,a)},c)}};
f.b.fire=function(a,b,c){var d=c+"";return function(a){var b=this;k(d,function(c){B(b,c,a.detail)})}};function D(a){return a.toUpperCase()};

},{"each-csv":2,"matches-selector":3,"mutypes":4}],2:[function(require,module,exports){
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