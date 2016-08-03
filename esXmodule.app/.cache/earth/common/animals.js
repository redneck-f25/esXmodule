/* earth/common/animals.js ***************************************************/
WebClient.define( "earth/common/animals", function $__module__earth_common_animals__( exports, require, module ) {
"use strict";

var Class = require( '../../utils/Class6' );
var Class5 = require( '../../utils/Class5' );

var LivingThing = require( './earth' ).LivingThing;
var LivingThing5 = require( './earth' ).LivingThing5;

var Animal = this.Animal = Class( module, class Animal extends LivingThing {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Animal.instanceCounter++;
    }
});

var Animal5 = this.Animal5 = Class5( module, 'class Animal5 extends', LivingThing5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function Animal5() {
        this._super();
        Animal5.instanceCounter++;
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

var Mammal5 = this.Mammal5 = Class5( module, 'class Mammal5 extends', Animal5, {
    constructor: function Mammal5() {
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

var Insect5 = this.Insect5 = Class5( module, 'class Insect5 extends', Animal5, {
    constructor: function Insect5() {
        this._super();
    }
});

});
