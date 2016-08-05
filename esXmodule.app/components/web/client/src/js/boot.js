"use plain";
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
    this.loaded = false;
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
    if ( !module.loaded ) {
        module.loaded = true;
        module.compiledCode.call( module.exports, module.exports, module._require, module );
        var exports = module.exports;
        if ( exports !== undefined && exports !== null && exports.__module__ === undefined ) {
            Object.defineProperties( exports, {
                __module__: { value: module, configurable: false, enumerable: false, writable: false },
            });
        }
        module.parent = this;
    }
    module in this.children || this.children.push( module );
    return module.exports;
};

var WebClient = window[ globalWebClientVariableName ] = new Module( '__main__', null );
var require = WebClient._require;

WebClient.define = function define( moduleName, moduleCode ) {
    var module, exports;
    module = WebClient;
    // TODO: Do we need this if-clause?
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

( function loadRessources() {
    var pendingLoadings = 0;
    var failedLoadings = [];

    function loadRessourceOnEvent( event ) {
        var target = event.target;
        target.removeEventListener( 'error', loadRessourceOnEvent );
        target.removeEventListener( 'load', loadRessourceOnEvent );
        pendingLoadings--;
        if ( event.type === 'error' ) {
            failedLoadings.push( event );
        }
        if ( pendingLoadings ) {
            return;
        }
        if ( failedLoadings.length > 0 ) {
            debugger;
        } else {
            console.log( new Date() );
            var Application = require( './web/Application' );
            setTimeout( Application.run, 0 );
        }
    }

    var createTarget = {
        js: function createTarget_js( src ) {
            var script = document.createElement( 'script')
            script.src = src;
            return script;
        },
        css: function createTarget_css( href ) {
            var link = document.createElement( 'link' );
            link.rel = 'stylesheet';
            link.href = href;
            return link
        },
    }

    if ( !debug ) {
        ressources = {
            js:  [ 'web/client/oneshot/oneshot.js' ],
            css: [ 'web/client/oneshot/oneshot.css' ],
        }
    }

    Object.getOwnPropertyNames( ressources ).forEach( function __forEachRessourceType( ressourceType ) {
        pendingLoadings += ressources[ ressourceType ].length;
        ressources[ ressourceType ].forEach( function __forEachRessource( virtualPath ) {
            var target = createTarget[ ressourceType ]( virtualPath );
            target.addEventListener( 'error', loadRessourceOnEvent );
            target.addEventListener( 'load', loadRessourceOnEvent );
            document.head.appendChild( target );
        });
    });
})();
