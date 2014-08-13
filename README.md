# Enot

Enot is an _e_vent _not_ation system. Rules are the same as CSS, but for events.


##### Examples

`click` - simple click event

`click:after(100)` - callback is called 100ms after click happened

`click:throttle(200)` - fired not more often than 200ms

`click:one` - fired once

`keypress:pass(ctrl + alt + del)` - catch windows task manager call

`keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent.

`touch` - normalized crossbrowser gesture

`window message` - window got message

`document unload` - user is going to leave

`.bad-link click` - prevent bad links click

`this.parentNode click:delegate(this.childNodes)` - hang click on parent, delegate to children


## Usage

1. Install

`bower install enot`
`npm install enot`
`component install enot`


2. Use

```js
//bind one
enot.on(target, eventString, callback);

//bind in bulk
enot.on(target, {eventString: callback});

//fire event
enot.fire(target, eventString);

//unbind one
enot.off(target, eventString, callback);

//unbind all
enot.off(target, eventString);
```


## Principle

Enot tries to engage jQuery/DOM event systems, if they’re persist.
It also falls back to own event system for non-DOM targets, like plain objects.

Inspired by xtags events & backbone events notations.

## License

MIT