var enot = require('enot');
var assert = require('chai').assert;

describe("Enot", function(){
	it("easy", function(){
		var x = {};
		var obj = enot(x, 'click', null);

		assert.deepEqual(obj, {
			event: 'click',
			target: x,
			handler: null
		});
	})

	it("medium", function(){
		var i = 0;
		var x = {};
		var fn = function(){i++}
		var obj = enot(x, 'document click:one', fn);

		assert.equal(obj.event, 'click')
		assert.notEqual(obj.handler, fn)
		assert.equal(obj.target, document)
	});

	it.skip("hard", function(){
		xxx
	})

	it.skip("advanced", function(){
		xxx
	})

	it.skip("expert", function(){
		xxx
	})

	it.skip("extreme", function(){
		xxx
	})

	it.skip("chuck norris", function(){
		xxx
	})

	it.skip("asian", function(){
		xxx
	})


});