"use strict";

var Class = require( '../utils/Class6' );
var Class5 = require( '../utils/Class5' );

var ServerThing = Class( module, class ServerThing {
    constructor() {
        console.log(
                ServerThing.name + '::constructor()\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.id );
    }
});

var Thing = exports.Thing = Class( module, class Thing extends ServerThing {} );

var ServerThing5 = Class5( module, 'class ServerThing5', {
    constructor: function ServerThing5() {
        console.log(
                ServerThing5.name + '::constructor()\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.id );
    },
});

var Thing5 = exports.Thing5 = Class5( module, 'class Thing5 extends', ServerThing5, {} );
