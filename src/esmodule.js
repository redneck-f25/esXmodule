( function( instance ) {
"use strict";

var functionPrototype = Object.getPrototypeOf( Function );

var Module = class Module {
    constructor( name ) {
        var module;
        
        this.name = name;
        module = instance;
        name.split( '.' ).map( function( p ) {
            module = module[ p ] || ( module[ p ] = {} );
        });
        module.__name__ = name;
        this.module = module;
    }
    static get( name ) {
        var module;
        module = instance;
        name.split( '.' ).map( function( p ) { module = module[ p ]; });
        return module;
    }
    Class( visible, mixins, Class ) {
        var __proto__, prototype;
        
        /* all arguments except the latter are mixins */
        mixins = [].slice.call( arguments, 0, -1 );
        Class = arguments[ mixins.length ];
        
        visible = ( mixins.length && mixins[ 0 ] === false ) ? mixins.shift() : true;
        
        __proto__ = Object.getPrototypeOf( Class );
        ( prototype = Class.prototype ).__class__ = Class;
        
        //console.log( '> Init class ' + Class.name + ' extends ' + __proto__.name );
        
        Class.__module__ = this.module;
        
        /* Method Resolution Order */
        Class.__mro__ = [ Class ].concat( __proto__ === functionPrototype ? [] :
                __proto__.prototype.__class__.__mro__ );
        
        /* get base class from mro */
        Class.__base__ = function ( /* [ module ], */ name ) {
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
            
            var doit = function doit( clazz ) {
                if ( clazz.name === name && ( !module || clazz.__module__.__name__ === module ) ) {
                    baseClass = clazz;
                    return true;
                }
            }
            
            this.__mro__.some( doit );
            
            return baseClass || null;
        }
        
        /* Get and set static variables */
        prototype.__static__ = function( name, newValue ) {
            var oldValue;
            
            var doit = function doit( clazz ) {
                if ( clazz.hasOwnProperty( name ) ) {
                    oldValue = clazz[ name ];
                    if ( newValue !== undefined ) {
                        clazz[ name ] = newValue;
                    }
                    return true;
                }
            }
            
            if ( this.__class__.__mro__.some( doit ) ) {
                return oldValue;
            }
            
            throw new Error( 'Static Variable ' + name + ' not found.' );
        }
        
        /* Mix in. Last wins.*/
        mixins.reverse().forEach( function( mixin ) {
            if ( typeof mixin === 'function' ) {
                mixin = mixin.prototype;
            }
                
            Object.getOwnPropertyNames( mixin ).forEach( function( name ) {
                if ( !prototype.hasOwnProperty( name ) ) {
                    console.log( '  > Mixing in ' + name );
                    prototype[ name ] = mixin[ name ];
                }
            });
        });
        
        /* Execute static initializer. */
        if ( Class.__class_init ) {
            Class.__class_init();
            delete Class.__class_init;
        }
        
        /* return the class object and add to module if visible */
        return ( visible ? this.module[ Class.name ] = Class : Class );
    }
    
    static listClasses( /*[ callback ],*/ module /*...*/ ) {
        var callback, modules;
        
        var doit = function doit( pre, module ) {
            Object.getOwnPropertyNames( module ).sort().forEach( function( name )  {
                var o = module[ name ];
                if ( typeof o === 'object' ) {
                    doit( pre + name + '.', o )
                } else if ( typeof o === 'function' && o.__module__ === module ) {
                    console.log( pre + name, o, o.instanceCounter, o.__mro__.slice( 1 ) );
                    callback && callback( o );
                }
            });
        }
        modules = [].slice.call( arguments );
        callback = typeof modules[ 0 ] === 'function' ? modules.shift() : false;
        modules.forEach( doit.bind( null, '' ) )
    }
    
    static listMethods( clazz ) {
        [ [ clazz.prototype, '' ],[ clazz, 'static ' ] ].forEach( function( v ) {
            Object.getOwnPropertyNames( v[ 0 ] ).sort().forEach( function( name )  {
                var o = v[ 0 ][ name ];
                if ( typeof o !== 'function' || ( name.startsWith( '__' ) && name.endsWith( '__' ) ) || name === '_super' ) {
                    return;
                }
                console.log( '  ', v[ 1 ] + name );
            });
        });
    }
};

new Module( 'ecmascript.v6' ).Class( Module );

})( WebClient );