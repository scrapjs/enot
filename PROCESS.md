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
	* They’re easily implemented as function(e){a(e); b(e); c(e);}
	* It’s not a js way to declare redirects