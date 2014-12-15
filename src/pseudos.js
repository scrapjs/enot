/**
 * Dics of pseudos.
 * Includes all xtags ones: delegate, pass.
 *
 * @module  enot/pseudos
 */

var pseudos = {};

pseudos.on =
pseudos.delegate =
require('emmy/delegate').wrap;

pseudos.pass =
pseudos.keypass =
require('emmy/keypass').wrap;

pseudos.one =
pseudos.once =
require('emmy/once').wrap;

pseudos.throttle =
require('emmy/throttle').wrap;

pseudos.later =
require('emmy/later').wrap;


pseudos.order = [
	'one', 'once'
];


module.exports = pseudos;