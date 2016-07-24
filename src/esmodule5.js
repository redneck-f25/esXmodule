( function( instance ) {
"use strict";

var _Class = function Class(){};
var functionPrototype = Object.getPrototypeOf( Function );
var initializing = false;

var Module = function Module( name ) {
    var module;
    module = instance;
    name.split( '.' ).map( function( p ) {
        module = module[ p ] || ( module[ p ] = {} );
    });
    ( this.module = module ).__name__ = name;
};

Module.get = function( name ) {
    var module;
    module = instance;
    name.split( '.' ).map( function( p ) { module = module[ p ]; });
    return module;
};

Module.prototype.Class = function( visible, mixins, name, classDef ) {
    var args;
    
    args = [].slice.call( arguments );
    args = args.slice( 0, -1 ).concat( _Class, args.slice( -1 ) );
    return Module.prototype.Class_extends.apply( this, args );
};

Module.prototype.Class_extends = function( visible, mixins, name, base, classDef ) {
    var prototype, static_class_init;
    
    mixins = [].slice.call( arguments, 0, -3 );
    classDef = arguments[ mixins.length + 2 ];
    name = arguments[ mixins.length ];
    base = arguments[ mixins.length + 1 ];
    
    visible = ( mixins.length && mixins[ 0 ] === false ) ? mixins.shift() : true;
    
    // Instantiate a base class (but only create the instance,
    // don’t run the constructor)
    initializing = true;
    prototype = new base();
    initializing = false;
    
    if ( classDef.__static_class_init ) {
        static_class_init = classDef.__static_class_init;
        delete classDef.__static_class_init;
    }
    
    var $$ = function $$() {
        if ( !initializing && this.constructor ) {
            var ret = this.constructor.apply( this, arguments );
            if ( ret !== undefined ) return ret;
        }
        return this;
    }
    
    var Class = eval( '(function ' + name + '(){ return $$.apply(this, arguments); })' );
    
    mixins.concat( [ base, classDef ] ).forEach( function( body ) {
        for ( var name in body ) {
            prototype[ name ] = body[ name ];
        }
    });
    
    prototype._super = function _super( name, args ) {
        var tmp = Class.prototype._super;
        Class.prototype._super = base.prototype._super;
        if ( typeof name !== 'string' ) {
            args = name;
            name = 'constructor';
        }
        var ret = base.prototype[ name ].apply( this, args );
        Class.prototype._super = tmp;
        return ret;
    };
    
    //Class.constructor = Class;
    
    ( Class.prototype = prototype ).__class__ = Class;
    
    Class.__module__ = this.module;
    
    /* Method Resolution Order */
    Class.__mro__ = [ Class ].concat( base === _Class ? [] : base.__mro__ );
    
    /* get base class from mro */
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
        
    static_class_init && static_class_init.call( Class );
    
    return ( visible ? this.module[ name ] = Class : Class );
};

new Module( 'ecmascript.v5' ).module.Module = Module;

})( WebClient );