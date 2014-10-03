// var Enot = require('../index');
// var assert = require('chai').assert;

describe("Enot", function(){
	it.skip("parse", function(){
		var i = 0;
		var x = {};
		var fn = function(){i++;};
		var obj = enot.parse(x, 'document click:one', fn);

		assert.equal(obj.evt, 'click');
		assert.notEqual(obj.handler, fn);
		assert.equal(obj.el, document);
	});


	it("able to fire events", function(){
		var i = 0;
		var cb = function(e){
			assert.equal(e.detail, 123);
			Enot.off(document, "hello", cb);
			i++;
		};
		Enot.on(document, "hello", cb);
		Enot.emit(document, "hello", 123);
		Enot.emit(document, "hello", 123);

		assert.equal(i,1);
	});

	it("turn off callbacks", function(){
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

	it("fire `one` callback once", function(){
		var i = 0, j = 0;
		Enot.on(document, "hello:one", function(e){
			e.detail === 123 && i++
		})
		Enot.on(document, "hello:one", function(e){
			e.detail === 123 && i++
		})
		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		//TODO: add multiple once events assertion (to test proper target fns bound in evtModifiers (there’re no closures))
	});


	it("unbind :one callbacks", function(){
		var a = document.createElement('div');
		var log = []
		var fn = function(){log.push(1)}

		Enot.on(a, 'a:one', fn)
		Enot.on(a, 'a:one', fn)
		Enot.emit(a, 'a');
		Enot.emit(a, 'a');

		assert.deepEqual(log, [1])

		log = [];
		Enot.on(a, 'b:one', fn);
		Enot.off(a, 'b:one', fn);
		Enot.on(a, 'b:one', fn);
		Enot.emit(a, 'b');
		Enot.emit(a, 'b');

		assert.deepEqual(log, [1]);
	});

	it("handle :delegate modifier", function(){
		if (window.mochaPhantomJS) return;

		var i = 0, j = 0;
		var el = document.createElement("div");
		document.body.appendChild(el);

		var inc = function(){
			i++;
		};
		Enot.on(document.body, "document hello:delegate(p, div, .some)", inc);

		var sideLink = document.createElement("span");
		document.body.appendChild(sideLink);
		Enot.on(sideLink, "hello", function(){
			j++;
		});

		Enot.emit(document.body, "hello");
		assert.equal(i, 0);
		console.log('---')
		Enot.emit(el, "hello", null, true);
		assert.equal(i, 1);

		Enot.emit(sideLink, "hello", null, true);
		assert.equal(i, 1);
		assert.equal(j, 1);

		Enot.off(document.body, "document hello:delegate(div)", inc);
	});

	it("filter click:pass modifier", function(){
		var i = 0;
		var el = document.createElement("div");
		document.body.appendChild(el);

		Enot.on(el, "click:pass(right_mouse, left_mouse)", function(e){
			// console.log("filtered click")
			i++
		})
		Enot.on(el, "click", function(){
			// console.log("simple click")
		})

		var evt = createMouseEvt("click", 1)
		Enot.emit(el, evt);

		assert.equal(i, 0)

		// console.log("----fire 2")
		var evt = createMouseEvt("click", 2)
		Enot.emit(el, evt);

		assert.equal(i, 1);
	});

	it("filter keypress:pass modifier", function(){
		if (window.mochaPhantomJS) return;

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
		var evt = createKeyEvt("keydown", 83)
		Enot.emit(el, evt);
		assert.equal(a, 3)
		assert.equal(k, 2)
		assert.equal(ka, 1)

		//enter
		var evt = createKeyEvt("keydown", 13)
		Enot.emit(el, evt);
		assert.equal(a, 4)
		assert.equal(k, 3)
		assert.equal(ka, 2)
	});


	it("able to combine modifiers", function(){
		if (window.mochaPhantomJS) return;

		var i = 0;

		var el = document.createElement("div");
		el.className = "item";

		var el2 = document.createElement("div");

		document.body.appendChild(el)
		document.body.appendChild(el2)

		Enot.on(document.body, "hello:one:delegate(.item)", function(e){
			e.detail === 123 && i++
		})
		Enot.emit(document.body, "hello", 123, true)
		assert.equal(i, 0)
		Enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)
		Enot.emit(el2, "hello", 123, true)
		assert.equal(i, 1)
		Enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)
		Enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)

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
	})

	it("treat unknown modifiers as a part of event", function(){
		var i = 0;
		Enot.on(document,"hello:world", function(){
			i++
		})
		Enot.emit(document, "hello:world")
		assert.equal(i, 1);
	})

	it("not shit the bed with window binding", function(){
		Enot.on(document.body, 'window resize', function(){})
	})

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
	})


	it("should fire events on different targets", function(){
		var i = 0;
		var a = document.createElement('div');
		var b = document.createElement('div');
		var fn = function(){i++}
		Enot.on(a, 'a', fn);
		Enot.on(b, 'a', fn);
		Enot.emit(a, 'a')
		Enot.emit(b, 'a')

		assert.equal(i,2)
	})

	it("empty target", function(){
		Enot.on({}, '.xy a', function(){})
		Enot.off({}, '.xy a', function(){})
	})

	it("fire recognizes evtRef events", function(){
		var i = 0;
		Enot.on(document, 'x', function(){i++});
		Enot.emit({}, 'document x');

		assert.equal(i, 1);
	})

	it("recognize & fire listed declarations", function(){
		var i = 0,
			target = {
			a: {},
			b: document.body
		}

		Enot.on(target, '@a x, this.a y, @b z', function(){
			i++;
		});
		Enot.on(document, 'f', function(){
			i++
		})

		Enot.emit(target.a, 'x,y');
		assert.equal(i, 2);

		Enot.emit(document.body, 'z,document f');
		assert.equal(i,4);
	})

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
	})

	it(':throttle mod case', function(done){
		var i = 0;
		var a = document.createElement('div');
		Enot.on(a, "click:throttle(20)", function(){
			i++
			assert.equal(this, a);
		})

		document.body.appendChild(a);

		var interval = setInterval(function(){
			dispatchEvt(a, "click")
		},10)

		setTimeout(function(){
			//should be instantly called
			assert.equal(i, 1);
		}, 11);

		setTimeout(function(){
			clearInterval(interval);
			//should be called twice less often than dispatched event
			assert.closeTo(i, 8, 3);
			done();
		}, 200)
	});

	it("deep properties access", function(){
		var i = 0;
		var a = {
			b:{
				c: {

				}
			}
		}
		Enot.on(a, 'this.b.c c', function(){
			i++
		})
		Enot.emit(a.b.c, 'c');

		assert.equal(i, 1);
	})

	// <!-- `this.childNodes click` - catch click on every children -->
	it("handling list of targets", function(){
		var i = 0;

		var a = {
			children: [{}, {}, {}]
		};

		Enot.on(a, 'this.children x', function(){
			i++
		});

		Enot.emit(a, 'this.children x');

		assert.equal(i, 3);

	})

	// <!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->
	it("key modifiers")

	// <!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->
	it("sequence of keypresses")

	// <!-- `touch` - normalized crossbrowser gesture -->
	it("normalized touch")

	// <!-- `all` - call on any event -->
	it("all events")

	it("absent target", function(){
		var i = 0;
		// console.log('---on doc')
		var inc = function(){
			i++
		};
		Enot.on("document click", inc);
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

	})

	it(":not(selector) modifier", function(){
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

		Enot.on('document click:not(.a)', function(){
			i++
		});
		Enot.on('.b click:not(.c)', function(){
			j++
		})
		// console.log('--------emit body click');
		Enot.emit('body click', null, true);
		assert.equal(i, 1);

		// console.log('--------emit a click');
		Enot.emit(a, 'click', null, true);
		Enot.emit(b, 'click', null, true);
		Enot.emit(c, 'click', null, true);
		Enot.emit(d, 'click', null, true);
		assert.equal(i, 1);
		assert.equal(j, 1);
	})

	it.skip(":not(this.prop) modifier", function(){
		var i = 0, j = 0;

		var a = document.createElement('div');
		document.body.appendChild(a);

		Enot.on(a, 'click:not(this)', function(){
			i++
		});

		Enot.emit('body click');
		assert.equal(i, 1);

		Enot.emit(a, 'click');
		assert.equal(i, 1);
	})

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
	})

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

		Enot.off('.aer click', inc);
		Enot.emit('.aer click');
		assert.equal(i, 4);

		//NodeList tests
		// var nativeNodeList = NodeList;
		// window.NodeList = null;
		// Enot.emit(document.querySelectorAll('.aer'), 'click');
		// assert.equal(i, 4);
		// window.NodeList = nativeNodeList;
	})

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
	})

	it("handle redirect events", function(){
		var log = [];

		var target = {
			a: function(e){
				log.push('a')
			},
			b: function(e){
				log.push('b')
			}
		}
		Enot.on(target, 'a', target.a);
		Enot.on(target,'z', 'a, b');
		Enot.emit(target, 'z');
		assert.deepEqual(log, ['a']);

		Enot.off(target, 'a', target.a);
		Enot.on(target, 'b', target.b);
		Enot.emit(target, 'z');
		assert.deepEqual(log, ['a', 'b']);

		Enot.off(target,'z', 'a, b');
		Enot.emit(target, 'z');
		assert.deepEqual(log, ['a', 'b']);
	});

	it('bind numeric values', function(){
		Enot.on({1: function(){}}, 1, 1);
		Enot.off({1: function(){}}, 1, 1);
		Enot.emit({1: function(){}}, 1);
	})

	it('keep context', function(){
		var i = 0;
		var target = {z:{}, inc: function(){i++}};

		Enot.on(target, 'inc', target.inc);
		Enot.on(target, 'this.z click', 'inc');

		Enot.emit(target.z, 'click');
		assert.equal(i,1);

		Enot.off(target, 'this.z click', 'inc')

		Enot.emit(target.z, 'click');
		assert.equal(i,1);
	})

	it("target order in notation agnostic");

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
	})

	it("access undefined properties", function(){
		Enot.on({}, 'this.x.y', function(){})
	})

	it("indirect redirect", function(){
		var i = 0;

		var a = {inc: function(){i++}, click: undefined}

		//set fake inc
		Enot.on({}, 'click', 'inc')

		Enot.on(a, 'inc', a.inc);
		Enot.on(a, 'click', 'inc');

		Enot.emit(a, 'click');

		assert.equal(i, 1);
	})

	it("multiple off", function(){
		var i = 0;
		var a = {
			x: function(){i++}
		}

		Enot.on(a, 'x', a.x);
		Enot.on(a, 'y', 'x');
		Enot.emit(a, 'x');
		Enot.emit(a, 'y');

		assert.equal(i, 2);

		Enot.off(a, 'x');
		Enot.off(a, 'y');
		Enot.emit(a, 'x');
		Enot.emit(a, 'y');
		assert.equal(i, 2);
	});

	it.skip("redirect to complex notations", function(){

	});

	it(":defer(@delay)")

	it(":defer, :defer(), :defer(N)", function(done){
		var a = document.createElement('div');
		var i = 0;

		Enot.on(a, 'dsd:defer(100)', function(){
			i++;
		});
		Enot.emit(a, 'dsd');
		assert.equal(i, 0);

		setTimeout(function(){
			assert.equal(i, 1);
			done();
		}, 110);
	});

	it('redirect :othermodifier', function(done){
		var i = 0;
		var a = {x:function(){
			i++
		}};

		Enot.on(a, 'x', a.x);
		Enot.on(a, 'click:defer(100)', 'x');

		Enot.emit(a, 'click');

		setTimeout(function(){
			assert.equal(i, 1);
			done();
		}, 110)
	})

	it('keep target objects untouched (jQuery intrusion)', function(){
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

		Enot.on(a, 'click:on(.xxx)', function(){
			log.push(1)
		});
		Enot.on('click:on(.xxx)', function(){
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


	it("multiple :one callbacks", function(){
		var a = {}, log = [];

		Enot.on(a, 'init:one', function(){
			log.push(1)
		})
		Enot.on(a, 'init:one', function(){
			log.push(2)
		})
		Enot.on(a, 'init:one', function(){
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

		Enot.on(a, 'body .item click', function(){
			log.push(1)
		})
		Enot.on(a, '.item click', function(){
			log.push(2);
		})


		Enot.emit(b, 'click');
		Enot.emit(a, 'click');

		assert.deepEqual(log, [1]);
	})

	it("yas case: @a evt, body evt, evt", function(){
		var i = 0;

		var a = document.createElement('div');
		a.className = 'a'
		a.a = document.createElement('div');
		a.a.className = 'inner-a'
		a.inc = function(){i++};
		document.body.appendChild(a);


		Enot.on(a, 'inc', a.inc);
		// console.log('----bind three')
		Enot.on(a, '@a evt, body evt, evt', 'inc');

		// console.log('---emit inner evt')
		Enot.emit(a.a, 'evt');
		assert.equal(i, 1);
		// console.log('---emit body evt')
		Enot.emit(document.body, 'evt');
		assert.equal(i, 2);

		Enot.emit(a, 'evt');

		assert.equal(i, 3);
	})

	it("keep context on external redirected events", function(){
		var i = 0;
		var a = {
			y:function(){
				i++
			}
		};
		var b = {
			y:function(){
				i++
			}
		};

		Enot.on(a, 'y', a.y);
		Enot.on(b, 'y', b.y);
		Enot.on(a, 'window x', 'y');
		Enot.on(b, 'window x', 'y');

		Enot.emit('window x');
		assert.equal(i, 2);

		Enot.emit(window, 'x');
		assert.equal(i, 4);
	})

	it("prevent planned :async call via off", function(done){
		var i = 0, a = {};

		var inc = function(){
			i++
		}
		Enot.on(a, 'x', inc);

		Enot.emit(a, 'x:defer(50)');
		Enot.emit(a, 'x:defer(100)');

		setTimeout(function(){
			assert.equal(i, 1);

			Enot.off(a, 'x', inc);
		}, 55)

		setTimeout(function(){
			assert.equal(i, 1);
			done();
		}, 110);
	});

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

		Enot.off(a, "a.b");
		Enot.emit(a, "a.b");
		assert.equal(i, 1);
	});

	it("list only queryResults, not the any object with length", function(){
		var i = 0;

		var a = document.createElement('iframe');
		a.src = 'http://kudago.com';
		a.style.display = 'none';
		document.body.appendChild(a);

		Enot.on({}, 'window x', function(){
			i++
		})

		Enot.emit('window x');
		Enot.emit('window x');

		assert.equal(i, 2);
	});

	it(":not on elements which are no more in the DOM", function(){
		var a = document.createElement('div');
		a.className = 'a';
		a.innerHTML = '<span></span>'
		document.body.appendChild(a);

		var i = 0;


		Enot.on(a, 'click', function(){
			this.innerHTML = '<span></span>'
		})
		Enot.on('document click:not(.a)', function(e){
			i++
		});
		// console.log('----emit click', a.firstChild)
		Enot.emit(a.firstChild, 'click', true, true);

		assert.equal(i, 0);
	})

	it("stopPropagation shortcut", function(){
		var i = 0;
		var a = document.createElement('div');
		document.body.appendChild(a);

		Enot.on(document.body, 'click', function(){
			i++;
		})
		Enot.emit(a, 'click', true, true);
		assert.equal(i, 1);

		Enot.on(a, 'click', 'stopPropagation');
		Enot.emit(a, 'click', true, true);
		assert.equal(i, 1);
	})

	it("preventDefault shortcut", function(){
		var i = 0;
		var a = document.createElement('a');
		document.body.appendChild(a);
		a.href="#xxx";
		Enot.on(a, 'click', 'preventDefault');
		document.location.hash = '';
		Enot.emit(a, 'click', true, true);
		assert.notEqual(document.location.hash, '#xxx')
	})

	it.skip("TODO: emit event instances passed", function(){
		var e = new CustomEvent();
		Enot.emit({}, e);

		//TODO: faced this case in MOD with Enot.emit(a,b, event) in redirector
	})

	it('TODO: jQuery event separator (.)')

	it('Catch :defer redirector (draggy case - it shouldn’t work)', function(done){
		var a = {
			track: function(){}
		};
		var i = 0;
		Enot.on(a,'track', a.track);
		Enot.emit(a, 'track:defer');
		Enot.off(a,'track', a.track)
		//make track change after emit
		a.track = function(){
			i++
		}
		Enot.on(a,'track',a.track)
		setTimeout(function(){
			assert.equal(i, 1);
			done();
		})
	})

	it('stringy modifiers', function(){
		var a = document.createElement('div');
		var b = document.createElement('div');
		a.className = 'special';

		document.body.appendChild(a);
		document.body.appendChild(b);

		var i = 0;

		var x = {
			inc: function(){
				i++
			}
		}

		Enot.on(x, 'inc', x.inc)
		Enot.on(x, 'document x:not(.special)', 'inc');

		Enot.emit(b, 'x', true, true);
		assert.equal(i, 1);

		Enot.emit(a, 'x', true, true);
		assert.equal(i, 1);

	})

	it('one method', function(){
		var i = 0;
		Enot.one(document, "hello", function(e){
			e.detail === 123 && i++
		})
		Enot.one(document, "hello", function(e){
			e.detail === 123 && i++
		})
		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		Enot.emit(document, "hello", 123)
		assert.equal(i, 2)
	})


	it('objects inheriting Enot', function(){
		var A = function(){};
		A.prototype = Object.create(Enot.prototype);
		var a = new A;

		var i = 0;
		a.on('a:one', function(){i++});
		a.emit('a');
		a.emit('a');
		assert.equal(i, 1);
	});


	it.skip('Emitter compliance', function(){
		//TODO: test readme docs
	});

	it.skip('Chainable target & static methods', function(){

	});
});