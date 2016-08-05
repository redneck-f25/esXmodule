"use strict";

var Class = require( '../../utils/common/ClassV6' );
var OldStyleClass = require( '../../utils/common/Class' );

var LivingThing = require( './earth_' ).LivingThing;
var LivingThing5 = require( './earth_' ).LivingThing5;

var Animal = this.Animal = Class( module, class Animal extends LivingThing {
    static __class_init( Animal ) {
        Animal.instanceCounter = 0;
    }
    static getInstanceCount() {
        return Animal.instanceCounter;
    }
    constructor() {
        super();
        Animal.instanceCounter += 1;
    }
});

var Animal5 = this.Animal5 = OldStyleClass( module, 'class Animal5 extends', LivingThing5, {
    __static_class_init: function( Animal5 ) {
        Animal5.instanceCounter = 0;
    },
    __static_getInstanceCount: function getInstanceCount() {
        return Animal5.instanceCounter;
    },
    constructor: function constructor() {
        this._super();
        Animal5.instanceCounter += 1;
    },
});

var Mammal = this.Mammal = Class( module, class Mammal extends Animal {
    constructor() {
        super();
    }
    bar() {
        console.log.apply( console, arguments );
    }
});

var Mammal5 = this.Mammal5 = OldStyleClass( module, 'class Mammal5 extends', Animal5, {
    constructor: function constructor() {
        this._super();
    },
    bar: function() {
        console.log.apply( console, arguments );
    },
});

var Insect = this.Insect = Class( module, class Insect extends Animal {
    constructor() {
        super();
    }
});

var Insect5 = this.Insect5 = OldStyleClass( module, 'class Insect5 extends', Animal5, {
    constructor: function constructor() {
        this._super();
    }
});
