!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var f=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("mutypes"),m=l.isString,n=l.isElement,p=l.isPlain,q=l.has,r=(0,eval)("this"),s=r.document,t={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2},$=r.jQuery,u=/\s*,\s*/;
function v(c,e,d){var a={},b=e.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];c=(e=e.slice(0,-b.length).trim())?/^[.#[]/.test(e)&&s?s.querySelectorAll(e):/^this\./.test(e)?w(c,e.slice(5)):e[0]===x?w(c,e.slice(1)):"this"===e?c:e===x?c:"body"===e?document.body:"root"===e?document.documentElement:w(r,e):c;a.c=c;b=("on"===b.slice(0,2)?b.slice(2):b).split(":");a.a=b.shift();a.b=b;d&&(a.d=y(d,a));return a}var x="@";
function w(c,e){for(var d=e.split("."),a=c,b;void 0!==(b=d.shift());){if(!q(a,b))return;a=a[b]}return a}function y(c,e){var d=c;e.b.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(a){var b=a.split("(")[0];a=a.slice(b.length+1,-1);f.b[b]&&(d=f.b[b](e.a,d,a))});return d}var z=new WeakMap,A=new WeakMap;f.on=function(c,e,d){m(c)&&(d=e,e=c,c=null);if(!e)return!1;k(e,function(a){B(c,a,d)})};var C={};
function B(c,e,d){var a=v(c,e,d),b=a.c,g=a.d;if(b)if(b.length&&!n(b))for(c=b.length;c--;)B(b[c],a.a,g);else{if(void 0===d)g=b[a.a];else if(p(d)){d+="";g=f.b.fire(e,null,d);C[d]=C[d]||{};if(C[d][a.a])return;c&&(g=g.bind(c));C[d][a.a]=g}else if(g!==d){z.has(d)||z.set(d,{});c=z.get(d);if(c[a.a])return;c[a.a]=g}a=a.a;if(b&&b.addEventListener)if($)$(b).on(a,g);else b.addEventListener(a,g);else A.has(b)||A.set(b,{}),b=A.get(b),(b[a]=b[a]||[]).push(g)}}
f.off=function(c,e,d){m(c)&&(d=e,e=c,c=null);e&&k(e,function(a){D(c,a,d)})};function D(c,e,d){var a=v(c,e);c=a.c;e=d;if(c)if(c.length&&!n(c))for(d=c.length;d--;)D(c[d],a.a,e);else if(void 0===d&&(e=d=c[a.a]),p(d)?(d+="",C[d]&&(e=C[d][a.a],C[d][a.a]=null)):z.has(d)&&(d=z.get(d),d[a.a]&&(e=d[a.a],d[a.a]=null)),a=a.a,c&&c.addEventListener)$?$(c).off(a,e):c.removeEventListener(a,e);else if(A.has(c)&&(c=A.get(c)[a]))for(a=0;a<c.length;a++)if(c[a]===e){c.splice(a,1);break}}
f.fire=function(c,e,d,a){m(c)&&(a=d,d=e,e=c,c=null);if(e instanceof Event)return F(c,e);if(!e)return!1;k(e,function(b){var e=v(c,b);return e.a?y(function(){var b=e.c;if(!b)return b;if(b.length&&!n(b))for(var c=b.length;c--;)F(b[c],e.a,d,a);else F(b,e.a,d,a)},e)():!1})};
function F(c,e,d,a){if(c&&c.addEventListener)if($){var b=$.Event(e,d);b.detail=d;a?$(c).trigger(b):$(c).triggerHandler(b)}else e instanceof Event?b=e:(b=s.createEvent("CustomEvent"),b.initCustomEvent(e,a,null,d)),c.dispatchEvent(b);else if(A.has(c)&&(a=A.get(c)[e]))for(var b=0,g=a.length;b<g;b++)a[b]&&a[b].call(c,{detail:d,type:e})}f.b={};f.b.one=function(c,e){function d(a){a=e&&e.call(this,a);1!==a&&f.off(this,c,d);return a}return d};
f.b.pass=function(c,e,d){d=d.split(u).map(G);return function(a){for(var b,c=d.length;c--;){b=d[c];var E="originalEvent"in a?a.originalEvent.which:a.which;if(b in t&&t[b]==E||E==b)return e.call(this,a)}return 1}};f.b.delegate=function(c,e,d){return function(a){var b=a.target;if(!n(b))return 1;for(;b&&b!==this;){if(h(b,d))return a.delegateTarget=b,Object.defineProperty(a,"currentTarget",{get:function(){return b}}),e.call(this,a);b=b.parentNode}return 1}};
f.b.not=function(c,e,d){return function(a){for(var b=a.target;b&&b!==this;){if(h(b,d))return 1;b=b.parentNode}return e.call(this,a)}};var H=new WeakMap;f.b.throttle=function(c,e,d){d=parseFloat(d);return function(a){var b=this;if(H.get(b))return 1;a=e.call(b,a);if(1===a)return a;H.set(b,setTimeout(function(){clearInterval(H.e);H.delete(b)},d))}};f.b.defer=function(c,e,d){d=parseFloat(d);return function(a){var b=this;setTimeout(function(){return e.call(b,a)},d)}};
f.b.fire=function(c,e,d){var a=d+"";return function(b){var c=this;k(a,function(a){F(c,a,b.detail)})}};function G(c){return c.toUpperCase()};

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