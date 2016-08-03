"use strict";

var Class5 = require( './Class5' );

var motherOfClasses = Object.getPrototypeOf( Function );

var Class = module.exports = function Class( module, mixins, clazz ) {
    var prototype, static_class_init, baseClass;
    
    mixins = Array.prototype.slice.call( arguments );
    module = mixins.shift();
    clazz = mixins.pop();
    baseClass = Object.getPrototypeOf( clazz );
    
    // extract static initializer
    if ( clazz.__class_init ) {
        static_class_init = clazz.__class_init;
        delete clazz.__class_init;
    }
    
    prototype = clazz.prototype;

    Object.defineProperties( clazz, {
        __module__: { value: module },
        __mro__: { value: [ clazz ].concat( baseClass === motherOfClasses ? [] : baseClass.__mro__ ) },
    });

    Object.defineProperties( prototype, {
        __class__: { value: clazz },
    });
    
    /* Mix in. Last wins.*/
    mixins.reverse().forEach( function __forEachMixin( mixin ) {
        /* if mixing in a class inspect its prototype */
        typeof mixin === 'function' && ( mixin = mixin.prototype );
        Object.getOwnPropertyNames( mixin ).forEach( function __forEachProperty( name ) {
            prototype.hasOwnProperty( name ) || ( prototype[ name ] = mixin[ name ] );
        });
    });
    
    for ( var name in prototype ) {
        if ( typeof prototype[ name ] === 'function' && prototype[ name ] === Class.abstractMethod ) {
            Object.defineProperties( clazz, {
                __is_abstract__: { value: true }
            });
        }
    }
    
    /* Execute static initializer. */
    static_class_init && static_class_init.call( clazz );
    
    /* return the class object and add to module if visible */
    Class.allClasses.push( clazz );
    return clazz;
};

Class.allClasses = Class5.allClasses;

Class.abstractMethod = Class5.abstractMethod;

Class.getBaseOf = Class5.getBaseOf;
