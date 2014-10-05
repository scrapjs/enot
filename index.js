var matches = require('matches-selector');
var eachCSV = require('each-csv');
var Emitter = require('emmy');
var str = require('mustring');
var type = require('mutypes');


var isString = type.isString;
var isElement = type.isElement;
var isArrayLike = type.isArrayLike;
var has = type.has;
var unprefixize = str.unprefixize;
var upper = str.upper;


var global = (1, eval)('this');
var doc = global.document;


/** Separator to specify events, e.g. click-1 (means interval=1 planned callback of click) */
var evtSeparator = '-';



/* ------------------------------ C O N S T R U C T O R ------------------------------ */


/**
 * @constructor
 * @module enot
 *
 * Mixins any object passed.
 * Implements EventEmitter interface.
 * Static methods below are useful for an old API.
 */
function Enot(target){
	if (!target) return target;

	//mixin any object passed
	for (var meth in EnotPrototype){
		target[meth] = EnotPrototype[meth];
	}

	return target;
}

var EnotPrototype = Enot.prototype;



/* -----------------------------------  O  N  ---------------------------------------- */


/**
 * Listed reference binder (comma-separated references)
 *
 * @alias addEventListener
 * @alias bind
 * @chainable
 */
EnotPrototype.addEventListener =
EnotPrototype.on = function(evtRefs, fn){
	var target = this;

	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//no events passed
	if (!evtRefs) return target;

	//in bulk events passed
	if (type.isObject(evtRefs)){
		for (var evtRef in evtRefs){
			EnotPrototype.on.call(target, evtRef, evtRefs[evtRef]);
		}
	}

	else {
		eachCSV(evtRefs, function(evtRef){
			_on(target, evtRef, fn);
		});
	}


	return target;
};


/**
 * Listed ref binder with :one modifier
 *
 * @chainable
 */
EnotPrototype.once =
EnotPrototype.one = function(evtRefs, fn){
	var target = this;

	//append ':one' to each event from the references passed
	var processedRefs = '';
	eachCSV(evtRefs, function(item){
		processedRefs += item + ':one';
	});

	return EnotPrototype.on.call(target, processedRefs, fn);
};




/**
 * Bind single reference (no comma-declared references).
 *
 * @param {*} target A target to relate reference, `document` by default.
 * @param {string} evtRef Event reference, like `click:defer` etc.
 * @param {Function} fn Callback.
 */
function _on(target, evtRef, fn) {
	//ignore empty fn
	if (!fn) return target;

	var evtObj = parseReference(target, evtRef);

	var targets = evtObj.targets,

		//get modified fn or redirector
		targetFn = isString(fn) ? getRedirector(fn, target) : fn;

	targetFn = applyModifiers.call(target, targetFn, evtObj.evt, evtObj.modifiers);

	//ignore not bindable sources
	if (!targets) return target;

	//iterate list of targets
	if (isArrayLike(targets)) {
		for (var i = targets.length; i--;){
			_on(targets[i], evtObj.evt, targetFn);
		}

		return target;
	}

	//target is one indeed
	var newTarget = targets;

	//catch redirect (stringy callback)
	if (type.isPlain(fn)) {
		//save redirect fn to cache
		if (!redirectCbCache.has(target)) redirectCbCache.set(target, {});
		var redirectSet = redirectCbCache.get(target);

		//ignore existing binding
		if (redirectSet[evtRef]) return target;

		redirectSet[evtRef] = targetFn;
	}

	//if fn has been modified - save modified fn (in order to unbind it properly)
	else {
		//bind new event
		if (!modifiedCbCache.has(fn)) modifiedCbCache.set(fn, {});
		var modifiedCbs = modifiedCbCache.get(fn);

		//ignore bound event
		if (modifiedCbs[evtObj.evt] && targetFn !== fn) return target;

		//save modified callback
		modifiedCbs[evtObj.evt] = targetFn;
	}

	// console.log('bind', newTarget, evtObj.evt, targetFn)
	Emitter.on(newTarget, evtObj.evt, targetFn);

	return target;
}



/* -----------------------------------  O  F  F  ------------------------------------- */


/**
 * Listed reference unbinder
 *
 * @alias removeEventListener
 * @alias unbind
 * @chainable
 */
EnotPrototype.removeEventListener =
EnotPrototype.removeListener =
EnotPrototype.removeAllListeners =
EnotPrototype.off = function(evtRefs, fn){
	var target = this;

	//if no target specified
	if (isString(target)) {
		fn = evtRefs;
		evtRefs = target;
		target = null;
	}

	//FIXME: remove all listeners?
	if (!evtRefs) return target;

	//in bulk events passed
	if (type.isObject(evtRefs)){
		for (var evtRef in evtRefs){
			EnotPrototype.off.call(target, evtRef, evtRefs[evtRef]);
		}
	}

	eachCSV(evtRefs, function(evtRef){
		_off(target, evtRef, fn);
	});

	return target;
};


/**
 * Single reference unbinder
 *
 * @param {Element} target Target to unbind event, optional
 * @param {string} evtRef Event notation
 * @param {Function} fn callback
 */
function _off(target, evtRef, fn){
	var evtObj = parseReference(target, evtRef);
	var targets = evtObj.targets;
	var targetFn = fn;

	if (!targets) return target;

	//iterate list of targets
	if (targets.length && !isElement(targets)) {
		for (var i = targets.length; i--;){
			_off(targets[i], evtObj.evt, targetFn);
		}

		return target;
	}

	var newTarget = targets;

	//clear planned calls for an event
	if (dfdCalls[evtObj.evt]) {
		for (var i = 0; i < dfdCalls[evtObj.evt].length; i++){
			if (intervalCallbacks[dfdCalls[evtObj.evt][i]] === fn)
				EnotPrototype.off.call(newTarget, evtObj.evt + evtSeparator + dfdCalls[evtObj.evt][i]);
		}
	}

	//catch redirect (stringy callback)
	if (fn) {
		//unbind callback
		if (type.isPlain(fn)) {
			fn += '';
			var redirectSet = redirectCbCache.get(target);

			if (!redirectSet) return;

			targetFn = redirectSet[evtRef];

			redirectSet[evtRef] = null;
		}

		//try to clean cached modified callback
		else if (modifiedCbCache.has(fn)) {
			var modifiedCbs = modifiedCbCache.get(fn);
			if (modifiedCbs[evtObj.evt]) {
				targetFn = modifiedCbs[evtObj.evt];
				//clear reference
				modifiedCbs[evtObj.evt] = null;
			}
		}
	}

	Emitter.off(newTarget, evtObj.evt, targetFn);
}


/**
 * Dispatch event to any target.
 *
 * @alias trigger
 * @alias fire
 * @alias dispatchEvent
 * @chainable
 */
EnotPrototype.dispatchEvent =
EnotPrototype.emit = function(evtRefs, data, bubbles){
	var target = this;

	//if no target specified
	if (isString(target)) {
		bubbles = data;
		data = evtRefs;
		evtRefs = target;
		target = null;
	}
	//just fire straight event passed
	if (evtRefs instanceof Event) {
		Emitter.emit(target, evtRefs, data, bubbles);
		return target;
	}

	if (!evtRefs) return target;

	eachCSV(evtRefs, function(evtRef){
		var evtObj = parseReference(target, evtRef);

		if (!evtObj.evt) return target;

		return applyModifiers.call(target, function(){
			var target = evtObj.targets;

			if (!target) return target;
			//iterate list of targets
			if (isArrayLike(target)) {
				for (var i = target.length; i--;){
					Emitter.emit(target[i], evtObj.evt, data, bubbles);
				}
			}

			//fire single target
			else {
				Emitter.emit(target, evtObj.evt, data, bubbles);
			}

		}, evtObj.evt, evtObj.modifiers)();
	});

	return target;
};



/* -------------------------------- M O D I F I E R S -------------------------------- */


/** @type {Object} Keys shortcuts */
var keyDict = {
	'ENTER': 13,
	'ESCAPE': 27,
	'TAB': 9,
	'ALT': 18,
	'CTRL': 17,
	'SHIFT': 16,
	'SPACE': 32,
	'PAGE_UP': 33,
	'PAGE_DOWN': 34,
	'END': 35,
	'HOME': 36,
	'LEFT': 37,
	'UP': 38,
	'RIGHT': 39,
	'DOWN': 40,

	'F1': 112,
	'F2': 113,
	'F3': 114,
	'F4': 115,
	'F5': 116,
	'F6': 117,
	'F7': 118,
	'F8': 119,
	'F9': 120,
	'F10': 121,
	'F11': 122,
	'F12': 123,

	'LEFT_MOUSE': 1,
	'RIGHT_MOUSE': 3,
	'MIDDLE_MOUSE': 2
};


/** Return code to stop event chain */
var DENY_EVT_CODE = 1;


/** list of available event modifiers */
Enot.modifiers = {};


/** call callback once */
//TODO: think up the way to use Emmy.one instead
Enot.modifiers['once'] =
Enot.modifiers['one'] = function(evt, fn, emptyArg, sourceFn){
	var cb = function(e){
		// console.log('once cb', fn)
		var result = fn && fn.call(this, e);
		//FIXME: `this` is not necessarily has `off`
		// console.log('off', fn)
		result !== DENY_EVT_CODE && Enot.off(this, evt, sourceFn);
		return result;
	};
	return cb;
};


/**
 * filter keys
 * @alias keypass
 * @alias mousepass
 *
*/

Enot.modifiers['filter'] =
Enot.modifiers['pass'] = function(evt, fn, keys){
	keys = keys.split(commaSplitRe).map(upper);

	var cb = function(e){
		var pass = false, key;
		for (var i = keys.length; i--;){
			key = keys[i];
			var which = 'originalEvent' in e ? e.originalEvent.which : e.which;
			if ((key in keyDict && keyDict[key] == which) || which == key){
				pass = true;
				return fn.call(this, e);
			}
		}
		return DENY_EVT_CODE;
	};
	return cb;
};


/**
 * white-filter target
 * @alias live
 */
Enot.modifiers['on'] =
Enot.modifiers['delegate'] = function(evtName, fn, selector){
	// console.log('del', selector)
	var cb = function(evt){
		var el = evt.target;

		//filter document/object/etc
		if (!isElement(el)) return DENY_EVT_CODE;

		//intercept bubbling event by delegator
		while (el && el !== doc && el !== this) {
			if (matches(el, selector)) {
				//set proper current el
				evt.delegateTarget = el;
				// evt.currentTarget = el;
				//NOTE: PhantomJS && IE8 fails on this
				// Object.defineProperty(evt, 'currentTarget', {
				// 	get: function(){
				// 		return el;
				// 	}
				// });
				return fn.call(this, evt);
			}
			el = el.parentNode;
		}

		return DENY_EVT_CODE;
	}

	return cb;
};


/**
 * black-filter target
 */
Enot.modifiers['not'] = function(evt, fn, selector){
	var cb = function(e){
		// console.log('not cb', e, selector)
		var target = e.target;

		//traverse each node from target to holder and filter if event happened within banned element
		while (target) {
			if (target === doc || target === this) {
				return fn.call(this, e);
			}
			if (matches(target, selector)) return DENY_EVT_CODE;
			target = target.parentNode;
		}

		return DENY_EVT_CODE;
	};
	return cb;
};


var throttleCache = new WeakMap();


/**
 * throttle call
 */
Enot.modifiers['throttle'] = function(evt, fn, interval){
	interval = parseFloat(interval);
	// console.log('thro', evt, fn, interval)
	var cb = function(e){
		// console.log('thro cb')
		var self = this;

		//FIXME: multiple throttles may interfere on target (key throttles by id)
		if (throttleCache.get(self)) return DENY_EVT_CODE;
		else {
			var result = fn.call(self, e);
			if (result === DENY_EVT_CODE) return result;
			throttleCache.set(self, setTimeout(function(){
				clearInterval(throttleCache.throttleKey);
				throttleCache.delete(self);
			}, interval));
		}
	}

	return cb;
};


/**
 * List of postponed calls intervals, keyed by evt name
 * @example
 * {click: 1,
 * track: 2}
 */
var dfdCalls = {};


/**
 * List of callbacks for intervals
 * To check passed off callback
 * To avoid unbinding all
 *
 * @example
 * {
 *  1: fn,
 *  2: fnRef
 * }
 */
var intervalCallbacks = {};


/**
 * Defer call - afnet Nms after real method/event
 *
 * @alias postpone
 * @param  {string}   evt   Event name
 * @param  {Function} fn    Handler
 * @param  {number|string}   delay Number of ms to wait
 * @param  {Function|string} sourceFn Source (unmodified) callback
 * @alias async
 * @return {Function}         Modified handler
 */
Enot.modifiers['after'] =
Enot.modifiers['defer'] = function(evt, fn, delay, sourceFn){
	delay = parseFloat(delay) || 0;

	var self = this;

	var cb = function(e){
		//plan fire of this event after N ms
		var interval = setTimeout(function(){
			var evtName =  evt + evtSeparator + interval;

			//fire once planned evt
			Enot.emit(self, evtName, {sourceEvent: e});
			Enot.off(self, evtName);

			//forget interval
			var idx = dfdCalls[evt].indexOf(interval);
			if (idx > -1) dfdCalls[evt].splice(idx, 1);
			intervalCallbacks[interval] = null;
		}, delay);

		//bind :one fire of this event
		Enot.on(self, evt + evtSeparator + interval, sourceFn);

		//save planned interval for an evt
		(dfdCalls[evt] = dfdCalls[evt] || []).push(interval);

		//save callback for interval
		intervalCallbacks[interval] = sourceFn;

		return interval;
	};

	return cb;
};



/* --------------------------  H  E  L  P  E  R  S ----------------------------------- */


/** @type {RegExp} Use as `.split(commaSplitRe)` */
var commaSplitRe = /\s*,\s*/;


/**
 * Return parsed event object from event reference.
 *
 * @param  {Element|Object}   target   A target to parse (optional)
 * @param  {string}   string   Event notation
 * @param  {Function} callback Handler
 * @return {Object}            Result of parsing: {evt, modifiers, targets}
 */
function parseReference(target, string) {
	var result = {};

	//get event name - the first token from the end
	var eventString = string.match(/[\w\.\:\$\-]+(?:\:[\w\.\:\-\$]+(?:\(.+\))?)*$/)[0];

	//remainder is a target reference - parse target
	string = string.slice(0, -eventString.length).trim();
	result.targets = parseTarget(target, string);

	//parse modifiers
	var eventParams = unprefixize(eventString, 'on').split(':');
	//get event name
	result.evt = eventParams.shift();
	result.modifiers = eventParams;

	return result;
}


/** @type {string} Reference to a self target members, e. g. `'@a click'` */
var selfReference = '@';


/**
 * Retrieve source element from string
 * @param  {Element|Object} target A target to relate to
 * @param  {string}         str    Target reference
 * @return {*}                     Resulting target found
 */
function parseTarget(target, str) {
	//make target global, if none
	if (!target) target = doc;

	// console.log('parseTarget `' + str + '`', target)
	if (!str){
		return target;
	}

	//try to query selector in DOM environment
	if (/^[.#[]/.test(str)) {
		if (!isElement(target)) target = doc;
		return target.querySelectorAll(str);
	}

	//return self reference
	else if (/^this\./.test(str)){
		return getProperty(target, str.slice(5));
	}
	else if(str[0] === selfReference){
		return getProperty(target, str.slice(1));
	}

	else if(str === 'this') return target;
	else if(str === selfReference) return target;

	else if(/^body|^html/.test(str)) {
		return doc.querySelectorAll(str);
	}
	else if(str === 'root') return doc.documentElement;
	else if(str === 'window') return global;

	//return global variable
	else {
		return getProperty(global, str);
	}
}


/**
 * Get property defined by dot notation in string.
 * @param  {Object} holder   Target object where to look property up
 * @param  {string} propName Dot notation, like 'this.a.b.c'
 * @return {[type]}          [description]
 */
function getProperty(holder, propName){
	var propParts = propName.split('.');
	var result = holder, lastPropName;
	while ((lastPropName = propParts.shift()) !== undefined) {
		if (!has(result, lastPropName)) return undefined;
		result = result[lastPropName];
	}
	return result;
}


/**
 * Cache of redirectors
 *
 * @example
 * cache[target][evtRef]
 */
var redirectCbCache = new WeakMap();


/**
 * Apply event modifiers to string.
 * Returns wrapped fn.
 *
 * @param  {Function}   fn   Source function to be transformed
 * @param  {string}   evt   Event name to pass to modifiers
 * @param  {Array}   modifiers   List of string chunks representing modifiers
 * @return {Function}   Callback with applied modifiers
 */
function applyModifiers(fn, evt, modifiers){
	var targetFn = fn;
	var self = this;

	modifiers.sort(function(a,b){
		//one should go last because it turns off passed event
		return /^one/.test(a) ? 1 : -1;
	})
	.forEach(function(modifier){
		//parse params to pass to modifier
		var modifierName = modifier.split('(')[0];
		var modifierParams = modifier.slice(modifierName.length + 1, -1);

		if (Enot.modifiers[modifierName]) {
			//create new context each call
			targetFn = Enot.modifiers[modifierName].call(self, evt, targetFn, modifierParams, fn);
		}
	});

	return targetFn;
}


/**
 * Set of modified callbacks associated with fns:
 *
 * @example
 * `{fn: {evtRef: modifiedFn, evtRef: modifiedFn}}`
 *
 * @type {WeakMap}
 */
var modifiedCbCache = new WeakMap();


/**
 * Return redirection statements handler.
 *
 * @param    {string}   redirectTo   Redirect declaration (other event notation)
 * @return   {function}   Callback which fires redirects
 */
function getRedirector(redirectTo, ctx){

	var cb = function(e){
		eachCSV(redirectTo, function(evt){
			if (redirectors[evt]) redirectors[evt].call(ctx, e);
			// console.log('redirect', ctx, evt)
			Enot.emit(ctx, evt, e.detail, e.bubbles);
		});
	};

	return cb;
}


/**
 * Utility callbacks shortcuts
 */
var redirectors = {
	preventDefault: function (e) {
		e.preventDefault && e.preventDefault();
	},
	stopPropagation: function (e) {
		e.stopPropagation && e.stopPropagation();
	},
	stopImmediatePropagation: function (e) {
		e.stopImmediatePropagation && e.stopImmediatePropagation();
	},
	noop: function(){}
};



/** Static aliases for old API compliance */
for (var name in EnotPrototype) {
	if (EnotPrototype[name]) Enot[name] = createStaticBind(name);
}
function createStaticBind(methodName){
	return function(a, b, c, d){
		var res = EnotPrototype[methodName].call(a,b,c,d);
		return res === a ? Enot : res;
	};
}


/** @module enot */
module.exports = Enot;