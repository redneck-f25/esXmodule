/**
 * Module management for ECMAScript 6.
 *
 * @module es6module
 * @author Daniel Hammerschmidt <daniel@redneck-engineering.com>
 */
( function( instance ) {
"use strict";

var motherOfClasses = Object.getPrototypeOf( Function );

/**
 * @class Module
 * @constructor
 * @param {String} moduleName Fully qualified name.
 */
var Module = class Module {
    constructor( moduleName ) {
        var module;
        module = instance;
        moduleName.split( '.' ).map( function( p ) {
            module = module[ p ] || ( module[ p ] = {} );
        });
        ( this.module = module ).__name__ = moduleName;
    }
    /**
     * @method get
     * @param {String} moduleName Fully qualified name.
     * @return {Module} Module
     */
    static get( moduleName ) {
        var module;
        module = instance;
        moduleName.split( '.' ).map( function( p ) {
            module = module[ p ];
        });
        return module;
    }
    /**
     * @method Class
     * @param {Boolean} [visible=true]
     * @param {Class | Object} [...mixins]
     * @param {Class} Class 
     */
    Class( visible, mixins, Class ) {
        var prototype, static_class_init, baseClass;
        
        mixins = Array.prototype.slice.call( arguments );
        Class = mixins.pop();
        
        visible = ( mixins.length && mixins[ 0 ] === false ) ? mixins.shift() : true;
        
        baseClass = Object.getPrototypeOf( Class );
        
        if ( Class.__class_init ) {
            static_class_init = Class.__class_init;
            delete Class.__class_init;
        }
        
        ( ( prototype = Class.prototype ).__class__ = Class ).__module__ = this.module;
        
        /* Mix in. Last wins.*/
        mixins.reverse().forEach( function( mixin ) {
            /* if mixing in a class inspect its prototype */
            typeof mixin === 'function' && ( mixin = mixin.prototype );
            Object.getOwnPropertyNames( mixin ).forEach( function( name ) {
                prototype.hasOwnProperty( name ) || ( prototype[ name ] = mixin[ name ] );
            });
        });
        
        /* Method Resolution Order */
        Class.__mro__ = [ Class ].concat(
                baseClass === motherOfClasses ? [] : baseClass.__mro__ );
        
        /* Method to get base class from mro */
        Class.__base__ = function __base__( /* [ module ], */ name ) {
            var module, baseClass;
            
            if ( arguments.length === 0 ) {
                return this.__mro__.length > 1 ? this.__mro__[ 1 ] : null;
            } else if ( arguments.length > 1 ) {
                name = arguments[ 1 ];
                module = typeof arguments[ 0 ] == 'string' ? arguments[ 0 ] : arguments[ 0 ].__name__;
            } else {
                var p = name.lastIndexOf( '.' );
                module = name.substr( 0, p );
                name = name.substr( p + 1 );
            }
            
            this.__mro__.some( function( clazz ) {
                if ( clazz.name === name && ( !module || clazz.__module__.__name__ === module ) ) {
                    baseClass = clazz;
                    return true;
                }
            } );
            
            return baseClass || null;
        }
        
        /* Method to get and set static variables */
        prototype.__static__ = function __static__( name, newValue ) {
            var oldValue, found;
            
            found = this.__class__.__mro__.some( function ( clazz ) {
                if ( clazz.hasOwnProperty( name ) ) {
                    oldValue = clazz[ name ];
                    if ( newValue !== undefined ) {
                        clazz[ name ] = newValue;
                    }
                    return true;
                }
            });
            
            if ( found ) {
                return oldValue;
            }
            
            throw new Error( 'Static Variable ' + name + ' not found.' );
        }
        
        /* Execute static initializer. */
        static_class_init && static_class_init.call( Class );
        
        mixins = undefined;
        static_class_init = undefined;
        
        /* return the class object and add to module if visible */
        return ( visible ? this.module[ Class.name ] = Class : Class );
    }
    /**
     * Iterates over classes in modules.
     *
     * @method iterClasses
     * @static
     * @param {Boolean}  [recursive=true]
     * @param {Module}   ...modules
     * @param {Function} callback
     */
    static iterClasses( recursive, modules, callback ) {
        modules = Array.prototype.slice.call( arguments );
        callback = modules.pop();
        recursive = modules[ 0 ] === false ? recursive : true;
        
        modules.forEach( ( function doit( pre, module ) {
            Object.getOwnPropertyNames( module ).sort().forEach( function( name )  {
                var o = module[ name ];
                if ( typeof o === 'object' &&
                     name[ 0 ] == name[ 0 ].toLowerCase() ) {
                    recursive && doit( pre + name + '.', o );
                } else if ( typeof o === 'function' &&
                            name[ 0 ] == name[ 0 ].toUpperCase() &&
                            o.__module__ === module ) {
                    callback( o );
                }
            });
        } ).bind( undefined, '' ) )
    }
    /**
     * Iterates over methods in classes.
     *
     * @method iterMethods
     * @static
     * @param {Module}   ...classes
     * @param {Function} callback
     */
    static iterMethods( classes, callback ) {
        classes = Array.prototype.slice.call( arguments );
        callback = classes.pop();
        
        classes.forEach( function( clazz ) {
            [ [ clazz.prototype, '' ], [ clazz, 'static ' ] ].forEach( function( t ) {
                Object.getOwnPropertyNames( t[ 0 ] ).sort().forEach( function( name )  {
                    var o = t[ 0 ][ name ];
                    if ( typeof o === 'function' && name !== '_super' &&
                         !name.startsWith( '__' ) && !name.endsWith( '__' ) ) {
                        callback( o, t[ 1 ] + name );
                    }
                });
            });
        });
    }
};

new Module( 'ecmascript.v6' ).Class( Module );

})( WebClient );