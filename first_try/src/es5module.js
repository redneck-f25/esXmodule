/**
 * Module management for ECMAScript 5.
 *
 * @module es5module
 * @author Daniel Hammerschmidt <daniel@redneck-engineering.com>
 */
( function( instance ) {
"use strict";

var motherOfClasses = function Class(){};
var initializing = false;

/**
 * @class Module
 * @constructor
 * @param {String} moduleName Fully qualified name.
 */
{ // This code block exists for same indentation as in ES6.
    var Module = function Module( moduleName ) {
        var module;
        module = instance;
        moduleName.split( '.' ).map( function( p ) {
            module = module[ p ] || ( module[ p ] = {} );
        });
        ( this.module = module ).__name__ = moduleName;
    };
    /**
     * @method get
     * @param {String} moduleName Fully qualified name.
     * @return {Module} Module
     */
    Module.get = function( moduleName ) {
        var module;
        module = instance;
        moduleName.split( '.' ).map( function( p ) {
            module = module[ p ];
        });
        return module;
    };
    /**
     * @method Class
     * @param {Boolean} [visible=true]
     * @param {Class | Object} [...mixins]
     * @param {Class} Class 
     */
    Module.prototype.Class = function( visible, mixins, className, baseClass, classDef ) {
        var prototype, static_class_init, Class;
        
        mixins = Array.prototype.slice.call( arguments );
        classDef = mixins.pop();
        baseClass = mixins.pop();
        if ( typeof baseClass === 'string' ) {
            className = baseClass;
            baseClass = motherOfClasses;
        } else {
            className = mixins.pop();
        }
        className = className.split( /\s+/ )[ 1 ];
        
        visible = ( mixins.length && mixins[ 0 ] === false ) ? mixins.shift() : true;
        
        if ( classDef.__static_class_init ) {
            static_class_init = classDef.__static_class_init;
            delete classDef.__static_class_init;
        }
        
        ( function() { // do what ES6 does, create the class object
            Class = eval(
                    "( function " + className + "() { " +
                        "if ( !( this instanceof Class ) ) { " +
                            "throw new TypeError( 'class constructors must be invoked with |new|' ); " +
                        "} " +
                        "if ( !initializing && this.constructor ) { " +
                            "var ret = this.constructor.apply( this, arguments ); " +
                            "return ret === undefined ? this : ret; " +
                        "} else { " +
                            "return this; " +
                        "} " +
                    "} )");
            
            initializing = true;
            Class.prototype = new baseClass();
            initializing = false;
            
            for ( var name in baseClass ) {
                if ( typeof baseClass[ name ] == 'function' &&
                     !( name.startsWith( '__' ) && name.endsWith( '__' ) ) ) {
                    Class[ name ] = baseClass[ name ];
                }
            }
            for ( var name in classDef ) {
                if ( name.startsWith( '__static_' ) ) {
                    Class[ name.substr( 9 ) ] = classDef[ name ];
                    delete classDef[ name ];
                }
            }
            
            Class.prototype._super = function _super( methodName, args ) {
                var tmp = Class.prototype._super;
                Class.prototype._super = baseClass.prototype._super;
                if ( typeof methodName !== 'string' ) {
                    args = methodName;
                    methodName = 'constructor';
                }
                var ret = baseClass.prototype[ methodName ].apply( this, args );
                Class.prototype._super = tmp;
                return ret;
            };
            
            return Class;
        })();
        
        ( ( prototype = Class.prototype ).__class__ = Class ).__module__ = this.module;
        
        /* Mix in. Last wins.*/
        mixins.concat( [ baseClass, classDef ] ).forEach( function( mixin ) {
            /* if mixing in a class inspect its prototype */
            typeof mixin === 'function' && ( mixin = mixin.prototype );
            for ( var name in mixin ) {
                name === '_super' || ( prototype[ name ] = mixin[ name ] );
            }
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
        classDef = undefined;
        static_class_init = undefined;
        
        /* return the class object and add to module if visible */
        return ( visible ? this.module[ className ] = Class : Class );
    };
    /**
     * Iterates over classes in modules.
     *
     * @method iterClasses
     * @static
     * @param {Boolean}  [recursive=true]
     * @param {Module}   ...modules
     * @param {Function} callback
     */
    Module.iterClasses = function iterClasses( recursive, modules, callback ) {
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
    };
    /**
     * Iterates over methods in classes.
     *
     * @method iterMethods
     * @static
     * @param {Module}   ...classes
     * @param {Function} callback
     */
    Module.iterMethods = function iterMethods( classes, callback ) {
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
    };
};

new Module( 'ecmascript.v5' ).module.Module = Module;

})( WebClient );