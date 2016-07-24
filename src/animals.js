( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v6.Module( 'earth.animals' );

var Animal = Module.Class( class Animal extends instance.earth.LivingThing {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Animal.instanceCounter++;
    }
    doSomething( what ) {
        super.doSomething( what );
        console.log( 'Animal.doSomething( "' +  what + '" )' );
    }
});

var Mammal = Module.Class( class Mammal extends Animal {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Mammal.instanceCounter++;
    }
    doSomething( what ) {
        super.doSomething( what );
        console.log( 'Mammel.doSomething( "' +  what + '" )' );
    }
});

var Insect = Module.Class( class Insect extends Animal {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Insect.instanceCounter++;
    }
});

})( WebClient );
