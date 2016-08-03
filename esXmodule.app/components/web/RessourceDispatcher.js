"use strict";

var Class = require( '../utils/Class6' );

var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require('mkdirp' );
var walk = require( 'walk' );
var extend = require( 'util' )._extend;

var CACHE_DIR = path.join( __dirname, '../../.cache' );
var COMPONENTS_DIR = path.join( __dirname, '..' );
var USE_RAW_REGEXP = /^["']use raw['"];\s*/;
var SRC_LOCATION = 'client/src';
var LIB_LOCATION = 'client/lib';
var SHARE_LOCATION = 'common';
var BOOT_MODULE = [ 'web', SRC_LOCATION, 'js', 'boot.js'].join( '/' );

var LOCATION_REGEXP = new RegExp(
        '^\/+((.*?)\\/(?:' + [
            '(' + SRC_LOCATION + ')/.*?',
            '(' + LIB_LOCATION + ')',
            '(' + SHARE_LOCATION + ')',
        ].join( '|' ).replace( /\//g, '\\/') +
         ')\/(.*?)(?:\\.(\\w+))?)$' );

function splitPath( params ) {
    typeof params === 'string' && ( params = ( params.match( LOCATION_REGEXP ) || [ null ] ).slice( 1 ) );
    return {
        rawPath:       path.join( COMPONENTS_DIR, params[ 0 ] ),
        relativePath:  params[ 0 ],
        cachedPath:    path.join( CACHE_DIR, params[ 0 ] ),
        virtualPath:   params[ 1 ] + '/' + ( params[ 4 ] ? params[ 4 ] + '/' : '' ) + params[ 5 ],
        isSrc:         !!params[ 2 ],
        isLib:         !!params[ 3 ],
        isShared:      !!params[ 4 ],
        ressourceType: params[ 6 ] || '',
    };
}

var RessourceDispatcher = module.exports = Class( module, class RessourceDispatcher {
    static __class_init() {
        this.routerRegExp = LOCATION_REGEXP;
    }

    static handleRequest( req, res, next ) {
        var context = extend( { req: req, res: res }, splitPath( req.params ) );

        if ( context.ressourceType === 'js' ) {
            if ( context.relativePath === 'web/client/src/js/oneshot.js' ) {
                res.sendFile( path.join( CACHE_DIR, 'oneshot.js' ) );
            } else {
                RessourceDispatcher._ensureCache( context, ensureCache_callback.bind( context ) );
            }
        } else if ( context.ressourceType === 'css' ) {
            res.sendFile( context.rawPath );
        } else {
            res.status( 403 ).send( 'Forbidden' );
        }

        function ensureCache_callback( err ) {
            if ( err ) {
                context.res.status( 500 ).send( 'Internal Server Error' );
            } else {
                context.res.sendFile( context.cachedPath );
            }
        }
    }

    static _ensureCache( context, callback ) {

        fs.stat( context.rawPath, statOnRawJsFile_callback );

        function statOnRawJsFile_callback( err, stats ) {
            context.rawFileStats = stats;

            if ( err ) {
                callback( err );
            } else {
                fs.stat( context.cachedPath, statOnCachedJsFile_callback );
            }
        }

        function statOnCachedJsFile_callback( err, stats ) {
            context.cachedFileStats = stats;
            if ( err ) {
                if ( err.code === 'ENOENT' ) {
                    mkdirp( path.dirname( context.cachedPath ), mkCacheDir_callback );
                } else {
                    callback( err );
                }
            /**/
            } else if ( context.rawFileStats.mtime > stats.mtime ) {
                writeJsFileToCache( callback );
            } else {
                callback();
                // context.res.sendFile( context.cachedPath );
            /*/
            } else {
                writeJsFileToCache( context, callback);
            /**/
            }
        }

        function mkCacheDir_callback( err ) {
            if ( err ) {
                callback( err );
            } else {
                writeJsFileToCache();
            }
        }

        function writeJsFileToCache() {
            if ( context.relativePath === BOOT_MODULE ) {
                if ( context.ressources === undefined ) {
                    RessourceDispatcher._buildRessourceTree( context, writeJsFileToCache );
                    return;
                } else {
                    var dict = {};
                    for ( var type in context.ressources ) {
                        if ( type === '__boot__') {
                            continue;
                        }
                        var list = dict[ type ] = [];
                        for ( var relativePath in context.ressources[ type ] ) {
                            list.push( context.ressources[ type ][ relativePath ].relativePath );
                        }
                    }

                    var module_args = { ressources: dict };
                    context.moduleArguments = module_args;
                }
            }
            var isRawFile = false;
            var content = fs.readFileSync( context.rawPath, 'utf8' ).replace( USE_RAW_REGEXP, ()=>( isRawFile = true, '' ) );
            var scopeName = '$__module__' + context.virtualPath.replace( /[^$\w\d]/g, '_' ) + '__';
            var head, foot;
            var moduleName = context.isLib ? context.virtualPath.replace( /\.min$/, '' ) : context.virtualPath;

            if ( context.ressourceType === 'js' ) {
                if ( isRawFile ) {
                    var moduleArguments = context.moduleArguments || {};
                    var moduleArgumentNames = Object.getOwnPropertyNames( moduleArguments );

                    head = '( function ' + scopeName + '( ' + moduleArgumentNames.join( ', ') + ' ) {';
                    foot = '})( ' + moduleArgumentNames.map( (name)=>( JSON.stringify( moduleArguments[ name ], null, '  ' ) ) ).join( ', ' ) + ' );';
                } else {
                    head = 'WebClient.define( "' + moduleName + '", '
                        + 'function ' + scopeName + '( exports, require, module ) {';
                    foot = '});';
                }
            } else {
                head = '';
                foot = '';
            }

            content = [
                '/* ' + ( context.virtualPath + '.' + context.ressourceType + ' ' + '*'.repeat( 72 ) ).slice( 0, 74 )
                + '*' + '/',
                head, content, foot, '', ].join( '\n' );

            fs.createWriteStream( context.cachedPath )
            .on( 'error', callback )
            .on( 'finish', callback )
            .end( content );
        }
    }

    static _buildRessourceTree( context, callback ) {
        context.maxMtimes = {};
        context.ressources = {};
        context.pendingOperations |= 0;


        fs.readdir( COMPONENTS_DIR, readComponentsDir_callback );

        function readComponentsDir_callback( err, files ) {
            if ( err ) {
                throw err;
            } else {
                context.pendingOperations += files.length;
                files.forEach( function __forEachComponent( name ){
                    var componentContext = { componentName: name };
                    fs.stat( path.join( COMPONENTS_DIR, name ),
                             statComponent_callback.bind( componentContext ) );
                });
            }
        }

        function statComponent_callback( err, stats ) {
            var componentContext = this;
            context.pendingOperations--;
            var componentPath = path.join( COMPONENTS_DIR, componentContext.componentName );
            var srcPath = path.join( componentPath, SRC_LOCATION );
            var libPath = path.join( componentPath, LIB_LOCATION );
            var sharePath = path.join( componentPath, SHARE_LOCATION );

            if ( err ) {
                // TODO: ???
            } else if ( stats.isDirectory() ) {
                [ { type: 'src',    path: srcPath },
                  { type: 'lib',    path: libPath },
                  { type: 'common', path: sharePath } ].forEach( function __forEachComponentFragment( fragmentContext ) {
                    context.pendingOperations++;
                    fragmentContext.componentContext = componentContext;

                    fs.stat( fragmentContext.path, statComponentFragment_callback.bind( fragmentContext ) );
                });
            }
        }

        function statComponentFragment_callback( err, stats ) {
            var fragmentContext = this;
            context.pendingOperations--;
            if ( err ) {
                // TODO: ???
            } else {
                context.pendingOperations++;
                walk.walk( fragmentContext.path )
                .on( 'file', walkComponentFragmentOnFile_callback.bind( fragmentContext ) )
                .on( 'end', walkComponentFragmentOnEnd_callback.bind( fragmentContext ) );
            }
        }

        function walkComponentFragmentOnFile_callback( root, fileStats, next ) {
            var fragmentContext = this;
            var absolutePath = path.join( root, fileStats.name );
            var relativePath = absolutePath.slice( COMPONENTS_DIR.length );
            ( path.sep == '/' ) || ( relativePath = relativePath.split( path.sep ).join( '/' ) );
            var ressource = splitPath( relativePath );
            var ressourceType = ressource.ressourceType;
            var ressources = context.ressources;
            var maxMtimes = context.maxMtimes;

            // TODO: think about how to ex- or include ressources
            if ( !/\/-/.test( relativePath ) ) {
                if ( ressource.isSrc || ressourceType === 'js' ) {

                    var dict = ( ressources[ ressourceType ] || ( ressources[ ressourceType ] = {} ) );
                    dict[ ressource.relativePath ] = extend( ressource, { rawFileStats: fileStats, mtime: fileStats.mtime } );

                    if ( maxMtimes[ ressourceType ] === undefined || fileStats.mtime > maxMtimes[ ressourceType ] ) {
                        maxMtimes[ ressourceType ] = fileStats.mtime;
                    }
                }
            }
            next();
        }

        function walkComponentFragmentOnEnd_callback() {
            if ( --context.pendingOperations ) {
                return;
            }

            context.ressources.__boot__ = context.ressources[ 'js' ][ BOOT_MODULE ];
            delete context.ressources[ 'js' ][ BOOT_MODULE ];

            callback( null );
        }
    }

    static joinRessourcesToCache( callback ) {
        var context = {
            pendingOperations: 0,
        }

        RessourceDispatcher._buildRessourceTree( context, buildRessourceTree_callback );

        function buildRessourceTree_callback( err ) {
            context.ressources.__boot__.ressources = context.ressources;
            RessourceDispatcher._ensureCache( context.ressources.__boot__, ensureCacheBoot_callback );
        }

        function ensureCacheBoot_callback( err ) {
            if ( err ) {
                throw err;
            }
            for ( var ressourceType in context.ressources ) {
                var ressourceTypeContext = {
                    type: ressourceType,
                    joinPath: path.join( CACHE_DIR, 'oneshot.' + ressourceType ),
                    };
                context.pendingOperations++;
                fs.stat( ressourceTypeContext.joinPath, statComponentFragmentJoin_callback.bind( ressourceTypeContext ) );
            }
        }

        function statComponentFragmentJoin_callback( err, stats ) {
            var ressourceTypeContext = this;
            context.pendingOperations--;
            if ( err ) {
                if ( err.code == 'ENOENT' ) {
                    stats = { mtime: 0 };
                } else {
                    throw err;
                }
            }
            if ( context.maxMtimes[ ressourceTypeContext.type ] >= stats.mtime ) {
                var ressources = context.ressources[ ressourceTypeContext.type ];
                context.pendingOperations++;
                ressourceTypeContext.waitingRessources = Object.getOwnPropertyNames( ressources ).length;
                // TODO: think about number of event listeners
                ressourceTypeContext.writeStream = fs.createWriteStream( ressourceTypeContext.joinPath + '_' ).setMaxListeners(
                     [ 'finish', 'unpipe', 'drain', 'close', ].length * ressourceTypeContext.waitingRessources );
                for ( var virtualPath in ressources ) {
                    var ressourceContext = ressources[ virtualPath ];
                    ressourceContext.joinContext = ressourceTypeContext;
                    RessourceDispatcher._ensureCache( ressourceContext, ensureCache_callback.bind( ressourceContext ) );
                };
            }
        }

        function ensureCache_callback( err ) {
            var ressourceContext = this;
            if ( err ) {
                throw err;
            } else {
                var readStream = fs.createReadStream( ressourceContext.cachedPath );
                readStream.on( 'end', writeComponentFragmentJoin_callback.bind( ressourceContext.joinContext ) );
                readStream.pipe( ressourceContext.joinContext.writeStream, { end: false } );
            }
        }

        function writeComponentFragmentJoin_callback( err ) {
            var ressourceTypeContext = this;
            --ressourceTypeContext.waitingRessources || --context.pendingOperations;
            if ( err ) {
                // TODO: ???
                throw err;
            }
            if ( ressourceTypeContext.waitingRessources ) {
                return;
            }
            context.pendingOperations++;
            ressourceTypeContext.writeStream.close();
            fs.rename( ressourceTypeContext.joinPath + '_',
                       ressourceTypeContext.joinPath,
                       renameComponentFragmentJoin_callback.bind( ressourceTypeContext ) );
        }

        function renameComponentFragmentJoin_callback( err ) {
            var ressourceTypeContext = this;
            context.pendingOperations--;
            if ( err ) {
                throw err;
            }
            if ( context.pendingOperations ) {
                return;
            }
        }
    }
});
