describe("Enot", function(){
	it.skip("parse", function(){
		var i = 0;
		var x = {};
		var fn = function(){i++}
		var obj = enot.parse(x, 'document click:one', fn);

		assert.equal(obj.evt, 'click')
		assert.notEqual(obj.handler, fn)
		assert.equal(obj.el, document)
	});


	it("able to fire events", function(){
		var i = 0;
		var cb = function(e){
			assert.equal(e.detail, 123)
			enot.off(document, "hello", cb)
			i++;
		}
		enot.on(document, "hello", cb)
		enot.emit(document, "hello", 123)
		enot.emit(document, "hello", 123)

		assert.equal(i,1);
	});

	it.skip("proper isEventTarget test", function(){
		assert.ok(enot.isEventTarget(document.body))
		assert.ok(enot.isEventTarget(document.createElement("div")))
		assert.notOk(enot.isEventTarget({}))
	})

	it("turn off callbacks", function(){
		var i = 0;
		var fn = function(e){
			e.detail === 123 && i++
		}
		enot.on(document, "hello", fn)
		enot.emit(document, "hello", 123)
		assert.equal(i, 1)

		enot.off(document, "hello", fn)
		enot.emit(document, "hello", 123)
		assert.equal(i, 1)
	})

	it("fire `one` callback once", function(){
		var i = 0, j = 0;
		enot.on(document, "hello:one", function(e){
			e.detail === 123 && i++
		})
		enot.on(document, "hello:one", function(e){
			e.detail === 123 && i++
		})
		enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		enot.emit(document, "hello", 123)
		assert.equal(i, 2)

		//TODO: add multiple once events assertion (to test proper target fns bound in evtModifiers (there’re no closures))
	})


	it("unbind :one callbacks", function(){
		var a = document.createElement('div');
		var log = []
		var fn = function(){log.push(1)}

		enot.on(a, 'a:one', fn)
		enot.on(a, 'a:one', fn)
		enot.emit(a, 'a');
		enot.emit(a, 'a');

		assert.deepEqual(log, [1])

		log = [];
		enot.on(a, 'b:one', fn)
		enot.off(a, 'b:one', fn)
		enot.on(a, 'b:one', fn)
		enot.emit(a, 'b');
		enot.emit(a, 'b');

		assert.deepEqual(log, [1])

	})

	it("handle :delegate modifier", function(){
		if (window.mochaPhantomJS) return;

		var i = 0, j = 0;
		var el = document.createElement("div");
		document.body.appendChild(el);

		var inc = function(){
			i++
		}
		enot.on(document.body, "document hello:delegate(p, div, .some)", inc)

		var sideLink = document.createElement("span");
		document.body.appendChild(sideLink);
		enot.on(sideLink, "hello", function(){
			j++
		})

		enot.emit(document.body, "hello");
		assert.equal(i, 0);

		enot.emit(el, "hello", null, true);
		assert.equal(i, 1);

		enot.emit(sideLink, "hello", null, true);
		assert.equal(i, 1);
		assert.equal(j, 1);

		enot.off(document.body, "document hello:delegate(div)", inc)
	})

	it("filter click:pass modifier", function(){
			var i = 0;
			var el = document.createElement("div");
			document.body.appendChild(el);

			enot.on(el, "click:pass(right_mouse, left_mouse)", function(e){
				// console.log("filtered click")
				i++
			})
			enot.on(el, "click", function(){
				// console.log("simple click")
			})

			var evt = createMouseEvt("click", 1)
			enot.emit(el, evt);

			assert.equal(i, 0)

			// console.log("----fire 2")
			var evt = createMouseEvt("click", 2)
			enot.emit(el, evt);

			assert.equal(i, 1)

		})

	it("filter keypress:pass modifier", function(){
		if (window.mochaPhantomJS) return;

		var k = 0, a = 0, ka=0;
		var el = document.createElement("div");

		enot.on(el, "keydown", function(e){
			// console.log("all", e)
			a++
		})
		enot.on(el, "keydown:pass(83, Enter)", function(e){
			// console.log("→ filtered 1")
			k++
		})
		enot.on(el, "keydown:pass(65, enter, 68)", function(e){
			// console.log("→ filtered 2")
			ka++
		})

		var evt = createKeyEvt("keydown", 65)

		enot.emit(el, evt);
		assert.equal(a, 1)
		assert.equal(k, 0)
		assert.equal(ka, 1)

		// s
		var evt = createKeyEvt("keydown", 83)
		enot.emit(el, evt);
		assert.equal(a, 2)
		assert.equal(k, 1)
		assert.equal(ka, 1)

		// s2
		var evt = createKeyEvt("keydown", 83)
		enot.emit(el, evt);
		assert.equal(a, 3)
		assert.equal(k, 2)
		assert.equal(ka, 1)

		//enter
		var evt = createKeyEvt("keydown", 13)
		enot.emit(el, evt);
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

		enot.on(document.body, "hello:one:delegate(.item)", function(e){
			e.detail === 123 && i++
		})
		enot.emit(document.body, "hello", 123, true)
		assert.equal(i, 0)
		enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)
		enot.emit(el2, "hello", 123, true)
		assert.equal(i, 1)
		enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)
		enot.emit(el, "hello", 123, true)
		assert.equal(i, 1)

		// once again
		var i = 0;
		enot.on(document.body, "keydown:delegate(.item, .post):pass(escape)", function(e){
			// console.log("keypress shit", e)
			i++
		})

		enot.emit(document.body, createKeyEvt("keypress", 27), 123, true)
		assert.equal(i, 0)
		enot.emit(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		enot.emit(el2, "hello", createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		enot.emit(el, "hello", createKeyEvt("keydown", 29), 123, true)
		assert.equal(i, 1)
		enot.emit(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 2)
	})

	it("treat unknown modifiers as a part of event", function(){
		var i = 0;
		enot.on(document,"hello:world", function(){
			i++
		})
		enot.emit(document, "hello:world")
		assert.equal(i, 1);
	})

	it("not shit the bed with window binding", function(){
		enot.on(document.body, 'window resize', function(){})
	})

	it("fire on discrete delegate target", function(){
		if (window.mochaPhantomJS) return;

		var log = [];

		enot.on(document, "document hello:delegate(.target)", function(){
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
		enot.on(a, 'a', fn);
		enot.on(b, 'a', fn);
		enot.emit(a, 'a')
		enot.emit(b, 'a')

		assert.equal(i,2)
	})

	it("empty target", function(){
		enot.on({}, '.xy a', function(){})
		enot.off({}, '.xy a', function(){})
	})

	it("fire recognizes evtRef events", function(){
		var i = 0;
		enot.on(document, 'x', function(){i++});
		enot.emit({}, 'document x');

		assert.equal(i, 1);
	})

	it("recognize & fire listed declarations", function(){
		var i = 0,
			target = {
			a: {},
			b: document.body
		}

		enot.on(target, '@a x, this.a y, @b z', function(){
			i++;
		});
		enot.on(document, 'f', function(){
			i++
		})

		enot.emit(target.a, 'x,y');
		assert.equal(i, 2);

		enot.emit(document.body, 'z,document f');
		assert.equal(i,4);
	})

	it('mod delegate case', function(){
		if (window.mochaPhantomJS) return;

		var i = 0;
		enot.on(null, 'body evt:delegate(.a)', function(){
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
		enot.on(a, "click:throttle(20)", function(){
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
		enot.on(a, 'this.b.c c', function(){
			i++
		})
		enot.emit(a.b.c, 'c');

		assert.equal(i, 1);
	})

	// <!-- `this.childNodes click` - catch click on every children -->
	it("handling list of targets", function(){
		var i = 0;

		var a = {
			children: [{}, {}, {}]
		};

		enot.on(a, 'this.children x', function(){
			i++
		});

		enot.emit(a, 'this.children x');

		assert.equal(i, 3);

	})

	// <!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->
	it("key modifiers")

	// <!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->
	it("sequence of events")

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
		enot.on("document click", inc);
		enot.emit("document click");
		enot.emit(document, "click");

		assert.equal(i, 2);

		enot.emit("document click");
		assert.equal(i, 3);

		// console.log('---off doc')
		enot.off(document, "click", inc);
		enot.emit("document click");
		enot.emit(document, "click");
		assert.equal(i, 3);

	})

	it(":not(selector) modifier", function(){
		var i = 0;

		var a = document.createElement('div');
		a.className = 'abc';

		document.body.appendChild(a);

		enot.on('document click:not(.abc)', function(){
			i++
		});

		enot.emit('body click', null, true);
		assert.equal(i, 1);

		enot.emit(a, 'click', null, true);
		assert.equal(i, 1);
	})

	it.skip(":not(this.prop) modifier", function(){
		var i = 0, j = 0;

		var a = document.createElement('div');
		document.body.appendChild(a);

		enot.on(a, 'click:not(this)', function(){
			i++
		});

		enot.emit('body click');
		assert.equal(i, 1);

		enot.emit(a, 'click');
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
		enot.on('document click:delegate(.d)', function(e){
			cTarget = e.delegateTarget;
		});
		enot.emit(b, 'click', null, true);
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
		enot.on('.aer click', inc)
		enot.emit(document.querySelectorAll('.aer'), 'click');
		assert.equal(i, 2);

		enot.emit('.aer click');
		assert.equal(i, 4);

		enot.off('.aer click', inc);
		enot.emit('.aer click');
		assert.equal(i, 4);
	})

	it.skip("fire defined on object properties", function(){
		var a = {}

	})

	it("ignore empty callback", function(){
		var i = 0;
		var target = {
			a: function(){
				i++
			}
		}

		enot.on(target, 'a');
		enot.emit(target, 'a');
		assert.equal(i, 0);

		enot.off(target, 'a');
		enot.emit(target, 'a');


		enot.emit({}, 'b');

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
		enot.on(target, 'a', target.a);
		enot.on(target,'z', 'a, b');
		enot.emit(target, 'z');
		assert.deepEqual(log, ['a']);

		enot.off(target, 'a', target.a);
		enot.on(target, 'b', target.b);
		enot.emit(target, 'z');
		assert.deepEqual(log, ['a', 'b']);

		enot.off(target,'z', 'a, b');
		enot.emit(target, 'z');
		assert.deepEqual(log, ['a', 'b']);
	});

	it('bind numeric values', function(){
		enot.on({1: function(){}}, 1, 1);
		enot.off({1: function(){}}, 1, 1);
		enot.emit({1: function(){}}, 1);
	})

	it('keep context', function(){
		var i = 0;
		var target = {z:{}, inc: function(){i++}};

		enot.on(target, 'inc', target.inc);
		enot.on(target, 'this.z click', 'inc');

		enot.emit(target.z, 'click');
		assert.equal(i,1);

		enot.off(target, 'this.z click', 'inc')

		enot.emit(target.z, 'click');
		assert.equal(i,1);
	})

	it("target order agnostic");

	it("no target means viewport === any event of this type", function(){
		var i = 0;
		enot.on('a', function(){
			i++
		});

		enot.emit('a');
		assert.equal(i, 1);

		enot.off('a');
		enot.emit('a');
		assert.equal(i, 1);
	})

	it("access undefined properties", function(){
		enot.on({}, 'this.x.y', function(){})
	})

	it("indirect redirect", function(){
		var i = 0;

		var a = {inc: function(){i++}, click: undefined}

		//set fake inc
		enot.on({}, 'click', 'inc')

		enot.on(a, 'inc', a.inc);
		enot.on(a, 'click', 'inc');

		enot.emit(a, 'click');

		assert.equal(i, 1);
	})

	it("multiple off", function(){
		var i = 0;
		var a = {
			x: function(){i++}
		}

		enot.on(a, 'x', a.x);
		enot.on(a, 'y', 'x');
		enot.emit(a, 'x');
		enot.emit(a, 'y');

		assert.equal(i, 2);

		enot.off(a, 'x');
		enot.off(a, 'y');
		enot.emit(a, 'x');
		enot.emit(a, 'y');
		assert.equal(i, 2);
	});

	it.skip("redirect to complex notations", function(){

	});

	it(":defer(@delay)")

	it(":defer, :defer(), :defer(N)", function(done){
		var a = document.createElement('div');
		var i = 0;

		enot.on(a, 'dsd:defer(100)', function(){
			i++;
		});
		enot.emit(a, 'dsd');
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

		enot.on(a, 'x', a.x);
		enot.on(a, 'click:defer(100)', 'x');

		enot.emit(a, 'click');

		setTimeout(function(){
			assert.equal(i, 1);
			done();
		}, 110)
	})

	it('keep target objects untouched (jQuery intrusion)', function(){
		var a = {};
		enot.on(a, 'x', function(){});

		assert.deepEqual(a, {})
	});

	it('delegate within target', function(){
		var log = [];

		var a = document.createElement('div');
		a.innerHTML  = '<div class="xxx"></div>';
		document.body.appendChild(a);
		var b = a.firstChild.cloneNode();
		document.body.appendChild(b);

		enot.on(a, 'click:on(.xxx)', function(){
			log.push(1)
		});
		enot.on('click:on(.xxx)', function(){
			log.push(2)
		})
		enot.on(a, '.xxx click', function(){
			log.push(3)
		})

		enot.emit('.xxx click', true, true);
		assert.sameMembers(log, [1,2,3]);

		enot.off(a, 'click');
		enot.off(a, '.xxx click');
		enot.off('.xxx click');

		enot.emit('.xxx click', true, true);
		assert.sameMembers(log, [1,2,3]);
	})


	it("multiple :one callbacks", function(){
		var a = {}, log = [];

		enot.on(a, 'init:one', function(){
			log.push(1)
		})
		enot.on(a, 'init:one', function(){
			log.push(2)
		})
		enot.on(a, 'init:one', function(){
			log.push(3)
		})

		enot.emit(a, 'init');
		assert.deepEqual(log, [1,2,3])

		enot.emit(a, 'init');
		assert.deepEqual(log, [1,2,3])
	})

	it("query elements out of target", function(){
		var log = [];

		var a = document.createElement('div');

		var b = a.cloneNode();
		b.className = 'item';

		document.body.appendChild(a);
		document.body.appendChild(b);

		enot.on(a, 'body .item click', function(){
			log.push(1)
		})
		enot.on(a, '.item click', function(){
			log.push(2);
		})


		enot.emit(b, 'click');
		enot.emit(a, 'click');

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


		enot.on(a, 'inc', a.inc);
		enot.on(a, '@a evt, body evt, evt', 'inc');

		enot.emit(a.a, 'evt');
		assert.equal(i, 1);

		enot.emit(document.body, 'evt');
		assert.equal(i, 2);

		enot.emit(a, 'evt');
		assert.equal(i, 3);
	})
});