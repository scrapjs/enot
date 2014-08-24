!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var g=module.exports={},k=require("matches-selector"),l=require("each-csv"),m=require("mutypes"),n=m.isString,p=m.isElement,q=(0,eval)("this"),r=q.document,s={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2},$=q.jQuery,t=/\s*,\s*/;
function u(b,a,d){var f={},c=a.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];b=(a=a.slice(0,-c.length).trim())?/^[.#[]/.test(a)&&r?r.querySelectorAll(a):/^this\./.test(a)?v(b,a.slice(5)):a[0]===w?v(b,a.slice(1)):"this"===a?b:a===w?b:"body"===a?document.body:"root"===a?document.documentElement:v(q,a):b;f.c=b;c=("on"===c.slice(0,2)?c.slice(2):c).split(":");f.a=c.shift();f.b=c;d&&(f.d=x(d,f));return f}var w="@";function v(b,a){for(var d=a.split("."),f=b,c;void 0!==(c=d.shift());)f=f[c];return f}
function x(b,a){var d=b;a.b.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(f){var c=f.split("(")[0];f=f.slice(c.length+1,-1);g.b[c]&&(d=g.b[c](a.a,d,f))});return d}var y=new WeakMap,z=new WeakMap;g.on=function(b,a,d){n(b)&&(d=a,a=b,b=null);if(!a)return!1;l(a,function(a){a:{var c=b,e=d;a=u(c,a,e);var c=a.c,h=a.d;if(c){if(h!==e){y.has(e)||y.set(e,{});e=y.get(e);if(e[a.a])break a;e[a.a]=h}if(c.length&&!p(c))for(e=c.length;e--;)A(c[e],a.a,h);else A(c,a.a,h)}}})};
function A(b,a,d){if(b&&b.addEventListener)if($)$(b).on(a,d);else b.addEventListener(a,d);else z.has(b)||z.set(b,{}),b=z.get(b),(b[a]=b[a]||[]).push(d)}g.off=function(b,a,d){n(b)&&(d=a,a=b,b=null);a&&l(a,function(a){var c=b,e=d;if(e&&(a=u(c,a),c=a.c)){var h=e;y.has(e)&&(e=y.get(e),e[a.a]&&(h=e[a.a]),e[a.a]=null);if(c.length&&!p(c))for(e=c.length;e--;)B(c[e],a.a,h);else B(c,a.a,h)}})};
function B(b,a,d){if(b&&b.addEventListener)$?$(b).off(a,d):b.removeEventListener(a,d);else if(z.has(b)&&(b=z.get(b)[a]))for(a=0;a<b.length;a++)if(b[a]===d){b.splice(a,1);break}}g.fire=function(b,a,d,f){n(b)&&(f=d,d=a,a=b,b=null);if(a instanceof Event)return C(b,a);if(!a)return!1;l(a,function(a){var e=u(b,a);return e.a?x(function(){var a=e.c;if(!a)return a;if(a.length&&!p(a))for(var c=a.length;c--;)C(a[c],e.a,d,f);else C(a,e.a,d,f)},e)():!1})};
function C(b,a,d,f){if(b&&b.addEventListener)if($){var c=$.Event(a,d);c.detail=d;f?$(b).trigger(c):$(b).triggerHandler(c)}else a instanceof Event?c=a:(c=r.createEvent("CustomEvent"),c.initCustomEvent(a,f,null,d)),b.dispatchEvent(c);else if(z.has(b)&&(a=z.get(b)[a]))for(f=0,c=a.length;f<c;f++)a[f].call(b,d)}g.b={};g.b.one=function(b,a){function d(f){f=a&&a.call(this,f);1!==f&&g.off(this,b,d);return f}return d};
g.b.pass=function(b,a,d){d=d.split(t).map(D);return function(b){for(var c,e=d.length;e--;){c=d[e];var h="originalEvent"in b?b.originalEvent.which:b.which;if(c in s&&s[c]==h||h==c)return a.call(this,b)}return 1}};g.b.delegate=function(b,a,d){return function(b){var c=b.target;if(!p(c))return 1;for(;c&&c!==this;){if(k(c,d))return b.delegateTarget=c,Object.defineProperty(b,"currentTarget",{get:function(){return c}}),a.call(this,b);c=c.parentNode}return 1}};
g.b.not=function(b,a,d){return function(b){for(var c=b.target;c&&c!==this;){if(k(c,d))return 1;c=c.parentNode}return a.call(this,b)}};var E=new WeakMap;g.b.throttle=function(b,a,d){d=parseFloat(d);return function(b){var c=this;if(E.get(c))return 1;b=a.call(c,b);if(1===b)return b;E.set(c,setTimeout(function(){clearInterval(E.e);E.delete(c)},d))}};g.b.defer=function(b,a,d){d=parseFloat(d);return function(b){var c=this;setTimeout(function(){return a.call(c,b)},d)}};
function D(b){return b.toUpperCase()};

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