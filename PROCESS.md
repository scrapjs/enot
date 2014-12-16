* ✘ Always keep context of target: it’s desirable behaviour. Event source, delegate and holder are accessible as event object properties.
	* No. In that case you can’t set context in any way - flexibility hurdle.

* Kinds of targets:
	* `Element`
	* `Object`
	* `undefined` - infer target from the selector passed

* Kinds of callback modifiers:
	* `Function` - no modifier
	* `undefined` - use target method instead
	* `:name` - event modifiers

* Ways to keep context:
	* handler-wrapper
		1. Create curried handler-wrapper (event modifiers, redirects, target method) ← fn, target.
		2. Store handler-wrapper keyed by fn + target←

	* `.bind`
		1. Store modified handler to modifiedCbCache = `fn: modifiedFn`
		2. Store bound modified handler to targetCbCache = `target: {modifiedFn: moundModifiedFn}`;
		- nested weak map

* Do not use redirects:
	* They seriously complicate handlers handling
	* It’s not a js way to declare things/callbacks
	* ✔ They’re easily implemented as function(e){a(e); b(e); c(e);}

* Do not use self-referenced props:
	* It seriously complicates parsing
	* It is unable to be compressed
	* ✔ It should beimplemented in 'before/after/changed' state.

* It should not have .once implementation - use Emmy's `one` instead. It’s weird to pass pseudos or any other params to .once.
	* .once('click:pass()') ? Use .on('click:once:pass')

* Avoid CSV's - you can always pass list or object with separate items.
	* 'click:a, click:b' → ['click:a', 'click:b']
	* 'a, b': {...} → 'a: {...}, b: {...}'

* :not(.a) is different scenario than :on(:not(.a)).
	* First ignores calls from `.a` element, second catches calls on from any element not `.a`, inc. from `.a` and in-between.