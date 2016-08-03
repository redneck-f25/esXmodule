/* web/boot.js ***************************************************************/
( function $__module__web_boot__( ressources ) {
"use strict";

var debug = /(^\??|&)debug(=.*?)?(&|$)/.test( location.search );
console.log( new Date() );

var allModules = {};

var Module = function Module( moduleName, bucket, moduleCode ) {
    if ( !( this instanceof Module ) ) {
        throw new TypeError( 'class constructors must be invoked with |new|.' );
    }
    ( this.allModules = allModules )[ moduleName ] = this;
    this.name = moduleName;
    this.bucket = bucket;
    this.exports = {};
    this.modules = {};
    this.initialized = false;
    this.parent = undefined;
    this.children = [];
    this.compiledCode = moduleCode;
    this._require = Module._require.bind( this );
}

Module._require = function require( moduleName ) {
    var module = this.bucket || this;
    moduleName.split( '/' ).forEach( function handleEachModuleNameSplit( p, index, array ) {
        if ( p === '.' ) {
            return;
        } else if ( p == '..' ) {
            module = module.bucket;
        } else if ( module.modules[ p ] instanceof Module ) {
            module = module.modules[ p ];
        } else {
            debugger;
            throw new TypeError( '"' + ( index ? array.slice( 0, index ).join( '/' ) + '/' : '' ) + p + '" is not a module' );
        }
    });
    if ( !module.initialized ) {
        module.compiledCode.call( module.exports, module.exports, module._require, module );
        var exports = module.exports;
        if ( exports !== undefined && exports !== null && exports.__module__ === undefined ) {
            Object.defineProperties( exports, { __module__: { value: module } } );
        }
        module.initialized = true;
        module.parent = this;
    }
    module in this.children || this.children.push( module );
    return module.exports;
};

var WebClient = window.WebClient = new Module( '__main__', null );
var require = WebClient._require;

WebClient.define = function define( moduleName, moduleCode ) {
    var module, exports;
    module = WebClient;
    if ( moduleName !== '__main__' ) {
        moduleName.split( '/' ).forEach( function( p, index, array ) {
            if ( module.modules[ p ] === undefined ) {
                module = module.modules[ p ] = new Module( array.slice( 0, index + 1 ).join( '/' ), module, moduleCode );
            } else if ( module.modules[ p ] instanceof Module ) {
                module = module.modules[ p ];
            } else {
                throw new TypeError( '"' + array.slice( 0, index ) + '" is not a module' );
            }
        });
    }
};

var moduleLoader = function moduleLoader() {
    if ( arguments.length && arguments[ 0 ].target && arguments[ 0 ].target.src ) {
        var script = arguments[ 0 ].target;
        
        script.removeEventListener( 'load', moduleLoader.loadEventListener );
        script.removeEventListener( 'error', moduleLoader.errorEventListener );
    }
    if ( !this.length ) {
        // var Application = require( './web/Application' );
        // setTimeout( Application.run.bind( Application ), 0 );
        console.log( new Date() );
        var Application = require( './web/Application' );
        setTimeout( Application.run, 0 );
        return;
    }
    var module = this.shift();
    var script = document.createElement( 'script')
    script.async = false;
    script.src = module;
    script.addEventListener( 'load', moduleLoader.loadEventListener = moduleLoader.bind( this ) );
    script.addEventListener( 'error', moduleLoader.errorEventListener = function(event) {
        debugger;
    } );
    document.head.appendChild( script );
};

Object.getOwnPropertyNames( ressources ).forEach( function __forEachRessourceType( ressourceType ) {
    if ( ressourceType === 'js' ) {
        if ( debug ) {
            moduleLoader.call( ressources[ ressourceType ] );
        } else {
            moduleLoader.call( [ 'web/client/src/js/oneshot.js' ] );
        }
    } else if ( ressourceType === 'css' ) {
        ressources[ ressourceType ].forEach( function __forEachRessource ( virtualPath ) {
            var link = document.createElement( 'link' );
            link.rel = 'stylesheet';
            link.href = virtualPath;
            document.head.appendChild( link );
        });
    }
});

})( {
  "js": [
    "earth/common/animals.js",
    "utils/common/Class5.js",
    "earth/common/earth.js",
    "utils/common/Class6.js",
    "earth/common/plants.js",
    "earth/client/src/js/animals.js",
    "earth/client/src/js/thing.js",
    "utils/client/src/js/Class5.js",
    "utils/client/src/js/Class6.js",
    "web/client/src/js/Application.js",
    "web/client/lib/jquery/jquery-2.1.4.min.js",
    "web/client/lib/jquery/jquery-json2html.js",
    "web/client/lib/jquery/jquery-ui-1.11.4.min.js",
    "web/client/lib/bootstrap-3.3.5/bootstrap.min.js",
    "web/client/lib/bootstrap-3.3.5/npm.js"
  ],
  "css": [
    "web/client/src/css/style.css"
  ]
} );
