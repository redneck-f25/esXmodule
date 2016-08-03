/* earth/thing.js ************************************************************/
WebClient.define( "earth/thing", function $__module__earth_thing__( exports, require, module ) {
"use strict";

var Class = require( '../utils/Class6' );
var Class5 = require( '../utils/Class5' );

var ClientThing = Class( module, class ClientThing {
    constructor() {
        console.log(
                ClientThing.name + '::constructor() on Client\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.name );
    }
});

var Thing = exports.Thing = Class( module, class Thing extends ClientThing {} );

var ClientThing5 = Class5( module, 'class ClientThing5', {
    constructor: function ClientThing5() {
        console.log(
                ClientThing5.name + '::constructor() on Client\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.name );
    },
});

var Thing5 = exports.Thing5 = Class5( module, 'class Thing5 extends', ClientThing5, {} );

});
