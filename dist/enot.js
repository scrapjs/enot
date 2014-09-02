!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var g=module.exports={},h=require("matches-selector"),k=require("each-csv"),l=require("muevents"),m=require("mustring"),n=require("mutypes"),p=n.isString,q=n.isElement,r=n.has,s=l.on,t=l.off,u=l.emit,v=m.unprefixize,w=m.upper,x=(0,eval)("this"),y=x.document,z=/\s*,\s*/;
function A(e,a,c){var d={},b=a.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];a=a.slice(0,-b.length).trim();var f;(f=e)||(f=y);a&&(/^[.#[]/.test(a)?(q(f)||(f=y),f=f.querySelectorAll(a)):f=/^this\./.test(a)?B(f,a.slice(5)):a[0]===C?B(f,a.slice(1)):"this"===a?f:a===C?f:/^body|^html/.test(a)?document.querySelectorAll(a):"root"===a?y.documentElement:"window"===a?x:B(x,a));d.c=f;b=v(b,"on").split(":");d.b=b.shift();d.a=b;c&&(p(c)&&(c=E(c,e)),d.d=F(c,d.b,d.a));return d}var C="@";
function B(e,a){for(var c=a.split("."),d=e,b;void 0!==(b=c.shift());){if(!r(d,b))return;d=d[b]}return d}function F(e,a,c){var d=e;c.sort(function(a){return/^one/.test(a)?1:-1}).forEach(function(b){var c=b.split("(")[0];b=b.slice(c.length+1,-1);g.a[c]&&(d=g.a[c](a,d,b,e))});return d}var G=new WeakMap;g.on=function(e,a,c){p(e)&&(c=a,a=e,e=null);if(!a)return!1;k(a,function(a){H(e,a,c)})};var I=new WeakMap;
function H(e,a,c){if(c){var d=A(e,a,c),b=d.c,f=d.d;if(b)if(b.length&&!q(b))for(e=b.length;e--;)H(b[e],d.b,f);else{if(p(c)){I.has(e)||I.set(e,{});c=I.get(e);if(c[a])return;e&&(f=f.bind(e));c[a]=f}else if(f!==c){G.has(c)||G.set(c,{});e=G.get(c);if(e[d.b])return;e[d.b]=f}s(b,d.b,f)}}}function E(e,a){return function(c){k(e,function(d){g.emit(a,d,c.detail)})}}g.off=function(e,a,c){p(e)&&(c=a,a=e,e=null);a&&k(a,function(a){J(e,a,c)})};
function J(e,a,c){var d=A(e,a),b=d.c,f=c;if(b)if(b.length&&!q(b))for(a=b.length;a--;)J(b[a],d.b,f);else{if(c)if(p(c)){e=I.get(e);if(!e)return;f=e[a];e[a]=null}else G.has(c)&&(a=G.get(c),a[d.b]&&(f=a[d.b],a[d.b]=null));t(b,d.b,f)}}g.emit=function(e,a,c,d){p(e)&&(d=c,c=a,a=e,e=null);if(a instanceof Event)return u(e,a);if(!a)return!1;k(a,function(a){var f=A(e,a);return f.b?F(function(){var a=f.c;if(!a)return a;if(a.length&&!q(a))for(var b=a.length;b--;)u(a[b],f.b,c,d);else u(a,f.b,c,d)},f.b,f.a)():!1})};
var K={ENTER:13,ESCAPE:27,TAB:9,ALT:18,CTRL:17,SHIFT:16,SPACE:32,PAGE_UP:33,PAGE_DOWN:34,END:35,HOME:36,LEFT:37,UP:38,RIGHT:39,DOWN:40,F1:112,F2:113,F3:114,F4:115,F5:116,F6:117,F7:118,F8:119,F9:120,F10:121,F11:122,F12:123,LEFT_MOUSE:1,RIGHT_MOUSE:3,MIDDLE_MOUSE:2};g.a={};g.a.once=g.a.one=function(e,a,c,d){return function(b){b=a&&a.call(this,b);1!==b&&g.off(this,e,d);return b}};
g.a.filter=g.a.pass=function(e,a,c){c=c.split(z).map(w);return function(d){for(var b,e=c.length;e--;){b=c[e];var D="originalEvent"in d?d.originalEvent.which:d.which;if(b in K&&K[b]==D||D==b)return a.call(this,d)}return 1}};g.a.on=g.a.delegate=function(e,a,c){return function(d){var b=d.target;if(!q(b))return 1;for(;b&&b!==document&&b!==this;){if(h(b,c))return d.delegateTarget=b,a.call(this,d);b=b.parentNode}return 1}};
g.a.not=function(e,a,c){return function(d){for(var b=d.target;b&&b!==document&&b!==this;){if(h(b,c))return 1;b=b.parentNode}return a.call(this,d)}};var L=new WeakMap;g.a.throttle=function(e,a,c){c=parseFloat(c);return function(d){var b=this;if(L.get(b))return 1;d=a.call(b,d);if(1===d)return d;L.set(b,setTimeout(function(){clearInterval(L.e);L.delete(b)},c))}};g.a.async=g.a.after=g.a.defer=function(e,a,c){c=parseFloat(c);return function(d){var b=this;setTimeout(function(){return a.call(b,d)},c)}};

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