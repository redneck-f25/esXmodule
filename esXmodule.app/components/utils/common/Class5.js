"use strict";

var motherOfClasses = function Class(){};
var initializing = false;

function makeSuperCall( clazz ) {
    var mro_depth = 0;
    return ( function _super( methodName, args ) {
        if ( typeof methodName !== 'string' ) {
            args = methodName;
            methodName = 'constructor';
        }
        // TODO: is this async-safe?
        mro_depth++;
        var ret = clazz.__mro__[ mro_depth ].prototype[ methodName ].apply( this, args );
        mro_depth--;
        return ret;
    });
}

var CONSTRUCTOR_BODY = [
    "",
    // "  debugger;",
    "  if ( !( this instanceof clazz ) ) {",
    "    throw new TypeError( 'class constructors must be invoked with |new|' );",
    "  }",
    "  if ( !initializing ) {",
    "    Object.defineProperty( this, '_super', { value: makeSuperCall( clazz ) } );",
    "    if ( this.constructor ) {",
    "      var ret = this.constructor.apply( this, arguments );",
    "      return ret === undefined ? this : ret;",
    "    }",
    "  }",
    "  return this;",
    "",
    ]
if ( 'debug' === 'debug' ) {
    CONSTRUCTOR_BODY = CONSTRUCTOR_BODY.join( '\n' );
} else {
    CONSTRUCTOR_BODY = CONSTRUCTOR_BODY.map( function __mapConstructorBody( line ) {
        return line.replace( /^\s+/, '' );
    }).join( ' ' );
}

function makeClass( className ) {
    var clazz = eval( "( function " + className + "() {" + CONSTRUCTOR_BODY + "} )" );
    return clazz;
}

var Class = module.exports = function Class( module, mixins, className, baseClass, classDef ) {
    var prototype, static_class_init, clazz;
    
    mixins = Array.prototype.slice.call( arguments );
    module = mixins.shift();
    classDef = mixins.pop();
    baseClass = mixins.pop();
    if ( typeof baseClass === 'string' ) {
        className = baseClass;
        baseClass = motherOfClasses;
    } else {
        className = mixins.pop();
        // if ( !( baseClass instanceof motherOfClasses ) ) {
        //     throw new TypeError( 'baseClass is not a Class' );
        // }
    }
    className = className.split( /\s+/ )[ 1 ];
    
    // extract static initializer
    if ( classDef.__static_class_init ) {
        static_class_init = classDef.__static_class_init;
        delete classDef.__static_class_init;
    }
    
    // do what ES6 does, create the class object
    clazz = makeClass( className );
    
    initializing = true;
    clazz.prototype = new baseClass();
    initializing = false;
    
    // copy static methods from base class 
    for ( var name in baseClass ) {
        if ( typeof baseClass[ name ] == 'function' ) {
            clazz[ name ] = baseClass[ name ];
        }
    }
    // move static methods from class definition
    for ( var name in classDef ) {
        if ( name.substr( 0, 9 ) === '__static_' ) {
            clazz[ name.substr( 9 ) ] = classDef[ name ];
            delete classDef[ name ];
        }
    }
    // copy methods from base class
    for ( var name in baseClass.prototype ) {
        typeof baseClass.prototype[ name ] === 'function' && ( clazz.prototype[ name ] = baseClass.prototype[ name ] );
    }
    // copy methods from class definition
    for ( var name in classDef ) {
        typeof classDef[ name ] === 'function' && ( clazz.prototype[ name ] = classDef[ name ] );
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

Class.allClasses = [];

Class.abstractMethod = function abstractMethod() { throw new TypeError( 'Method is abstract.' ); };

Class.getBaseOf = function getBaseOf( clazz, /* [ module ], */ name ) {
    var module, baseClass;
    
    if ( arguments.length === 0 ) {
        return clazz.__mro__.length > 1 ? clazz.__mro__[ 1 ] : null;
    } else if ( arguments.length > 1 ) {
        name = arguments[ 1 ];
        module = typeof arguments[ 0 ] == 'string' ? arguments[ 0 ] : arguments[ 0 ].__name__;
    } else {
        var p = name.lastIndexOf( '.' );
        module = name.substr( 0, p );
        name = name.substr( p + 1 );
    }
    
    clazz.__mro__.some( function __someMro( clazz ) {
        if ( clazz.name === name && ( !module || clazz.__module__.__name__ === module ) ) {
            baseClass = clazz;
            return true;
        }
    } );
    
    return baseClass || null;
}
