"use strict";

var Class = require( '../utils/common/ClassV6' );
var OldStyleClass = require( '../utils/common/Class' );

var ServerThing = Class( module, class ServerThing {
    constructor() {
        console.log(
                ServerThing.name + '::constructor()\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.id );
    }
});

var Thing = exports.Thing = Class( module, class Thing extends ServerThing {} );

var ServerThing5 = OldStyleClass( module, 'class ServerThing5', {
    constructor: function constructor() {
        console.log(
                ServerThing5.name + '::constructor()\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.id );
    },
});

var Thing5 = exports.Thing5 = OldStyleClass( module, 'class Thing5 extends', ServerThing5, {} );
