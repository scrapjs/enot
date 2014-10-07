# Enot [![Build Status](https://travis-ci.org/dfcreative/enot.svg?branch=master)](https://travis-ci.org/dfcreative/enot)

[![browser support](https://ci.testling.com/dfcreative/enot.png)
](https://ci.testling.com/dfcreative/enot)


Enot is an EventEmitter with extended <em>e</em>vents <em>not</em>ation inspired by [backbone declarative events](http://backbonejs.org/#View-delegateEvents) and [xtags events modifiers](http://www.x-tags.org/docs#pseudos).

Basic event declaration syntax:

`[(selector|target)] event[:modifier][, declaration]`


Common examples:

* `click` - call on click
* `click:defer(100)` - call 100ms after click
* `click:throttle(200)` - fire not more often than 200ms
* `click:one` - fire once
* `window message` - call on window gets message
* `document unload` - call on user is going to leave
* `.bad-link click` - elements matching selector click
* `document click:delegate(.bad-link)` - the same as above but in a delegate way
* `.element click, document keypress:pass(enter)` - bind two callbacks

<!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->

<!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->

<!-- `touch` - normalized crossbrowser gesture -->

<!-- `all` - call on any event -->


## Usage

#### 1. Install

`npm install enot`


#### 2. Use

There are two possible ways to use _enot_.

1. Static API

	Might be useful if you want to use events "externally", not touching the initial objects — e. g. HTMLElements, jQuery objects etc.

	```js
	var enot = require('enot');
	var target = document.querySelector('.my-element');

	enot.on(target, 'document click:pass(right_mouse)', callback);
	enot.off(target, 'document click:pass(right_mouse)', callback);
	enot.emit(target, 'document click:pass(right_mouse)');

	//bind callbacks in bulk
	enot.on(myPlugin, {
		'window resize, document myPlugin:update': 'update',
		'update': function(){...},
		'submit, click:on(.submit-button), keypress:pass(enter)': function(){...}
	});
	```

2. [EventEmitter](https://github.com/component/emitter) interface

	* Create instance:
		```js
		var Emitter = require('enot');

		var emitter = new Emitter;
		emitter.emit('something');
		```

	* Mixin:
		```js
		var Emitter = require('enot');

		var user = {name: 'Toby'};
		Emitter(user);

		user.emit('hello');
		```

	* Inherit:
		```js
		var Emitter = require('emitter');

		var User = function(name){this.name = name};

		User.prototype = Object.create(Emitter.prototype);
		//or `Emitter(User.prototype);` to mixin

		var user = new User('George');

		user.emit('poo');
		```


## Targets

As well as any valid CSS selector you can declare one of the following targets:

* `document`
* `window`
* `body`
* `root`
* `this.property` — reference to current instance properties

Example:

```js
enot(myElement, 'this.parent click', callback);
```


## Modifiers

You can use the following modifiers for events:

* `:one()`, `:once()` — fire callback once.
* `:delegate(selector)`, `:on(selector)` — listen for bubbled event on elements mathing selector.
* `:not(selector)` — the opposite to delegate - ignore bubbled event on elements matching selector.
* `:pass(code)` — filter event by `code`. Useful for keyboard/mouse events. Codes:
	* `ENTER: 13`
	* `ESCAPE: 27`
	* `TAB: 9`
	* `ALT: 18`
	* `CTRL: 17`
	* `SHIFT: 16`
	* `SPACE: 32`
	* `PAGE_UP: 33`
	* `PAGE_DOWN: 34`
	* `END: 35`
	* `HOME: 36`
	* `LEFT: 37`
	* `UP: 38`
	* `RIGHT: 39`
	* `DOWN: 40`
	* `LEFT_MOUSE: 1`
	* `RIGHT_MOUSE: 3`
	* `MIDDLE_MOUSE: `
* `:defer(100)`, `:after(100)` — invoke callback 100 ms after.
* `:throttle(20)` — invoke callbak not more than once per 20 ms.

Modifiers can be combined, e.g. `click:delegate(.inner-tag):pass(right_mouse)`


## License

MIT
