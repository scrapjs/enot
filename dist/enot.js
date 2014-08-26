!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var f=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("mutypes"),m=l.isString,n=l.isElement,p=l.isPlain,q=l.has,r=(0,eval)("this"),s=r.document,t={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2},$=r.jQuery,u=/\s*,\s*/;
function v(c,d,e){var a={},b=d.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];c=(d=d.slice(0,-b.length).trim())?/^[.#[]/.test(d)&&s?s.querySelectorAll(d):/^this\./.test(d)?w(c,d.slice(5)):d[0]===x?w(c,d.slice(1)):"this"===d?c:d===x?c:"body"===d?document.body:"root"===d?document.documentElement:w(r,d):c;a.c=c;b=("on"===b.slice(0,2)?b.slice(2):b).split(":");a.a=b.shift();a.b=b;e&&(a.d=y(e,a));return a}var x="@";
function w(c,d){for(var e=d.split("."),a=c,b;void 0!==(b=e.shift());){if(!q(a,b))return;a=a[b]}return a}function y(c,d){var e=c;d.b.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(a){var b=a.split("(")[0];a=a.slice(b.length+1,-1);f.b[b]&&(e=f.b[b](d.a,e,a))});return e}var z=new WeakMap,A=new WeakMap;f.on=function(c,d,e){m(c)&&(e=d,d=c,c=null);if(!d)return!1;k(d,function(a){B(c,a,e)})};var C=new WeakMap;
function B(c,d,e){if(void 0!==e){var a=v(c,d,e),b=a.c,g=a.d;if(b)if(b.length&&!n(b))for(c=b.length;c--;)B(b[c],a.a,g);else{if(p(e)){g=f.b.fire(d,null,e+"");C.has(b)||C.set(b,{});d=C.get(b);if(d[a.a])return;c&&(g=g.bind(c));d[a.a]=g}else if(g!==e){z.has(e)||z.set(e,{});c=z.get(e);if(c[a.a])return;c[a.a]=g}a=a.a;if(b&&b.addEventListener)if($)$(b).on(a,g);else b.addEventListener(a,g);else A.has(b)||A.set(b,{}),b=A.get(b),(b[a]=b[a]||[]).push(g)}}}
f.off=function(c,d,e){m(c)&&(e=d,d=c,c=null);d&&k(d,function(a){D(c,a,e)})};function D(c,d,e){if(void 0!==e){var a=v(c,d);c=a.c;d=e;if(c)if(c.length&&!n(c))for(e=c.length;e--;)D(c[e],a.a,d);else{if(p(e)){e=C.get(c);if(!e)return;d=e[a.a];e[a.a]=null}else z.has(e)&&(e=z.get(e),e[a.a]&&(d=e[a.a],e[a.a]=null));a=a.a;if(c&&c.addEventListener)$?$(c).off(a,d):c.removeEventListener(a,d);else if(A.has(c)&&(c=A.get(c)[a]))for(a=0;a<c.length;a++)if(c[a]===d){c.splice(a,1);break}}}}
f.fire=function(c,d,e,a){m(c)&&(a=e,e=d,d=c,c=null);if(d instanceof Event)return F(c,d);if(!d)return!1;k(d,function(b){var d=v(c,b);return d.a?y(function(){var b=d.c;if(!b)return b;if(b.length&&!n(b))for(var c=b.length;c--;)F(b[c],d.a,e,a);else F(b,d.a,e,a)},d)():!1})};
function F(c,d,e,a){if(c&&c.addEventListener)if($){var b=$.Event(d,e);b.detail=e;a?$(c).trigger(b):$(c).triggerHandler(b)}else d instanceof Event?b=d:(b=s.createEvent("CustomEvent"),b.initCustomEvent(d,a,null,e)),c.dispatchEvent(b);else if(A.has(c)&&(a=A.get(c)[d]))for(var b=0,g=a.length;b<g;b++)a[b]&&a[b].call(c,{detail:e,type:d})}f.b={};f.b.one=function(c,d){function e(a){a=d&&d.call(this,a);1!==a&&f.off(this,c,e);return a}return e};
f.b.pass=function(c,d,e){e=e.split(u).map(G);return function(a){for(var b,c=e.length;c--;){b=e[c];var E="originalEvent"in a?a.originalEvent.which:a.which;if(b in t&&t[b]==E||E==b)return d.call(this,a)}return 1}};f.b.delegate=function(c,d,e){return function(a){var b=a.target;if(!n(b))return 1;for(;b&&b!==this;){if(h(b,e))return a.delegateTarget=b,Object.defineProperty(a,"currentTarget",{get:function(){return b}}),d.call(this,a);b=b.parentNode}return 1}};
f.b.not=function(c,d,e){return function(a){for(var b=a.target;b&&b!==this;){if(h(b,e))return 1;b=b.parentNode}return d.call(this,a)}};var H=new WeakMap;f.b.throttle=function(c,d,e){e=parseFloat(e);return function(a){var b=this;if(H.get(b))return 1;a=d.call(b,a);if(1===a)return a;H.set(b,setTimeout(function(){clearInterval(H.e);H.delete(b)},e))}};f.b.defer=function(c,d,e){e=parseFloat(e);return function(a){var b=this;setTimeout(function(){return d.call(b,a)},e)}};
f.b.fire=function(c,d,e){var a=e+"";return function(b){var c=this;k(a,function(a){F(c,a,b.detail)})}};function G(c){return c.toUpperCase()};

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