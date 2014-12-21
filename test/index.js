var WeakMap = typeof WeakMap !== 'undefined' ? WeakMap : require('polymer-weakmap/weakmap');
var Enot = typeof Emitter !== 'undefined' ? Emitter : require('..');
var assert = typeof chai !== 'undefined' ? chai.assert : require('chai').assert;


//create testing tree
var c = document.createElement('div');
c.className = 'container';
var p = document.createElement('div');
p.className = 'parent';
var t = document.createElement('div');
t.className = 'target';
var f = document.createElement('div');
f.className = 'first';
var s = document.createElement('div');
s.className = 'second';
var l = document.createElement('div');
l.className = 'last';
var i = document.createElement('div');
i.className = 'inner';


document.body.appendChild(c);
c.appendChild(p);
p.appendChild(f);
p.appendChild(s);
p.appendChild(t);
p.appendChild(l);
t.appendChild(i);


describe('Static API', function(){
	it("Basic on/emit/off", function(){
		var i = 0;
		var cb = function(e){
			assert.equal(e.detail, 123);
			// console.log('off')
			Enot.off(document, "hello", cb);
			i++;
		};
		Enot.on(document, "hello", cb);

		// console.log('---emits')
		Enot.emit(document, "hello", 123)
		.emit(document, "hello", 123);

		assert.equal(i,1);
	});


	it('List of targets', function(){
		var targets = [f,s,l];
		var i = 0;

		function fn(){
			i++;
		}

		// console.log('---on')
		Enot.on(targets, 'x', fn)
		// console.log('---emit')
		Enot.emit(targets, 'x');

		assert.equal(i, 3);

		// console.log('---off')
		Enot.off(targets, 'x', fn)
			.emit(targets, 'x');

		assert.equal(i, 3);
	});


	it('Batch references', function(){
		var i = 0;

		var a = {
			a: function(){i++},
			b: function(){i--}
		};

		Enot.on(a, a);

		Enot.emit(a, 'a');

		assert.equal(i, 1);

		Enot.emit(a, 'b');

		assert.equal(i, 0);

		Enot.off(a, a);

		Enot.emit(a, 'a');

		assert.equal(i, 0);
	});


	it("Pass details", function(){
		var i = 0;
		var fn = function(e){
			e.detail === 123 && i++;
		};
		Enot.on(document, "hello", fn);
		Enot.emit(document, "hello", 123);
		assert.equal(i, 1)

		Enot.off(document, "hello", fn);
		Enot.emit(document, "hello", 123);
		assert.equal(i, 1);
	});
});



describe('Emitter class', function(){
	it('inherit Enot', function(){
		var A = function(){};
		A.prototype = Object.create(Enot.prototype);
		var a = new A;

		var i = 0;
		a.on('a:once', function(){i++});
		a.emit('a');
		a.emit('a');
		assert.equal(i, 1);
	});
});



describe("Pseudos", function(){
	it("`:once` pseudo", function(){
		var i = 0, j = 0;
		Enot.on(document, "hello:once", function(e){
			e.detail === 123 && i++;
		});
		Enot.on(document, "hello:once", function(e){
			e.detail === 123 && i++;
		});
		// console.log('--emit')
		Enot.emit(document, "hello", 123);
		assert.equal(i, 2);

		// console.log('--emit2')
		Enot.emit(document, "hello", 123);
		assert.equal(i, 2);

		// console.log('--emit3')
		Enot.emit(document, "hello", 123);
		assert.equal(i, 2);
	});


	it("unbind :once callbacks", function(){
		var a = document.createElement('div');
		var log = [];
		var fn = function(){log.push(1)};

		Enot.on(a, 'a:once', fn);
		Enot.off(a, 'a', fn);
		Enot.emit(a, 'a');
		Enot.emit(a, 'a');

		assert.deepEqual(log, []);

		log = [];
		Enot.on(a, 'b:once', fn);
		Enot.off(a, 'b:once', fn);
		Enot.emit(a, 'b');
		Enot.emit(a, 'b');

		assert.deepEqual(log, []);
	});


	it(":delegate", function(){
		if (window.mochaPhantomJS) return;

		var i = 0, j = 0;
		var el = document.createElement("div");
		document.body.appendChild(el);

		var inc = function(){
			i++;
		};

		// console.log('---bind body')
		Enot.on(document.body, "document hello:delegate(p, div, .some)", inc);

		var sideLink = document.createElement("span");
		document.body.appendChild(sideLink);

		// console.log('---bind sidelink')
		Enot.on(sideLink, "hello", function(){
			j++;
		});

		// console.log('---emit body hello')
		Enot.emit(document.body, "hello");
		assert.equal(i, 0);

		// console.log('---emit el hello')
		Enot.emit(el, "hello", null, true);
		assert.equal(i, 1);

		// console.log('---emit sidelink hello')
		// Enot.emit(sideLink, "hello", null, true);
		// assert.equal(i, 1);
		// assert.equal(j, 1);

		// Enot.off(document.body, "document hello:delegate(div)", inc);
	});


	it("click:pass pseudo", function(){
		var i = 0;
		var el = document.createElement("div");
		document.body.appendChild(el);

		Enot.on(el, "click:pass(rightMouse, leftMouse)", function(e){
			// console.log("filtered click")
			i++
		})
		Enot.on(el, "click", function(){
			// console.log("simple click")
		})

		var evt = createMouseEvt("click", 1)
		// console.log("----fire 2")
		Enot.emit(el, evt);

		assert.equal(i, 0);

		var evt = createMouseEvt("click", 2);
		Enot.emit(el, evt);

		assert.equal(i, 1);
	});

	it("keypress:pass pseudo", function(){
		if (/phantomjs/i.test(navigator.userAgent)) return;

		var k = 0, a = 0, ka=0;
		var el = document.createElement("div");

		Enot.on(el, "keydown", function(e){
			// console.log("all", e)
			a++
		})
		Enot.on(el, "keydown:pass(83, Enter)", function(e){
			// console.log("→ filtered 1")
			k++
		})
		Enot.on(el, "keydown:pass(65, enter, 68)", function(e){
			// console.log("→ filtered 2")
			ka++
		})

		var evt = createKeyEvt("keydown", 65)

		Enot.emit(el, evt);
		assert.equal(a, 1)
		assert.equal(k, 0)
		assert.equal(ka, 1)

		// s
		var evt = createKeyEvt("keydown", 83)
		Enot.emit(el, evt);
		assert.equal(a, 2)
		assert.equal(k, 1)
		assert.equal(ka, 1)

		// s2
		var evt = createKeyEvt("keydown", 83);
		Enot.emit(el, evt);
		assert.equal(a, 3)
		assert.equal(k, 2)
		assert.equal(ka, 1)

		//enter
		var evt = createKeyEvt("keydown", 13);
		Enot.emit(el, evt);
		assert.equal(a, 4);
		assert.equal(k, 3);
		assert.equal(ka, 2);
	});

	it("combine modifiers", function(){
		if (/phantomjs/i.test(navigator.userAgent)) return;

		var i = 0;

		var el = document.createElement("div");
		el.className = "item";

		var el2 = document.createElement("div");

		document.body.appendChild(el);
		document.body.appendChild(el2);

		Enot.on(document.body, "hello:delegate(.item):once", function(e){
			e.detail === 123 && i++
		});

		// console.log('---emit body')
		Enot.emit(document, "hello", 123, true);
		assert.equal(i, 0);
		// console.log('---emit el')
		Enot.emit(el, "hello", 123, true);
		assert.equal(i, 1);
		// console.log('---emit el2')
		Enot.emit(el2, "hello", 123, true);
		assert.equal(i, 1);
		// console.log('---emit el')
		Enot.emit(el, "hello", 123, true);
		assert.equal(i, 1);
		// console.log('---emit el2')
		Enot.emit(el, "hello", 123, true);
		assert.equal(i, 1);

		// once again
		var i = 0;
		Enot.on(document.body, "keydown:delegate(.item, .post):pass(escape)", function(e){
			// console.log("keypress shit", e)
			i++
		})

		Enot.emit(document.body, createKeyEvt("keypress", 27), 123, true)
		assert.equal(i, 0)
		// console.log('-----emit', el)
		Enot.emit(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		Enot.emit(el2, "hello", createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		Enot.emit(el, "hello", createKeyEvt("keydown", 29), 123, true)
		assert.equal(i, 1)
		Enot.emit(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 2)
	});

	it(":not(selector)", function(){
		var i = 0, j = 0;

		var a = document.createElement('div');
		a.className = 'a';

		document.body.appendChild(a);

		var b = document.createElement('div');
		b.className = 'b';
		a.appendChild(b);
		var c = document.createElement('div');
		c.className = 'c';
		b.appendChild(c);
		var d = document.createElement('span');
		d.className = 'd';
		c.appendChild(d);

		// console.log('--------on :root click');
		Enot.on(':root click:not(.a)', function(){
			i++
		});
		// console.log('--------on .b click');
		Enot.on('.b click:not(.c)', function(){
			j++
		})

		// console.log('--------emit body click');
		Enot.emit('body click', null, true);
		assert.equal(i, 1);

		// console.log('--------emit a click');
		Enot.emit(a, 'click', null, true);
		// console.log('--------emit b click');
		Enot.emit(b, 'click', null, true);
		// console.log('--------emit c click');
		Enot.emit(c, 'click', null, true);
		// console.log('--------emit d click');
		Enot.emit(d, 'click', null, true);
		assert.equal(i, 1);
		assert.equal(j, 1);
	});

	it(":not on elements which are no more in DOM", function(){
		var a = document.createElement('div');
		a.className = 'a';
		a.innerHTML = '<span class="x"></span>'
		document.body.appendChild(a);

		var i = 0;


		Enot.on(a, 'click', function(){
			// console.log('---a click', this)
			this.innerHTML = '<span></span>'
		})

		//look how element caused the event has been removed from DOM in the first callback, but doc is still triggered by it
		Enot.on('document click:not(.a)', function(e){
			// console.log('---document click', this, a.innerHTML)
			i++
		});
		// console.log('----emit click', a.firstChild)
		Enot.emit(a.firstChild, 'click', true, true);

		assert.equal(i, 0);
	})

	it(":later, :later(), :later(N)", function(done){
		var a = document.createElement('div');
		var i = 0;

		Enot.on(a, 'dsd:later(100)', function(){
			i++;
		});
		Enot.emit(a, 'dsd');
		assert.equal(i, 0);

		setTimeout(function(){
			assert.equal(i, 1);
			done();
		}, 110);
	});
});


//TODO: structurize these tests
//TODO: separate functionality tests and corner-cases
describe("Regression", function(){
	it("treat unknown modifiers as a part of event", function(){
		var i = 0;
		Enot.on(document,"hello:world", function(){
			i++
		})
		Enot.emit(document, "hello:world")
		assert.equal(i, 1);
	});

	it("don't shit the bed with window binding", function(){
		Enot.on(document.body, 'window resize', function(){})
	});

	it("fire on discrete delegate target", function(){
		if (window.mochaPhantomJS) return;

		var log = [];

		Enot.on(document, "document hello:delegate(.target)", function(){
			log.push("hello")
		})

		var el = document.createElement("div");
		var outerEl = document.createElement("div");
		outerEl.className = "target";
		outerEl.appendChild(el);
		document.body.appendChild(outerEl)

		dispatchEvt(el, "hello", null, true);

		assert.deepEqual(log, ["hello"])
	});

	it("should fire events on different targets", function(){
		var i = 0;
		var a = document.createElement('div');
		var b = document.createElement('div');
		var fn = function(){i++}
		// console.log('bind a')
		Enot.on(a, 'a', fn);
		// console.log('bind b')
		Enot.on(b, 'a', fn);
		// console.log('emit a')
		Enot.emit(a, 'a')
		// console.log('emit b')
		Enot.emit(b, 'a')

		assert.equal(i,2)
	});

	it("empty target", function(){
		Enot.on({}, '.xy a', function(){})
		Enot.off({}, '.xy a', function(){})
	});

	it("fire recognizes evtRef events", function(){
		var i = 0;
		Enot.on(document, 'x', function(){i++});
		Enot.emit({}, 'document x');

		assert.equal(i, 1);
	});

	it("listed declarations", function(){
		var i = 0,
			target = {
				a: {},
				b: document.body
			}

		Enot.on(target, 'x, y, z', function(){
			i++;
		});
		Enot.on(document, 'f,z', function(){
			i++
		})

		Enot.emit(target, 'x,y');
		assert.equal(i, 2);

		Enot.emit(document.body, 'z,document f', null, true);
		assert.equal(i,4);
	});

	it('mod delegate case', function(){
		if (window.mochaPhantomJS) return;

		var i = 0;
		Enot.on(null, 'body evt:delegate(.a)', function(){
			i++
		});

		var el = document.createElement("div");
		el.className = "a";
		document.body.appendChild(el);

		dispatchEvt(el, "evt", true, true);
		assert.equal(i, 1);
	});

	it(':throttle mod case', function(done){
		var i = 0;
		var a = document.createElement('div');
		// console.time('x')
		// var initT = +new Date;

		//should be called 10 times less often than dispatched event
		Enot.on(a, "x:throttle(50)", function(){
			i++
			// console.log(new Date - initT);
			assert.equal(this, a);
		})

		document.body.appendChild(a);

		var interval = setInterval(function(){
			dispatchEvt(a, "x")
		},5)

		setTimeout(function(){
			//should be instantly called
			assert.equal(i, 1);
		}, 11);

		setTimeout(function(){
			clearInterval(interval);
			// console.timeEnd('x');

			assert.closeTo(i, 5, 1);
			done();
		}, 240)
	});

	// <!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->
	it("key modifiers");

	// <!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->
	it("sequence of keypresses");

	// <!-- `touch` - normalized crossbrowser gesture -->
	it("normalized touch");

	//normalized crossbrowser animend
	it("animend");

	// <!-- `all` - call on any event -->
	it("any event");

	it("absent target", function(){
		var i = 0;
		// console.log('---on doc')
		var inc = function(){
			i++
		};
		Enot.on("document click", inc);
		// console.log('---emit')
		Enot.emit("document click");
		Enot.emit(document, "click");

		assert.equal(i, 2);

		Enot.emit("document click");
		assert.equal(i, 3);

		// console.log('---off doc')
		Enot.off(document, "click", inc);
		Enot.emit("document click");
		Enot.emit(document, "click");
		assert.equal(i, 3);
	});

	it(":delegate() currentTarget & target", function(){
		if (window.mochaPhantomJS) return;

		var a = document.createElement('div');
		a.className = 'd';
		var b = document.createElement('div');
		a.appendChild(b);
		document.body.appendChild(a);

		var cTarget;
		Enot.on('document click:delegate(.d)', function(e){
			cTarget = e.delegateTarget;
		});
		Enot.emit(b, 'click', null, true);
		assert.equal(cTarget, a);
	});

	it(".items event - bind all selected items, not the only one", function(){
		var a1 = document.createElement('div')
		a1.className = 'aer';
		var a2 = a1.cloneNode(true);

		document.body.appendChild(a1);
		document.body.appendChild(a2);

		var i = 0;
		var inc = function(){
			i++
		}
		Enot.on('.aer click', inc);
		Enot.emit(document.querySelectorAll('.aer'), 'click');
		assert.equal(i, 2);

		Enot.emit('.aer click');
		assert.equal(i, 4);

		// console.log('--------- off .aer click')
		Enot.off('.aer click', inc);
		Enot.emit('.aer click');
		assert.equal(i, 4);

		//NodeList tests
		// var nativeNodeList = NodeList;
		// window.NodeList = null;
		// Enot.emit(document.querySelectorAll('.aer'), 'click');
		// assert.equal(i, 4);
		// window.NodeList = nativeNodeList;
	});

	it("ignore empty callback", function(){
		var i = 0;

		var target = {
			a: function(){
				i++
			}
		}

		Enot.on(target, 'a');
		Enot.emit(target, 'a');
		assert.equal(i, 0);

		Enot.off(target, 'a');
		Enot.emit(target, 'a');


		Enot.emit({}, 'b');

		assert.equal(i, 0);
	});

	it("target order notation agnostic");

	it("no target means viewport === any event of this type", function(){
		var i = 0;
		Enot.on('a', function(){
			i++
		});

		Enot.emit('a');
		assert.equal(i, 1);

		Enot.off('a');
		Enot.emit('a');
		assert.equal(i, 1);
	});

	it("multiple off", function(){
		var i = 0;
		var a = {
			x: function(){i++}
		}

		Enot.on(a, 'x', a.x);
		Enot.on(a, 'y', function(){a.x()});
		Enot.emit(a, 'x');
		Enot.emit(a, 'y');

		assert.equal(i, 2);

		Enot.off(a, 'x');
		Enot.off(a, 'y');
		Enot.emit(a, 'x');
		Enot.emit(a, 'y');
		assert.equal(i, 2);
	});

	//FIXME: unfortunately, component-emitter is intrusive
	it.skip('keep target objects untouched (jQuery intrusion)', function(){
		var a = {};
		Enot.on(a, 'x', function(){});

		assert.deepEqual(a, {})
	});

	it('delegate within target', function(){
		var log = [];

		var a = document.createElement('div');
		a.innerHTML  = '<div class="xxx"></div>';
		document.body.appendChild(a);
		var b = a.firstChild.cloneNode();
		document.body.appendChild(b);

		Enot.on(a, 'click:delegate(.xxx)', function(){
			log.push(1)
		});
		Enot.on('click:delegate(.xxx)', function(){
			log.push(2)
		})
		Enot.on(a, '.xxx click', function(){
			log.push(3)
		})
		Enot.emit('.xxx click', true, true);
		assert.sameMembers(log, [1,2,3]);

		Enot.off(a, 'click');
		Enot.off(a, '.xxx click');
		Enot.off('.xxx click');

		Enot.emit('.xxx click', true, true);
		assert.sameMembers(log, [1,2,3]);
	})


	it("multiple :once callbacks", function(){
		var a = {}, log = [];

		Enot.on(a, 'init:once', function(){
			log.push(1)
		})
		Enot.on(a, 'init:once', function(){
			log.push(2)
		})
		Enot.on(a, 'init:once', function(){
			log.push(3)
		})

		Enot.emit(a, 'init');
		assert.deepEqual(log, [1,2,3])

		Enot.emit(a, 'init');
		assert.deepEqual(log, [1,2,3])
	})

	it("query elements out of target", function(){
		var log = [];

		var a = document.createElement('div');

		var b = a.cloneNode();
		b.className = 'item';

		document.body.appendChild(a);
		document.body.appendChild(b);

		Enot.on(a, ':root .item click', function(){
			log.push(1)
		})
		Enot.on(a, '.item click', function(){
			log.push(2);
		})


		Enot.emit(b, 'click');
		Enot.emit(a, 'click');

		assert.deepEqual(log, [1]);
	})

	it("bind dotted notations", function(){
		var a = {
			inc: function(){
				i++
			}
		};
		var i = 0;
		Enot.on(a, "a.b", a.inc)
		Enot.emit(a, "a.b");

		assert.equal(i, 1);

		// console.log('---off')
		Enot.off(a, "a.b");
		Enot.emit(a, "a.b");
		assert.equal(i, 1);
	});

	it("list only queryResults, not the any object with length", function(){
		var i = 0;

		var a = document.createElement('iframe');
		// a.src = 'http://kudago.com';
		a.style.display = 'none';
		document.body.appendChild(a);

		Enot.on({}, 'window x', function(){
			i++
		})

		Enot.emit('window x');
		Enot.emit('window x');

		assert.equal(i, 2);
	});

	it.skip("emit event instances passed", function(){
		//faced this case in MOD with Enot.emit(a,b, event) in redirector
		//faced this case in draggy when I needed emit(Draggy.element, 'mouseenter', outerMouseEvent);
		var target = {};
		var i = 0;

		Enot.on(target, 'x', function(e){
			i++
			assert.equal(e.detail, 123)
		})

		var e = new CustomEvent('x', {'detail': 123});
		Enot.emit(target, e);

		assert.equal(i, 1);
	})

	it('jQuery event separator (.)')

	it('one method', function(){
		var i = 0;
		Enot.once(document, "hello", function(e){
			e.detail === 123 && i++
		})
		Enot.once(document, "hello", function(e){
			e.detail === 123 && i++
		})
		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)
	})


	it.skip('test lists in .once', function(){
		Enot.once('a, b', function(){

		})
	})

	it('a function shared between targets', function(){
		var a = {};
		var b = {};
		var i = 0, j = 0;

		var fn = function(){
			this === a && i++;
			this === b && j++;
		}

		Enot.on(a, 'x', fn);
		Enot.on(b, 'x', fn);

		Enot.emit(a, 'x');
		Enot.emit(b, 'x');

		assert.equal(i, 1);
		assert.equal(j, 1);
	})

	it.skip('delegate method', function(){
		Enot.delegate('.some x', fn);
		Enot.off('.some x', fn);
	});
});























//helpers
function dispatchEvt(el, eventName, data, bubbles){
	var event;
	if (el instanceof HTMLElement || el === window || el === document) {
		if (!(eventName instanceof Event)) {
			event =  document.createEvent("CustomEvent");
			event.initCustomEvent(eventName, bubbles, null, data)
		} else {
			event = eventName;
		}
		// var event = new CustomEvent(eventName, { detail: data, bubbles: bubbles })
		el.dispatchEvent(event);
	} else {
		if (el.fire) el.fire(eventName);
		else if (el.trigger) el.trigger(eventName);
		else if (el.emit) el.emit(eventName);
	}
}

function createKeyEvt(name, code){
	var evt = document.createEvent("KeyboardEvent");
	try{
		Object.defineProperty(evt, 'keyCode', {
			get : function() {
				return this.keyCodeVal;
			}
		});
		Object.defineProperty(evt, 'which', {
			get : function() {
				return this.keyCodeVal;
			}
		});
	} catch (e) {
	}

	evt.keyCode = this.keyCodeVal;
	evt.which = this.keyCodeVal;

	if (evt.initKeyboardEvent) {
		evt.initKeyboardEvent("keydown", true, true, document.defaultView, false, false, false, false, code, code);
	} else {
		evt.initKeyEvent("keydown", true, true, document.defaultView, false, false, false, false, code, code);
	}

	evt.keyCodeVal = code;

	return evt;
}

function createMouseEvt(name, btn){
	var evt = document.createEvent("MouseEvent")
	evt.initMouseEvent(
		name, true,true,window,
		1, 0,0,0,0,
		false,false,false,false,
		btn, null
	)
	evt.which = btn;
	return evt
}
