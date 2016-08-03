( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v5.Module( 'earth.plants' );

var Plant5 = Module.Class( 'class Plant5 extends', instance.earth.LivingThing5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Plant5.instanceCounter++;
    },
});

var Tree5 = Module.Class( 'class Tree5 extends', Plant5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Tree5.instanceCounter++;
    },
});

var Flower5 = Module.Class( 'class Flower5 extends', Plant5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Flower5.instanceCounter++;
    },
});

})( WebClient );
