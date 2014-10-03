# Enot [![Build Status](https://travis-ci.org/dfcreative/enot.svg?branch=master)](https://travis-ci.org/dfcreative/enot)

[![browser support](https://ci.testling.com/dfcreative/enot.png)
](https://ci.testling.com/dfcreative/enot)


_`1.59 kb`_ gzipped


Enot is an EventEmitter with extended <em>e</em>vents <em>not</em>ation system.



## Usage

#### 1. Install

`npm install enot`


#### 2. Use

There are 2 possible use-cases for Enot.

1. Use static event methods:

	```js
	var enot = require('enot');

	enot.on(target, 'document click:pass(right_mouse)', callback);
	enot.off(target, 'document click:pass(right_mouse)', callback);
	enot.emit(target, 'document click:pass(right_mouse)');
	```

	It might be useful if you want to use events "externally", not touching the initial objects — whether elements, expando objects etc.

2. Use as a [component/emitter](https://github.com/component/emitter) replacement:

	Instance:
	```js
	var Emitter = require('enot');

	var emitter = new Emitter;
	emitter.emit('something');
	```

	Mixin:
	```js
	var Emitter = require('enot');

	var user = {name: 'Toby'};
	Emitter(user);
	```

	Or inherit:

	```js
	var Emitter = require('emitter');

	var User = function(name){this.name = name};

	User.prototype = Object.create(Emitter.prototype);
	//or Emitter(User.prototype);

	var user = function('George');

	user.emit('I wanna poo');


	```

	This case is a common pattern of EventEmitter, so you can safely replace existing emitter with ENot.


## API





Binding options:
```js
//enable `a` event for `a` method
enot.on({a: function(){i++}}, 'a');

//bind to the document
enot.on('document click:delegate(a)', function(){})

//bind to the window (any click event)
enot.on('click:delegate(a)', function(){})

//redirect events
enot.on(target, 'click', 'close, hide');
```


##### Examples

`click` - call on click

`click:defer(100)` - call 100ms after click happens

`click:throttle(200)` - fire not more often than 200ms

`click:one` - fire once

<!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->

<!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->

<!-- `touch` - normalized crossbrowser gesture -->

`window message` - call on window gets message

`document unload` - call on user is going to leave

`.bad-link click` - elements matching selector click

`document click:delegate(.bad-link)` - the same as above but in a better way

`this.parentNode click:delegate(this.childNodes)` - hang click on parent, delegate to children

`this.childNodes click` - catch click on every children

`.element click, document keypress:pass(enter)` - bind two callbacks

<!-- `all` - call on any event -->


## Targets

* `.some-valid-selector > .inner-element`
* `parent`
* `document`
* `window`
* `body`
* `root`
* `this.property` — reference to target properties


## Modifiers

* `:one()` — the same as jQuery’s `one`.
* `:delegate(selector)` — the same as jQuery’s `delegate`.
* `:not(selector)` — the opposite to delegate.
* `:pass(code)` — filter event by matching `which` value. Useful for keyboard/mouse events. Codes:
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
* `:defer(100)` — invoke callback `100` ms after.
* `:throttle(20)` — invoke callbak not more than a time per 20 ms.

Modifiers can be combined, e.g. `click:delegate(.inner-tag):pass(right_mouse)`



---

Inspired by _xtags_ events, _backbone_ events, _component/events_ and _CSS selectors_ notations.

Utilizes [emmy event emitter](https://github.com/dfcreative/emmy) internally.


## License

MIT
