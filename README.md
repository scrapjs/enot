# Enot
_`1.59 kb`_ min & gz

Enot is an <em>e</em>vent <em>not</em>ation system. Rules are similar to CSS, but for events.

Inspired by xtags events, backbone events and component/events notations.


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


## Usage

#### 1. Install

`npm install enot`


#### 2. Use

Enot implements [Emitter](https://github.com/component/emitter) interface:

```js
enot.on(target, 'document click:pass(right_mouse)', callback);
enot.off(target, 'document click:pass(right_mouse)', callback);
enot.emit(target, 'document click:pass(right_mouse)');
```

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


## Development

`npm run build`.

## TODO

* Collect & minify modules with closure compiler


## License

MIT
