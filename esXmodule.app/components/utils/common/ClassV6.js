"use strict";

var OldStyleClass = require( './Class' );

var Class = module.exports = function Class( module, mixins, clazz ) {
    var static_class_init, baseClass;
    
    mixins = Array.prototype.slice.call( arguments );
    module = mixins.shift();
    clazz = mixins.pop();
    baseClass = Object.getPrototypeOf( clazz );
    
    // extract static initializer
    if ( clazz.__class_init ) {
        static_class_init = clazz.__class_init;
        delete clazz.__class_init;
    }

    return Class._doTheMagic( module, clazz, baseClass, mixins, static_class_init );  
};

for ( var k in OldStyleClass ) {
    Class.hasOwnProperty( k ) || ( Class[ k ] = OldStyleClass[ k ] );
}
