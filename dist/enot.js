!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.enot=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global = (1,eval)('this');
var doc = global.document;


//returns parsed event object from event reference
module.exports =
function enot(target, string, callback) {
	// console.group('parse reference', '`' + string + '`')
	var result = {};

	//get event name - the first token from the end
	var eventString = string.match(/\w+(?:\:\w+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	string = string.slice(0, -eventString.length).trim();
	result.target = parseTarget(target, string);

	//parse modifiers
	var eventParams = unprefixize(eventString, 'on').split(':');

	//get event name
	result.event = eventParams.shift();


	//apply modifiers to the callback passed

	//:one modifier should be the last one
	eventParams.sort(function(a,b){
		return /^one/.test(a) ? 1 : -1
	})
	.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length);

		if (modifiers[modifierName]) {
			callback = modifiers[modifierName](result.event, callback, modifierParams);
		}
	});

	//save resulting handler
	result.handler = callback;


	// console.groupEnd();
	return result;
}


//detect source element from string
var parseTarget =
function (target, str) {
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


//list of available event modifiers
var modifiers =
{
	//call callback once
	one: function(evt, fn){
		var cb = function(e){
			// console.log('once cb', fn)
			var result = fn && fn.call(this, e);
			//FIXME: `this` is not necessarily has `off`
			result !== DENY_EVT_CODE && off(this, evt, cb);
			return result;
		}
		return cb;
	},

	//filter keys
	pass: function(evt, fn, keys){
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
			// console.log('delegate cb', e.target, selector)
			if (!(e.target instanceof HTMLElement)) return DENY_EVT_CODE;

			var target = e.target;

			while (target && target !== this) {
				if (matchSelector.call(target, selector)) return fn.call(this, e);
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


// onEvt → Evt
function unprefixize(str, pf){
	return (str.slice(0,pf.length) === pf) ? str.slice(pf.length) : str;
}
},{}]},{},[1])(1)
});