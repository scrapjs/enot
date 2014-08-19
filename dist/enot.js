!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var f=module.exports={},k=require("object-id"),m=require("matches-selector"),n=require("each-csv"),p=(0,eval)("this"),q=p.document,r={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2},$=p.jQuery,s=/\s*,\s*/,t={};
function u(e,a,d){var c={},b=a.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];e=(a=a.slice(0,-b.length).trim())?/^[.#[]/.test(a)&&q?q.querySelector(a):/^this\./.test(a)?e[a.slice(5)]:"@"===a[0]?e[a.slice(1)]:"this"===a?e:"@"===a?e:"body"===a?document.body:"root"===a?document.documentElement:p[a]:e;c.c=e;b=("on"===b.slice(0,2)?b.slice(2):b).split(":");c.a=b.shift();c.b=b;d&&(c.e=v(d,c));return c}
function v(e,a){var d=e;a.b.sort(function(c){return/^one/.test(c)?1:-1}).forEach(function(c){var b=c.split("(")[0];c=c.slice(b.length+1,-1);f.b[b]&&(d=f.b[b](a.a,d,c))});return d}f.on=function(e,a,d){if(!a)return!1;n(a,function(c){var b=e,a=u(b,c,d),b=a.c,g=a.e;if(b){var l=k(b);c="_on"+l+c;if(!d[c])if(d[c]=g,f.d(b))if($)$(b).on(a.a,g);else b.addEventListener(a.a,g);else b=t[l]=t[l]||{},(b[a.a]=b[a.a]||[]).push(g)}})};
f.off=function(e,a,d){if(!a)return!1;n(a,function(a){var b=e;if(d){var h=u(b,a);if(b=h.c){var g=k(b);a="_on"+g+a;var l=d[a]||d;d[a]=null;if(f.d(b))$?$(b).off(h.a,l):b.removeEventListener(h.a,l);else if(b=(t[g]=t[g]||{})[h.a])for(g=0;g<b.length;g++)if(h=b[g],h===d||h.fn===d){b.splice(g,1);break}}}})};f.fire=function(e,a,d,c){if(a instanceof Event)return w(e,a);if(!a)return!1;n(a,function(b){var a=u(e,b);return a.a?v(function(){w(a.c,a.a,d,c)},a)():!1})};
function w(e,a,d,c){if(!e)return e;var b=k(e);if(f.d(e))$?(b=$.Event(a,d),b.detail=d,c?$(e).trigger(b):$(e).triggerHandler(b)):(a instanceof Event?b=a:(b=q.createEvent("CustomEvent"),b.initCustomEvent(a,c,null,d)),e.dispatchEvent(b));else if(a=(t[b]=t[b]||{})[a])for(a=a.slice(0),c=0,b=a.length;c<b;++c)a[c].call(e,d)}f.b={};f.b.one=function(e,a){function d(c){c=a&&a.call(this,c);1!==c&&f.off(this,e,d);return c}return d};
f.b.pass=function(e,a,d){d=d.split(s).map(x);return function(c){for(var b,e=d.length;e--;){b=d[e];var g="originalEvent"in c?c.originalEvent.which:c.which;if(b in r&&r[b]==g||g==b)return a.call(this,c)}return 1}};f.b.delegate=function(e,a,d){return function(c){if(!(c.target instanceof HTMLElement))return 1;for(var b=c.target;b&&b!==this;){if(m(b,d))return a.call(this,c);b=b.parentNode}return 1}};var y={};
f.b.throttle=function(e,a,d){d=parseFloat(d);return function(c){var b="_throttle"+k(this)+e;if(y[b])return 1;c=a.call(this,c);if(1===c)return c;y[b]=setTimeout(function(){clearInterval(y[b]);y[b]=null},d)}};f.b.defer=function(e,a,d){d=parseFloat(d);return function(c){var b=this;setTimeout(function(){return a.call(b,c)},d)}};f.d=function(e){return e&&!!e.addEventListener};function x(e){return e.toUpperCase()};

},{"each-csv":2,"matches-selector":3,"object-id":4}],2:[function(require,module,exports){
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