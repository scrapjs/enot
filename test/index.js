var WeakMap = typeof WeakMap !== 'undefined' ? WeakMap : require('polymer-weakmap/weakmap');
var Enot = typeof Enot !== 'undefined' ? Enot : require('..');
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
	it("`Enot.on(target, event, cb)`", function(){
		var i = 0;
		var cb = function(e){
			assert.equal(e.detail, 123);
			Enot.off(document, "hello", cb);
			i++;
		};
		Enot.on(document, "hello:one", cb);

		// console.log('---emits')
		Enot.emit(document, "hello", 123)
		.emit(document, "hello", 123);

		assert.equal(i,1);
	});


	it('`Enot.on(targets, event, cb)`', function(){
		var targets = [f,s,l];
		var i = 0;

		function fn(){
			i++;
		}

		Enot.on(targets, 'x', fn);
		Enot.emit(targets, 'x');
		assert.equal(i, 3);

		Enot.off(targets, 'x', fn);
		Enot.emit(targets, 'x');
		assert.equal(i, 3);
	});


	it('`Enot.on(target, events)`', function(){
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


	it("`Enot.off(target, event, cb)`", function(){
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
		a.on('a:one', function(){i++});
		a.emit('a');
		a.emit('a');
		assert.equal(i, 1);
	});
});



//TODO: structurize these tests
//TODO: separate functionality tests and corner-cases
describe("Regression", function(){
	//TODO: get rid of redirect events, you can always do it manually.
	it.skip('Redirect source event properly in redirects (keep event info)', function(){
		var re;
		Enot.on(document, 'x', 'y');
		Enot.on(document, 'y', function(re){
			assert.equal(re, e)
		});

		Enot.emit(document, new Event('x'));
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
		var fn = function(){log.push(1)};

		Enot.on(a, 'a:one', fn);
		Enot.on(a, 'a:one', fn);
		Enot.emit(a, 'a');
		Enot.emit(a, 'a');

		assert.deepEqual(log, [1]);

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
			// console.log('inc');
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
	});

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

	it("recognize & fire listed declarations", function(){
		var i = 0,
			target = {
			a: {},
			b: document.body
		}

		Enot.on(target, '@a x, @a y, @b z', function(){
			i++;
		});
		Enot.on(document, 'f', function(){
			i++
		})

		Enot.emit(target.a, 'x,y');
		assert.equal(i, 2);

		Enot.emit(document.body, 'z,document f');
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

	it("deep properties access", function(){
		var i = 0;
		var a = {
			b:{
				c: {

				}
			}
		}
		Enot.on(a, '@b.c c', function(){
			i++
		})
		Enot.emit(a.b.c, 'c');

		assert.equal(i, 1);
	});

	// <!-- `@childNodes click` - catch click on every children -->
	it("handling list of targets", function(){
		var i = 0;

		var a = {
			children: [{}, {}, {}]
		};

		Enot.on(a, '@children x', function(){
			i++
		});

		Enot.emit(a, '@children x');

		assert.equal(i, 3);
	});

	// <!-- `keypress:pass(ctrl + alt + del)` - catch windows task manager call -->
	it("key modifiers");

	// <!-- `keypress:pass(/y/i) + keypress:pass(/e/i) + keypress:pass(/s/i)` - catch user’s consent. -->
	it("sequence of keypresses");

	// <!-- `touch` - normalized crossbrowser gesture -->
	it("normalized touch");

	// <!-- `all` - call on any event -->
	it("all events");

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
	});

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

		Enot.on(':root click:not(.a)', function(){
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
	});

	it.skip(":not(@prop) modifier", function(){
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

	//deprecated - you can always redirect yourself by an fn.
	it.skip("handle redirect events", function(){
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
		// console.log('---emit z')
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
	});

	//deprecated
	it.skip('keep context of redirects', function(){
		var i = 0;
		var target = {
			z:{},
			inc: function(){
				assert.equal(this, target);
				i++;
			}
		};

		Enot.on(target, 'inc', target.inc);
		// console.log('----on @z')
		Enot.on(target, '@z click', 'inc');

		// console.log('----emit click')
		Enot.emit(target.z, 'click');
		assert.equal(i,1);

		Enot.off(target, '@z click', 'inc')

		Enot.emit(target.z, 'click');
		assert.equal(i,1);
	});

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
	});

	it("access undefined properties", function(){
		Enot.on({}, '@x.y', function(){})
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

	it(":defer(@delay)");

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

	it("yas case: @a evt, :root evt, evt", function(){
		var i = 0;

		var a = document.createElement('div');
		a.className = 'a'
		a.a = document.createElement('div');
		a.a.className = 'inner-a'
		a.inc = function(){i++};
		document.body.appendChild(a);


		Enot.on(a, 'inc', a.inc);
		// console.log('----bind three')
		Enot.on(a, '@a evt, :root body evt, evt', 'inc');

		// console.log('---emit inner evt')
		Enot.emit(a.a, 'evt');
		assert.equal(i, 1);
		// console.log('---emit body evt')
		Enot.emit(document.body, 'evt');
		assert.equal(i, 2);

		Enot.emit(a, 'evt');

		assert.equal(i, 3);
	})

	it.skip("keep context on external redirected events", function(){
		var i = 0;
		var a = {
			y:function(){
				// console.log('ay')
				i++
			},
			x:1
		};
		var b = {
			y:function(){
				// console.log('by')
				i++
			},
			x:2
		};

		// console.log('---bind targets')
		Enot.on(a, 'y', a.y);
		Enot.on(b, 'y', b.y);
		// console.log('---bind window')
		Enot.on(a, 'window x', 'y');
		Enot.on(b, 'window x', 'y');

		// console.log('---emit window x')
		Enot.emit('window x');
		assert.equal(i, 2);

		Enot.emit(window, 'x');
		assert.equal(i, 4);
	})

	it("prevent planned :defer call via off", function(done){
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

	it(":not on elements which are no more in DOM", function(){
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


	it.skip('Emitter compliance', function(){
		//TODO: test readme docs
	});

	it.skip('Chainable target & static methods', function(){
	});

	it.skip('Bind to the specific context', function(){
		//DEPRECATED: bind methods manually, if you need to do so
		var a = {},
			b = {};

		Enot.on.call(a, b, {
			'x': function(){assert.equal(this, a)}
		});

		Enot.on(b, {
			'x': function(){assert.equal(this, b)}
		});

		Enot.emit(b, 'x');
	})

	it.skip('test lists in .one', function(){
		Enot.one('a, b', function(){

		})
	})

	it('keep context of inner references', function(){
		var i = 0;
		var target = {z: {f: 1}};
		var a = {
			'@z x': function() {
				assert.equal(this, target)
				i++
			}
		}

		Enot.on(target, a);
		Enot.emit(target.z, 'x');

		assert.equal(i, 1);
	})

	it.skip('forward redirected event params', function(){
		Enot.on(a, 'x', 'y');

		a.y = function(e){
			// assert.equal(e is an x event)
		}

		dispatchEvt(a, 'x');
	});

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
