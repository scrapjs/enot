describe("Enot", function(){
	// it("parse", function(){
	// 	var i = 0;
	// 	var x = {};
	// 	var fn = function(){i++}
	// 	var obj = enot.parse(x, 'document click:one', fn);

	// 	assert.equal(obj.evt, 'click')
	// 	assert.notEqual(obj.handler, fn)
	// 	assert.equal(obj.el, document)
	// });


	it("able to fire events", function(){
		var i = 0;
		var cb = function(e){
			assert.equal(e.detail, 123)
			enot.off(document, "hello", cb)
			i++;
		}
		enot.on(document, "hello", cb)
		enot.fire(document, "hello", 123)
		enot.fire(document, "hello", 123)

		assert.equal(i,1);
	});

	// it("proper isEventTarget test", function(){
	// 	assert.ok(enot.isEventTarget(document.body))
	// 	assert.ok(enot.isEventTarget(document.createElement("div")))
	// 	assert.notOk(enot.isEventTarget({}))
	// })

	it("turn off callbacks", function(){
		var i = 0;
		var fn = function(e){
			e.detail === 123 && i++
		}
		enot.on(document, "hello", fn)
		enot.fire(document, "hello", 123)
		assert.equal(i, 1)

		enot.off(document, "hello", fn)
		enot.fire(document, "hello", 123)
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
		enot.fire(document, "hello", 123)
		assert.equal(i, 2)

		enot.fire(document, "hello", 123)
		assert.equal(i, 2)

		enot.fire(document, "hello", 123)
		assert.equal(i, 2)

		//TODO: add multiple once events assertion (to test proper target fns bound in evtModifiers (there’re no closures))
	})


	it("unbind :one callbacks", function(){
		var a = document.createElement('div');
		var log = []
		var fn = function(){log.push(1)}

		enot.on(a, 'a:one', fn)
		enot.on(a, 'a:one', fn)
		enot.fire(a, 'a');
		enot.fire(a, 'a');

		assert.deepEqual(log, [1])

		log = [];
		enot.on(a, 'b:one', fn)
		enot.off(a, 'b:one', fn)
		enot.on(a, 'b:one', fn)
		enot.fire(a, 'b');
		enot.fire(a, 'b');

		assert.deepEqual(log, [1])

	})

	it("handle :delegate modifier", function(){
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

		enot.fire(document.body, "hello");
		assert.equal(i, 0);

		enot.fire(el, "hello", null, true);
		assert.equal(i, 1);

		enot.fire(sideLink, "hello", null, true);
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
			enot.fire(el, evt);

			assert.equal(i, 0)

			// console.log("----fire 2")
			var evt = createMouseEvt("click", 2)
			enot.fire(el, evt);

			assert.equal(i, 1)

		})

	it("filter keypress:pass modifier", function(){
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

		enot.fire(el, evt);
		assert.equal(a, 1)
		assert.equal(k, 0)
		assert.equal(ka, 1)

		// s
		var evt = createKeyEvt("keydown", 83)
		enot.fire(el, evt);
		assert.equal(a, 2)
		assert.equal(k, 1)
		assert.equal(ka, 1)

		// s2
		var evt = createKeyEvt("keydown", 83)
		enot.fire(el, evt);
		assert.equal(a, 3)
		assert.equal(k, 2)
		assert.equal(ka, 1)

		//enter
		var evt = createKeyEvt("keydown", 13)
		enot.fire(el, evt);
		assert.equal(a, 4)
		assert.equal(k, 3)
		assert.equal(ka, 2)
	});


	it("able to combine modifiers", function(){
		var i = 0;

		var el = document.createElement("div");
		el.className = "item";
		var el2 = document.createElement("div");

		document.body.appendChild(el)
		document.body.appendChild(el2)

		enot.on(document.body, "hello:one:delegate(.item)", function(e){
			// console.log("old on")
			e.detail === 123 && i++
		})
		enot.fire(document.body, "hello", 123, true)
		assert.equal(i, 0)
		enot.fire(el, "hello", 123, true)
		assert.equal(i, 1)
		enot.fire(el2, "hello", 123, true)
		assert.equal(i, 1)
		enot.fire(el, "hello", 123, true)
		assert.equal(i, 1)

		// once again
		var i = 0;
		enot.on(document.body, "keydown:delegate(.item, .post):pass(escape)", function(e){
			// console.log("keypress shit", e)
			i++
		})

		enot.fire(document.body, createKeyEvt("keypress", 27), 123, true)
		assert.equal(i, 0)
		enot.fire(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		enot.fire(el2, "hello", createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 1)
		enot.fire(el, "hello", createKeyEvt("keydown", 29), 123, true)
		assert.equal(i, 1)
		enot.fire(el, createKeyEvt("keydown", 27), 123, true)
		assert.equal(i, 2)
	})

	it("treat unknown modifiers as a part of event", function(){
		var i = 0;
		enot.on(document,"hello:world", function(){
			i++
		})
		enot.fire(document, "hello:world")
		assert.equal(i, 1);
	})

	it("not shit the bed with window binding", function(){
		enot.on(document.body, 'window resize', function(){})
	})

	it("fire on discrete delegate target", function(){
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
		enot.fire(a, 'a')
		enot.fire(b, 'a')

		assert.equal(i,2)
	})

	it("empty target", function(){
		enot.on({}, '.xy a', function(){})
		enot.off({}, '.xy a', function(){})
	})

	it("fire recognizes evtRef events", function(){
		var i = 0;
		enot.on(document, 'x', function(){i++});
		enot.fire({}, 'document x');

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

		enot.fire(target.a, 'x,y');
		assert.equal(i, 2);

		enot.fire(document.body, 'z,document f');
		assert.equal(i,4);
	})

	it('mod delegate case', function(){
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
		enot.fire(a.b.c, 'c');

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

		enot.fire(a, 'this.children x');

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
		enot.fire("document click");
		enot.fire(document, "click");

		assert.equal(i, 2);

		enot.fire("document click");
		assert.equal(i, 3);

		// console.log('---off doc')
		enot.off(document, "click", inc);
		enot.fire("document click");
		enot.fire(document, "click");
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

		enot.fire('body click', null, true);
		assert.equal(i, 1);

		enot.fire(a, 'click', null, true);
		assert.equal(i, 1);
	})

	it.skip(":not(this.prop) modifier", function(){
		var i = 0, j = 0;

		var a = document.createElement('div');
		document.body.appendChild(a);

		enot.on(a, 'click:not(this)', function(){
			i++
		});

		enot.fire('body click');
		assert.equal(i, 1);

		enot.fire(a, 'click');
		assert.equal(i, 1);
	})

	it(":delegate() currentTarget & target", function(){
		var a = document.createElement('div');
		a.className = 'd';
		var b = document.createElement('div');
		a.appendChild(b);
		document.body.appendChild(a);

		var cTarget;
		enot.on('document click:delegate(.d)', function(e){
			cTarget = e.currentTarget;
		});
		enot.fire(b, 'click', null, true);
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
		enot.fire(document.querySelectorAll('.aer'), 'click');
		assert.equal(i, 2);

		enot.fire('.aer click');
		assert.equal(i, 4);

		enot.off('.aer click', inc);
		enot.fire('.aer click');
		assert.equal(i, 4);
	})

	it.skip("fire defined on object properties", function(){
		var a = {}

	})

	it("handle empty callback", function(){
		var i = 0;
		var target = {
			a: function(){
				i++
			}
		}

		enot.on(target, 'a');
		enot.fire(target, 'a');
		assert.equal(i, 1);

		enot.off(target, 'a');
		enot.fire(target, 'a');

		assert.equal(i, 1);
	})

	it("handle redirect events", function(){
		var log = [];

		var target = {
			a: function(){
				log.push('a')
			},
			b: function(){
				log.push('b')
			}
		}

		enot.on(target, 'a');
		enot.on(target,'z', 'a, b');
		enot.fire(target, 'z');
		assert.deepEqual(log, ['a']);

		enot.off(target, 'a');
		enot.on(target, 'b');
		enot.fire(target, 'z');
		assert.deepEqual(log, ['a', 'b']);

	});

	it("target order agnostic");

	it("no target means viewport === any event of this type")
});