/**
 * @module  enot
 */

var Enot = require('./Emitter');

var	on = require('./on'),
	off = require('./off'),
	emit = require('./emit');

//add static wrapper API
Enot['on'] = function(a,b,c){
	on(a,b,c);
	return Enot;
};
Enot['off'] = function(a,b,c){
	off(a,b,c);
	return Enot;
};
Enot['emit'] = function(a,b,c,d){
	emit(a,b,c,d);
	return Enot;
};

module.exports = Enot;