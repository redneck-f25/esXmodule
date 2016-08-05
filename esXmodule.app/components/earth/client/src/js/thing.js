"use strict";

var Class = require( '../utils/common/ClassV6' );
var OldStyleClass = require( '../utils/common/Class' );

var allInstances = [];

var ClientThing = Class( module, class ClientThing {
    static __class_init( ClientThing ) {
        ClientThing.allInstances = allInstances;
    }
    constructor() {
        allInstances.push( this );
        console.log(
                ClientThing.name + '::constructor() on Client\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.name );
    }
});

var Thing = exports.Thing = Class( module, class Thing extends ClientThing {} );

var ClientThing5 = OldStyleClass( module, 'class ClientThing5', {
    __static_class_init: function __class_init( ClientThing5 ) {
        ClientThing5.allInstances = allInstances;
    },
    constructor: function constructor() {
        allInstances.push(this);
        console.log(
                ClientThing5.name + '::constructor() on Client\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.name );
    },
});

var Thing5 = exports.Thing5 = OldStyleClass( module, 'class Thing5 extends', ClientThing5, {} );
