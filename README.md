# Enot [![Build Status](https://travis-ci.org/dfcreative/enot.svg?branch=master)](https://travis-ci.org/dfcreative/enot) ![Deps](https://david-dm.org/dfcreative/enot.svg)

Enot is an EventEmitter with extended <em>e</em>vents <em>not</em>ation, something in between [backbone events](http://backbonejs.org/#View-delegateEvents) and [xtags events](http://www.x-tags.org/docs#pseudos). Useful in complicated components development.


# Install

If you’re going to use it in browser, please use browserify, component, duo or alike.

`$ npm install enot`

```js
var enot = require('enot');
```

# Use

### As wrapper (static methods)

```js
enot.on(target, 'document click:pass(right_mouse)', callback);
enot.one(target, 'document click:pass(right_mouse)', callback);
enot.off(target, 'document click:pass(right_mouse)', callback);
enot.emit(target, 'document click:pass(right_mouse)');
```

Might be useful if you want to use events "externally", not touching the initial objects — e. g. HTMLElements, jQuery objects etc.


### As Emitter class

```js
var Emitter = require('enot');
```

##### Create instance:

```js
var emitter = new Emitter;
emitter.emit('something');
```

##### Mixin object:

```js
var user = {name: 'Toby'};
Emitter(user);

user.emit('hello');
```

###### Inherit class:

```js
var User = function(name){this.name = name};

User.prototype = Object.create(Emitter.prototype);
//or `Emitter(User.prototype);` to mixin

var user = new User('George');

user.emit('poo');
```


# API

Enot API consists of common EventEmitter interface methods: `on`, `off`, `once`, `emit`, `delegate`. Methods are chainable, so you can compose lists of calls: `Enot.on(target, 'click', cb).emit(target, 'click').off(target, 'click');`


### On

###### `Enot.on(target?, event, callback)`
###### `Enot.on(target, events)`

| Parameter | Description |
|----|----|
| `target` | Any object, including _HTMLElement_, _Array_ etc. If omitted — global event will be registered. Can be list of targets (_NodeList_ or _Array_). |
| `event` | Event declaration, in simple case — event name. |
| `callback` | Any _function_ or _string_. If string is used, then event will be emitted. |
| `events` | Object with event declarations as keys and callbacks as values. |

```js
//simple event
Enot.on(document.querySelectorAll('.buy-button'), 'click', function(){...});

//events object
Enot.on(myPlugin, {
	'window resize, document myPlugin:update': 'update',
	'update': function(){...},
	'submit, click:on(.submit-button), keypress:pass(enter)': function(){...}
});
```

### One

All the same arguments as [on](#on).


### Off

###### `Enot.off(target?, event, callback)`
###### `Enot.off(target?, event)`
###### `Enot.off(target)`

| Parameter | Description |
|----|----|
| `target` | Any object, including _HTMLElement_, _Array_ etc. If omitted — global event will be unbound. Can be list of targets (_NodeList_ or _Array_). |
| `event` | Event name. If omitted - all events for the target will be unbound. |
| `callback` | Any _function_ or _string_ previously bound. If omitted - all events for the target will be unbound. |


### Emit

###### `Enot.emit(target, event, data?, bubbles?)`

Fire event on the target. Optionally pass `data` and `bubbles` params. `data` will be accessible as `event.detail` in callback.



## Event declaration

Basic event declaration syntax:

```js
[target] event[:modifier][, <declaration>]
```

| Parameter | Description |
|----|----|
| `target` | Regular CSS-selector (possibly extended with relative pseudos, see [query-relative](http://github.io/dfcreative/query-relative)), `document`/`window` keyword or target property accessible via `@` prefix, e.g. `@firstChild`. |
| `event` | Event name |
| `:modifier` | Event modifier, see [list of modifiers](#modifiers). |


#### Common examples:

* `click` - call on click
* `click:defer(100)` - call 100ms after click
* `click:throttle(200)` - fire not more often than 200ms
* `click:one` - fire once
* `window message` - call on window gets message
* `document unload` - call on user is going to leave
* `.bad-link click` - elements matching selector click
* `:root click:delegate(.bad-link)` - the same as above but in a delegate way
* `.element click, document keypress:pass(enter)` - bind two callbacks
<!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->
<!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->
<!-- `touch` - normalized crossbrowser gesture -->
<!-- `all` - call on any event -->


## Modifiers

You can use the following modifiers for events:

* `:one`, `:once` — fire callback once.
* `:delegate(selector)` — listen for bubbled event on elements mathing selector.
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
* `:defer(100)` — invoke callback 100 ms after.
* `:throttle(20)` — invoke callbak not more than once per 20 ms.

Modifiers can be combined, e.g. `click:delegate(.inner-tag):pass(right_mouse)`


## License

MIT


[![NPM](https://nodei.co/npm/enot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enot/)