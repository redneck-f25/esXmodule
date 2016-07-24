( function( instance ) {
"use strict";

if ( instance.ecmascript.v6 ) {
    var mammal = new instance.earth.animals.Mammal();
    var flower = new instance.earth.plants.Flower();

    console.log( flower.__class__.__base__( 'earth.LivingThing' ));
    console.log( flower.__class__.__base__( 'earth', 'LivingThing' ));
    console.log( flower.__class__.__base__( instance.earth, 'LivingThing' ));
    console.log( flower.__class__.__module__ );
    console.log( flower.__class__.__base__( 'earth.LivingThing' ));
    console.log( '---' );
    instance.ecmascript.v6.Module.listClasses( instance.earth.animals, instance.earth.plants );
    console.log( '---' );
    instance.ecmascript.v6.Module.listClasses( instance.ecmascript.v6.Module.listMethods, instance );

    mammal.doSomething( 'lactate' );
    flower.doSomething( 'blossom' );
}

if ( instance.ecmascript.v5 ) {
    var earth = instance.ecmascript.v5.Module.get( 'earth' );

    var thing5= new instance.earth.LivingThing5();
    var mammal5 = new instance.earth.animals.Mammal5();
    var plant5= new instance.earth.plants.Plant5();
    var flower5 = new instance.earth.plants.Flower5();
    mammal5.doSomething( 'lactate' );

    window.mammal5 = mammal5;

    console.log(mammal5.constructor, mammal5.__class__);
    console.log(plant5.constructor, plant5.__class__ );
    console.log(flower5.constructor, flower5.__class__);
    console.log(thing5.constructor, thing5.__class__);
    console.log(mammal5 instanceof earth.animals.Mammal5);
    console.log(mammal5 instanceof earth.animals.Animal5);
    console.log(mammal5 instanceof earth.LivingThing5);
}
})(WebClient);