# Enot

Enot is an <em>e</em>vent <em>not</em>ation system. Rules are similar to CSS, but for events.

Inspired by xtags events, backbone events and component/events notations.


##### Examples

`click` - call on click

`click:after(100)` - call 100ms after click happens

`click:throttle(200)` - fire not more often than 200ms

`click:one` - fire once

`keypress:pass(ctrl + alt + del)` - catch windows task manager call

`keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent.

`touch` - normalized crossbrowser gesture

`window message` - call on window gets message

`document unload` - call on user is going to leave

`.bad-link click` - elements matching selector click

`document click:delegate(.bad-link)` - the same as above but in a better way

`this.parentNode click:delegate(this.childNodes)` - hang click on parent, delegate to children

`this.childNodes click` - catch click on every children

`.element click, document keypress:pass(enter)` - bind two callbacks


## Usage

#### 1. Install

`bower install enot`

`npm install enot`

`component install enot`


#### 2. Use

```js
var evtObj = enot.parse(target, 'document click:pass(right_mouse_button)', callback);

/*
evtObj === [{
	target: document,
	handler: fn,
	event: 'click'
}]
*/

evtObj.target.addEventListener( evtObj.event, evtObj.handler[0] );

```


## Development

`npm run build`.


## License

MIT