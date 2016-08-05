"use strict";

var initializing = false;
var motherOfClasses = function Class() {};

var Class = module.exports = function Class( module, mixins, className, baseClass, classDef ) {
    var static_class_init, clazz;
    
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
    // TODO: https://jsfiddle.net/zkmav1bs/
    // // copy methods from base class
    // for ( var name in baseClass.prototype ) {
    //     typeof baseClass.prototype[ name ] === 'function' && ( clazz.prototype[ name ] = baseClass.prototype[ name ] );
    // }
    // copy methods from class definition
    for ( var name in classDef ) {
        typeof classDef[ name ] === 'function' && ( clazz.prototype[ name ] = classDef[ name ] );
    }
    
    return Class._doTheMagic( module, clazz, baseClass, mixins, static_class_init );
};

Class._doTheMagic = function _doTheMagic( module, clazz, baseClass, mixins, static_class_init ) {
    var prototype = clazz.prototype;

    Object.defineProperties( clazz, {
        __module__: { value: module },
        __mro__: { value: [ clazz ].concat( baseClass.__mro__ || [] ) },
    });

    Object.defineProperties( prototype, {
        __class__: { value: clazz },
    });
    
    /* Mix in. Last wins.*/
    mixins.reverse().forEach( function __forEachMixin( mixin ) {
        /* if mixing in a class inspect its prototype */
        typeof mixin === 'function' && ( mixin = mixin.prototype );
        for ( var name in mixin ) {
            prototype.hasOwnProperty( name ) || ( prototype[ name ] = mixin[ name ] );
        }
    });

    for ( var name in prototype ) {
        if ( typeof prototype[ name ] === 'function' && prototype[ name ] === Class.abstractMethod ) {
            Object.defineProperties( clazz, {
                __is_abstract__: { value: true }
            });
        }
    }
    
    /* Execute static initializer. */
    static_class_init && static_class_init.call( clazz, clazz );
    
    /* return the class object and add to module if visible */
    Class.allClasses.push( clazz );

    return clazz;
}

Class.allClasses = [];

( function __populateAllModulesToWebClient() {
    var bucket = module;
    while ( bucket.bucket ) {
        bucket = bucket.bucket;
    }
    bucket.allClasses = Class.allClasses;
})();

Class.abstractMethod = function __abstract_method__() { throw new TypeError( 'Method is abstract.' ); };

// TODO: Think about how to implement include().
// Class.include = function include( statik, clazz, includes ) {
//     includes = Array.prototype.slice.call( arguments );
//     statik = includes[ 0 ] === true ? includes.shift() : false;
//     clazz = includes.shift();
//     includes.forEach( ( function __forEachInclude( mixin ) {
//         typeof mixin === 'function' && ( mixin = mixin.prototype );
//         for ( var name in mixin ) {
//             this.hasOwnProperty( name ) || mixin.hasOwnProperty( name ) && ( this[ name ] = mixin[ name ] );
//         }
//     }).bind( statik ? clazz : clazz.prototype ) );
// }

Class.I = require( './_interfaces' );

Class.getBaseOf = function getBaseOf( clazz, /* [ module ], */ className ) {
    // TODO: think about reasonableness and implementation
    var moduleName, baseClass;
    
    if ( arguments.length === 1 ) {
        return clazz.__mro__.length > 1 ? clazz.__mro__[ 1 ] : null;
    } else if ( arguments.length > 2 ) {
        className = arguments[ 1 ];
        moduleName = typeof arguments[ 0 ] == 'string' ? arguments[ 0 ] : arguments[ 0 ].__name__;
    } else {
        var p = className.lastIndexOf( '.' );
        moduleName = className.substr( 0, p );
        className = className.substr( p + 1 );
    }
    
    clazz.__mro__.some( function __someOfMro( clazz ) {
        if ( clazz.className === className && ( !moduleName || clazz.__module__.__name__ === moduleName ) ) {
            baseClass = clazz;
            return true;
        }
    } );
    
    return baseClass || null;
}

function makeSuperCall( clazz ) {
    var mro_depth = 0;
    return ( function _super( methodName, args ) {
        if ( typeof methodName !== 'string' ) {
            args = methodName;
            methodName = 'constructor';
        }
        // TODO: Is this async-safe?
        mro_depth += 1;
        var ret = clazz.__mro__[ mro_depth ].prototype[ methodName ].apply( this, args );
        mro_depth -= 1;
        return ret;
    });
}

function makeClass( className ) {
    var clazz = eval( "( function " + className + "() {" + makeClass.CONSTRUCTOR_BODY + "} )" );
    return clazz;
}

makeClass.CONSTRUCTOR_BODY = [
    "",
    // "  debugger;",
    "  if ( !( this instanceof clazz ) ) {",
    "    throw new TypeError( 'class constructors must be invoked with |new|' );",
    "  }",
    "  if ( !initializing ) {",
    // "    debugger;",
    "    Object.defineProperty( this, '_super', { value: makeSuperCall( clazz ) } );",
    "    if ( this.constructor ) {",
    "      var ret = this.constructor.apply( this, arguments );",
    "      return ret === undefined ? this : ret;",
    "    }",
    "  }",
    "  return this;",
    "",
    ];

if ( 'debug' === 'debug' ) {
    makeClass.CONSTRUCTOR_BODY = makeClass.CONSTRUCTOR_BODY.join( '\n' );
} else {
    makeClass.CONSTRUCTOR_BODY = makeClass.CONSTRUCTOR_BODY.map( function __mapConstructorBody( line ) {
        return line.replace( /^\s+/, '' );
    }).join( ' ' );
}
