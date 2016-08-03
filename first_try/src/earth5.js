( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v5.Module( 'earth' );

var LivingThing5 = Module.Class( 'class LivingThing5', {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        LivingThing5.instanceCounter++;
    },
    doSomething: function( what ) {
        console.log( 'LivingThing5.doSomething( "' +  what + '" )' );
    },
});

})( WebClient );
