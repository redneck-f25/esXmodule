( function( instance ) {
"use strict";
var Module = new instance.ecmascript.v5.Module( 'application' );

var Application = Module.Class( 'class Application', {
    constructor: function() {
        window.addEventListener( 'error', this.on_unhandled_error.bind( this ) );
        var boot_script = document.getElementById('boot_script');
        boot_script.parentElement.removeChild(boot_script);
        boot_script = null;
        instance.log = function( msg ) {
            var div = document.body.appendChild( document.createElement( 'div' ) )
            msg && ( div.innerHTML = msg );
            console.log.apply( console, arguments );
            return div;
        };
    },
    run: function() {
        document.body.appendChild( document.createElement( 'div' ) ).innerHTML = '[SUCCESS] Start application';
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
        try {
            ( {} ).x.x = x;
        } catch( e ) {
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
        if ( instance.ecmascript.v6 ) {
            new instance.mix.MixClass1( 'MixClass1' ).doit( 'MixClass1' );
            var mixclass11 = new instance.mix.MixClass11( 'MixClass11' ).doit( 'MixClass11' ).foobar( 'MixClass11' )
            mixclass11.foobar( 'MixClass21' );
            new instance.mix.MixClass2( 'MixClass2' ).doit( 'MixClass2' );
            new instance.mix.MixClass21( 'MixClass21' ).doit( 'MixClass21' ).foobar( 'MixClass21' ).foobaz( 'MixClass21' );
            //new instance.mix.MixClass3( 'MixClass3' ).doit( 'MixClass3' );
        }
    },
    on_unhandled_error: function( event ) {
        var err, msg;

        err = event.error;
        msg = [
            '[FAIL] Unhandled Exception @ ' +
            err.fileName + //.replace( baseUrlRe, '' ) +
            ':' + err.lineNumber + ':' + err.columnNumber,
            err.message,
            ].concat( err.stack.split( /\n/ ) );
        
        document.body.appendChild( document.createElement( 'div' ) ).innerHTML = msg.join( '<br>\n' );
    },
});

})(WebClient);