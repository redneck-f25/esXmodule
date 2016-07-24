( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v6.Module( 'earth' );

var LivingThing = Module.Class( class LivingThing {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        LivingThing.instanceCounter++;
    }
    doSomething( what ) {
        console.log( 'LivingThing.doSomething( "' +  what + '" )' );
    }
});

})( WebClient );
