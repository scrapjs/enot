<h1>
	Enot

	<a href="https://travis-ci.org/dfcreative/enot"><img src="https://travis-ci.org/dfcreative/enot.svg?branch=master"/></a>
	<a href="https://codeclimate.com/github/dfcreative/emmy"><img src="https://codeclimate.com/github/dfcreative/emmy/badges/gpa.svg"/></a>
	<img src="https://david-dm.org/dfcreative/enot.svg"/>
	<a href="UNLICENSE"><img src="http://upload.wikimedia.org/wikipedia/commons/6/62/PD-icon.svg" width="20"/></a>
</h1>

Enot is [Emitter](https://github.com/dfcreative/emmy) with humanized **e**vents **not**ation. It is like [xtags events](http://www.x-tags.org/docs#pseudos) standalone with additional [pseudos](#pseudos).

<img src="https://cdn.rawgit.com/dfcreative/enot/design/logo.png" height="140"/>


# Install

To use in browser use browserify or [build](enot.js) (_4.4kb gzipped_).

`$ npm install enot`

```js
var Emitter = require('enot');
```

# Use

```js
Emitter.on('document click:pass(rightmouse)', callback);
Emitter.emit('document click');
```

In all regards Enot behaves as usual [Emitter](https://github.com/dfcreative/emmy). It is fully compliant with [component-emitter](https://github.com/component/emitter) and fulfills every [Emmy](https://github.com/dfcreative/emmy) use-case.


# API

Enot API consists of common Emitter methods: `on`, `off`, `once`, `emit`, `delegate`. Methods are chainable, so you can compose lists of calls: `Enot.on(target, 'click', cb).emit(target, 'click').off(target, 'click');`.

Within a callback, you can return false, then action will be prevented as it is in DOM.

<br/>

#### `Enot.on(target(s)?, event(s)?, listener)`

| Parameter | Description |
|----|----|
| `target` | Any object, including _HTMLElement_, _Array_ etc. If omitted — global event will be registered. Can be list of targets (_NodeList_ or _Array_). |
| `event` | Event declaration, in simple case — event name. |
| `callback` | Any _function_ to invoke |
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

<br/>

#### `Enot.once(target(s)?, event(s)?, listener)`

All the same arguments as [on](#on).

<br/>

#### `Enot.off(target(s), event(s)?, listener?)`

| Parameter | Description |
|----|----|
| `target` | Any object, including _HTMLElement_, _Array_ etc. If omitted — global event will be unbound. Can be list of targets (_NodeList_ or _Array_). |
| `event` | Event name. If omitted - all events for the target will be unbound. |
| `callback` | Any _function_ or _string_ previously bound. If omitted - all events for the target will be unbound. |

<br/>

#### `Enot.emit(target, event, data?, bubbles?)`

Fire event on the target. Optionally pass `data` and `bubbles` params. `data` will be accessible as `event.detail` in callback.



# Event Notation

Basic event syntax is:

```js
<target>? <event><:pseudo1><:pseudo2>...
```

| Parameter | Description |
|----|----|
| `target` | Regular CSS-selector (possibly extended with relative pseudos, see [query-relative](http://github.io/dfcreative/query-relative)), `document`/`window` keyword or target property accessible via `@` prefix, e.g. `@firstChild`. |
| `event` | Event name |
| `:modifier` | Event modifier, see [list of modifiers](#modifiers). |




# Pseudos

Use the following pseudos for events as `click:<pseudo>`.

Pseudo | Alias | Description
---|---|---
`:once` | `:one` | fire callback once.
`:on(selector)` | `:delegate(selector)` | listen for bubbled event on elements mathing selector.
`:not(selector)` | | the opposite to `delegate`—ignore bubbled event on elements matching selector.
`:pass(codes/keynames)` | `:keypass(codes/keynames)` | filter event by `code`. Useful for keyboard/mouse events. Full list of codes can be found in [key-name](https://github.com/dfcreative/key-name). Use as `:keypass(enter, 25, 26)`.
`:later(100)` | | invoke callback 100 ms after.
`:throttle(20)` | | invoke callbak not more than once per 20 ms.

Modifiers can be combined, e.g. `click:once:on(.inner-tag):not(.ignore):pass(rightmouse):later(50)`.



# Common examples:

* `click` - call on click
* `click:delay(100)` - call 100ms after click
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


[![NPM](https://nodei.co/npm/enot.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/enot/)