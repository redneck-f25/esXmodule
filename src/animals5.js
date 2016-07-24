( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v5.Module( 'earth.animals' );

var Animal5 = Module.Class_extends( 'Animal5', instance.earth.LivingThing5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Animal5.instanceCounter++;
    },
    doSomething: function( what ) {
        this._super( 'doSomething', [ what ] );
        console.log( 'Animal5.doSomething( "' +  what + '" )' );
    },
});

var Mammal5 = Module.Class_extends( 'Mammal5', Animal5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Mammal5.instanceCounter++;
    },
    doSomething: function( what ) {
        this._super( 'doSomething', [ what ] );
        console.log( 'Mammal5.doSomething( "' +  what + '" )' );
    },
});

var Insect5 = Module.Class_extends( 'Insect5', Animal5, {
    __static_class_init: function() {
        this.instanceCounter = 0;
    },
    constructor: function() {
        this._super();
        Insect5.instanceCounter++;
    },
});

})( WebClient );
