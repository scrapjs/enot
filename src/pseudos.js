/**
 * Dics of pseudos.
 * Includes all xtags ones: delegate, pass.
 *
 * @module  enot/pseudos
 */

var pseudos = {};

pseudos.on =
pseudos.delegate =
require('emmy/delegate');

pseudos.pass =
pseudos.keypass =
require('emmy/keypass');

pseudos.one =
pseudos.once =
require('emmy/once');

pseudos.throttle =
require('emmy/throttle');

pseudos.later =
require('emmy/later');


pseudos.order = [

	'one', 'once'
];


module.exports = pseudos;