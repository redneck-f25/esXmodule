/******************************************************************************
 * --- web/boot.js ---------------------------------------------------------- *
 *****************************************************************************/
( function boot() {
"use strict";

var splitModuleNameRegEx = /[\/\.\\]/;

var iterModuleName = function iterModuleName( moduleName, callback ) {
    moduleName.replace( /.js$/, '' ).split( splitModuleNameRegEx ).map( callback );
}

var Module = function Module( moduleName, bucket ) {
    if ( !( this instanceof Module ) ) {
        throw new TypeError( 'WebClient.Module is not meant be invoked directly.' );
    }
    this.name = moduleName;
    this.bucket = bucket;
    this.exports = {}
    this.modules = {}
}

var WebClient = window.WebClient = new Module( '__main__', null );

var require = WebClient.require = function require( bucket, moduleName ) {
    var module;
    if ( moduleName === undefined && typeof bucket === 'string' ) {
        module = WebClient;
        moduleName = bucket;
    } else if ( bucket instanceof Module && typeof moduleName === 'string' ) {
        module = bucket;
        bucket = WebClient;
    } else {
        throw new Error( 'Wrong arguments' );
    }
    iterModuleName( moduleName, function( p, index, array ) {
        if ( module.modules[ p ] instanceof Module ) {
            module = module.modules[ p ];
        } else {
            throw new TypeError( '"' + array.slice( 0, index ) + '.' + p + '" is not a module' );
        }
    });
    return module.exports;
};


var define = WebClient.define = function define( moduleName, moduleCode ) {
    var module, exports;
    module = WebClient;
    if ( moduleName !== '__main__' ) {
        iterModuleName( moduleName, function( p, index, array ) {
            if ( module.modules[ p ] === undefined ) {
                module = module.modules[ p ] = new Module( array.slice( 0, index + 1 ).join( '.' ), module );
            } else if ( module.modules[ p ] instanceof Module ) {
                module = module.modules[ p ];
            } else {
                throw new TypeError( '"' + array.slice( 0, index ) + '" is not a module' );
            }
        });
    }
    
    moduleCode.call( module.exports, module.exports, WebClient.require, module );
    exports = module.exports;
    if ( exports !== undefined && exports !== null )
    {
        exports.__module__ = module;
    }
};

})();
/******************************************************************************
 * --- Class6.js ------------------------------------------------------------ *
 *****************************************************************************/
WebClient.define( 'Class6', function( exports, require, module ) {
"use strict";

var motherOfClasses = Object.getPrototypeOf( Function );

/**
 * @function Class
 * @param {Class | Object} [...mixins]
 * @param {Class} Class 
 */
var Class = module.exports = function Class( module, mixins, Class ) {
    var prototype, static_class_init, baseClass;
    
    mixins = Array.prototype.slice.call( arguments );
    module = mixins.shift();
    Class = mixins.pop();
    
    baseClass = Object.getPrototypeOf( Class );
    
    if ( Class.__class_init ) {
        static_class_init = Class.__class_init;
        delete Class.__class_init;
    }
    
    ( ( prototype = Class.prototype ).__class__ = Class ).__module__ = module;
    
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
    return Class;
};

});
/******************************************************************************
 * --- earth.js-------------------------------------------------------------- *
 *****************************************************************************/
WebClient.define( 'earth', function( exports, require, module ) {
"use strict";

var Class = require( 'Class6.js' );

var LivingThing = this.LivingThing = Class( module, class LivingThing {
    constructor() {
        console.log(
                LivingThing.name + '::constructor()\n' +
                '  class: ' + this.__class__.name + '\n' +
                '  module: ' + this.__class__.__module__.name );
    }
});

});
/******************************************************************************
 * --- earth/animals.js ----------------------------------------------------- *
 *****************************************************************************/
WebClient.define( 'earth.animals', function( exports, require, module ) {
"use strict";

var Class = require( 'Class6.js' );

var LivingThing = require( 'earth.js' ).LivingThing;

var Animal = this.Animal = Class( module, class Animal extends LivingThing {
    static __class_init() {
        this.instanceCounter = 0;
    }
    constructor() {
        super();
        Animal.instanceCounter++;
    }
});

var Mammal = this.Mammal = Class( module, class Mammal extends Animal {
    constructor() {
        super();
    }
});

class Siggi {
    
};

var Insect = this.Insect = Class( module, class Insect extends Animal {
    constructor() {
        super();
    }
});

});
/******************************************************************************
 * --- earth/plants.js ------------------------------------------------------ *
 *****************************************************************************/
 WebClient.define( 'earth.plants', function( exports, require, module ) {
"use strict";

var Class = require( 'Class6.js' );

var LivingThing = require( 'earth.js' ).LivingThing;

var Plant = this.Plant = Class( module, class Plant extends LivingThing {
    constructor() {
        super();
    }
});

var Tree = this.Tree = Class( module, class Tree extends Plant {
    constructor() {
        super();
    }
});

var Flower = this.Flower = Class( module, class Flower extends Plant {
    constructor() {
        super();
    }
});

});
/******************************************************************************
 * --- Application.js ------------------------------------------------------- *
 *****************************************************************************/
 WebClient.define( 'Application', function( exports, require, module ) {
"use strict";

var Class = require( 'Class6.js' );
var LivingThing = require( 'earth.js' ).LivingThing;
var animals = require( 'earth/animals.js' );
var Mammal = animals.Mammal;
var Insect = animals.Insect;
var plants = require( 'earth/plants.js' );
var Tree = plants.Tree;
var Flower = plants.Flower;

var Application = module.exports = Class( module, class Application {
    static run() {
        if ( Application.instance === undefined )
        {
            Application.instance = new Application();
        }
    };
    constructor() {
        var mammal = new Mammal();
        var insect = new Insect();
        var tree = new Tree();
        var flower = new Flower();
    }
});

});
/******************************************************************************
 * --- web/boot.js ---------------------------------------------------------- *
 *****************************************************************************/
( function boot_finish() {
"use strict";

var require = WebClient.require;

require( 'Application' ).run();

})();
/******************************************************************************
 * -------------------------------------------------------------------------- *
 *****************************************************************************/
