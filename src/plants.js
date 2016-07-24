( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v6.Module( 'earth.plants' );

var Plant = Module.Class( class Plant extends instance.earth.LivingThing {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Plant.instanceCounter++;
    }
});

var Tree = Module.Class( class Tree extends Plant {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Tree.instanceCounter++;
    }
});

var Flower = Module.Class( class Flower extends Plant {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Flower.instanceCounter++;
    }
});

})( WebClient );
