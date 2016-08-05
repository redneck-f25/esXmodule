"use strict";

var Class = require( '../utils/common/ClassV6' );

var process = require( 'process' );
var fs = require( 'fs' );
var path = require( 'path' );
var mkdirp = require('mkdirp' );
var walk = require( 'walk' );
var extend = require( 'util' )._extend;

var CACHE_DIR = path.join( __dirname, '../../../.cache' );
var COMPONENTS_DIR = path.join( __dirname, '..' );
var USE_PLAIN_REGEXP = /^["']use plain['"];\s*/;

var GLOBAL_WEBCLIENT_VARIABLE_NAME = 'WebClient';
var SRC_LOCATION = 'client/src';
var LIB_LOCATION = 'client/lib';
var COMMON_LOCATION = 'common';
var ONESHOT_LOCATION = 'oneshot';
var BOOT_MODULE = [ 'web', SRC_LOCATION, 'js', 'boot.js' ].join( '/' );

var WALK_FILTER_REGEXP = new RegExp( ( ( source )=>( source.replace( /[/\\]/g, '\\\\' ) ) )( [
    '^' + COMPONENTS_DIR,
    '(?:' + path.sep + '.*)?',
    path.sep + '-',
    ].join( '' ) ) );

var LOCATION_REGEXP = new RegExp(
    '^/+((.*?)/(?:'                    // 0, 1
    + [
        '(' + SRC_LOCATION + ')/.*?',  // 2
        '(' + LIB_LOCATION + ')',      // 3
        '(' + COMMON_LOCATION + ')',   // 4
        '(' + ONESHOT_LOCATION + ')',  // 5
        ].join( '|' )
    + ')/(.*?)(?:\\.(\\w+))?)$' );     // 6, 7

function splitPath( params ) {
    typeof params === 'string' && ( params = ( params.match( LOCATION_REGEXP ) || [ null ] ).slice( 1 ) );
    return {
        rawPath:       path.join( COMPONENTS_DIR, params[ 0 ] ),
        relativePath:  params[ 0 ],
        cachePath:     path.join( CACHE_DIR, params[ 0 ] ),
        virtualPath:   params[ 1 ] + '/' + ( params[ 4 ] ? params[ 4 ] + '/' : '' ) + params[ 6 ],
        isSrc:         !!params[ 2 ],
        isLib:         !!params[ 3 ],
        isCommon:      !!params[ 4 ],
        isOneshot:     !!params[ 5 ],
        ressourceType: params[ 7 ] || '',
    };
}

var RessourceDispatcher = module.exports = Class( module, class RessourceDispatcher {

    static __class_init() {
        this.plainJsModuleArgumentsGetter = {
            [ BOOT_MODULE ]: function ( ressource ) {
                var ressources = {};
                for ( var type in ressource.ressources ) {
                    if ( type === '__boot__' ) {
                        continue;
                    }
                    ressources[ type ] = Object.getOwnPropertyNames( ressource.ressources[ type ] ).filter( function __filterMinifiedRessources( relativePath ) {
                        var reversePathSplit = relativePath.split( '.' ).reverse();
                        if ( reversePathSplit.length >= 3 && reversePathSplit[ 1 ] === 'min') {
                            var maxPath = reversePathSplit.slice( 2 ).reverse().concat( reversePathSplit[ 0 ] ).join( '.' );
                            if ( ressource.ressources[ type ][ maxPath ] ) {
                                return false;
                            }
                        }
                        return true;
                    } ).sort();
                }
                return {
                    globalWebClientVariableName: GLOBAL_WEBCLIENT_VARIABLE_NAME,
                    ressources,
                    };
            }
        };
    }

    static get routerRegExp() {
        return LOCATION_REGEXP;
    }

    static handleRequest( req, res, next ) {
        var ressource = splitPath( req.params );

        if ( ressource.isOneshot ) {
            ressource.cachePath = ressource.cachePath.replace( path.join( CACHE_DIR, 'web', 'client', 'oneshot' ), CACHE_DIR );
            res.sendFile( ressource.cachePath );
        } else if ( ressource.ressourceType === 'js' ) {
            RessourceDispatcher._ensureCache( ressource, ensureCache_callback );
        } else if ( ressource.ressourceType === 'css' ) {
            res.sendFile( ressource.rawPath );
        } else {
            res.status( 403 ).send( 'Forbidden' );
        }

        function ensureCache_callback( err ) {
            if ( err ) {
                res.status( 500 ).send( 'Internal Server Error' );
            } else {
                res.sendFile( ressource.cachePath );
            }
        }
    }

    static _ensureCache( ressource, callback ) {

        if ( ressource.cacheStats ) {
            process.nextTick( statOnCacheJsFile_callback, null, ressource.cacheStats );
        } else if ( ressource.rawStats ) {
            fs.stat( ressource.cachePath, statOnCacheJsFile_callback );
        } else {
            fs.stat( ressource.rawPath, statOnRawJsFile_callback );
        }
        
        function statOnRawJsFile_callback( err, stats ) {
            ressource.rawStats = stats;

            if ( err ) {
                callback( err );
            } else {
                fs.stat( ressource.cachePath, statOnCacheJsFile_callback );
            }
        }

        function statOnCacheJsFile_callback( err, stats ) {
            ressource.cacheStats = stats;
            if ( err ) {
                if ( err.code === 'ENOENT' ) {
                    mkdirp( path.dirname( ressource.cachePath ), mkCacheDir_callback );
                } else {
                    callback( err );
                }
            } else if ( 'debug' === '' || ressource.rawStats.mtime > stats.mtime ) {
                writeJsFileToCache();
            } else {
                process.nextTick( callback );
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
            if ( ressource.relativePath === BOOT_MODULE ) {
                if ( ressource.ressources === undefined ) {
                    RessourceDispatcher._buildRessourceTree( function buildRessourceTree_callback( err, ressources, maxMtimes ) {
                        if ( err ) {
                            return callback( err );
                        }
                        
                        ( ressources.__boot__ = ressource ).ressources = ressources;
                        delete ressources[ 'js' ][ BOOT_MODULE ];

                        writeJsFileToCache();
                    });
                    return;
                }
            }
            var isPlainFile = false;
            var content = fs.readFileSync( ressource.rawPath, 'utf8' ).replace( USE_PLAIN_REGEXP, ()=>( isPlainFile = true, '' ) );
            var scopeName = '__module__' + ressource.virtualPath.replace( /[^$\w\d]/g, '_' ) + '__';
            var head, foot;
            var moduleName = ressource.isLib ? ressource.virtualPath.replace( /\.min$/, '' ) : ressource.virtualPath;

            if ( ressource.ressourceType === 'js' ) {
                if ( isPlainFile ) {
                    var moduleArguments = RessourceDispatcher._getPlainJsModuleArguments( ressource );
                    var moduleArgumentNames = Object.getOwnPropertyNames( moduleArguments );

                    head = [];
                    head.push( '( function ' + scopeName + '(' );
                    moduleArgumentNames.length && head.push( ' ' + moduleArgumentNames.join( ', ') + ' ' );
                    head.push( '){');
                    head = head.join( '' );

                    foot = [];
                    foot.push( '})(' );
                    moduleArgumentNames.length && foot.push( ' ' + moduleArgumentNames.map( ( name )=>( JSON.stringify( moduleArguments[ name ], null, '  ' ) ) ).join( ', ' ) + ' ' );
                    foot.push( ');' );
                    foot = foot.join( '' );
                } else {
                    head = GLOBAL_WEBCLIENT_VARIABLE_NAME + '.define( "' + moduleName + '", '
                        + 'function ' + scopeName + '( exports, require, module ) {';
                    foot = '});';
                }
            } else {
                head = '';
                foot = '';
            }

            content = [ head, content, foot, '', ].join( '\n' );

            fs.createWriteStream( ressource.cachePath )
            .on( 'error', callback )
            .on( 'finish', callback )
            .end( content );
        }
    }

    static _buildRessourceTree( callback ) {
        var maxMtimes = {};
        var ressources = {};
        var pendingOperations = 0;

        fs.readdir( COMPONENTS_DIR, readComponentsDir_callback );

        function readComponentsDir_callback( err, files ) {
            if ( err ) {
                return callback( err );
            }

            pendingOperations += files.length;
            files.forEach( function __forEachComponent( name ){
                if ( name.charAt( 0 ) === '-' ) {
                    --pendingOperations;
                    return;
                }
                fs.stat( path.join( COMPONENTS_DIR, name ),
                         statComponent_callback.bind( { componentName: name } ) );
            });
        }

        function statComponent_callback( err, stats ) {
            var componentContext = this;
            --pendingOperations;

            if ( err ) {
                return callback( err );
            }
            if ( !stats.isDirectory() ) {
                return;
            }
            var componentPath = path.join( COMPONENTS_DIR, componentContext.componentName );
            var fragments = [
                { type: 'src',    path: path.join( componentPath, SRC_LOCATION ) },
                { type: 'lib',    path: path.join( componentPath, LIB_LOCATION ) },
                { type: 'common', path: path.join( componentPath, COMMON_LOCATION ) },
                ]; 

            pendingOperations += fragments.length;
            fragments.forEach( function __forEachComponentFragment( fragmentContext ) {
                fragmentContext.componentContext = componentContext;

                fs.stat( fragmentContext.path, statComponentFragment_callback.bind( fragmentContext ) );
            });
        }

        function statComponentFragment_callback( err, stats ) {
            var fragmentContext = this;
            --pendingOperations;

            if ( err ) {
                if ( err.code === 'ENOENT' ) {
                    return;
                }
                return callback( err );
            }
            ++pendingOperations;
            walk.walk( fragmentContext.path, { filters: [ WALK_FILTER_REGEXP ] } )
            .on( 'file', walkComponentFragmentOnFile_callback.bind( fragmentContext ) )
            .on( 'end', walkComponentFragmentOnEnd_callback.bind( fragmentContext ) );
        }

        function walkComponentFragmentOnFile_callback( root, fileStats, next ) {
            var fragmentContext = this;
            var absolutePath = path.join( root, fileStats.name );
            var ressource = splitPath( ( ( p )=>( path.sep !== '/' ? p.split( path.sep ).join( '/' ) : p ) )( absolutePath.slice( COMPONENTS_DIR.length ) ) );
            var ressourceType = ressource.ressourceType;

            if ( fileStats.name.charAt( 0 ) === '-' ) {
                return next();
            }

            if ( ressourceType === 'js' || ressourceType === 'css' ) {
                ressource.rawStats = fileStats;
                ( ressources[ ressourceType ] || ( ressources[ ressourceType ] = {} ) )[ ressource.relativePath ] = ressource;

                if ( maxMtimes[ ressourceType ] === undefined || fileStats.mtime > maxMtimes[ ressourceType ] ) {
                    maxMtimes[ ressourceType ] = fileStats.mtime;
                }
            }
            next();
        }

        function walkComponentFragmentOnEnd_callback() {
            if ( --pendingOperations ) {
                return;
            }
            process.nextTick( callback, null, ressources, maxMtimes );
        }
    }

    static _getPlainJsModuleArguments( ressource ) {
        var getter = RessourceDispatcher.plainJsModuleArgumentsGetter[ ressource.relativePath ];
        return getter ? getter( ressource ) : {};
    }

    static makeOneshotRessources( callback ) {
        var pendingOperations = 0;
        var ressources;
        var maxMtimes;
        var writeStreams = {};

        RessourceDispatcher._buildRessourceTree( buildRessourceTree_callback );

        function buildRessourceTree_callback( err, ressources_, maxMtimes_ ) {
            if ( err ) {
                return callback( err );
            }
            ressources = ressources_;
            maxMtimes = maxMtimes_;
            
            ( ressources.__boot__ = ressources[ 'js' ][ BOOT_MODULE ] ).ressources = ressources;
            delete ressources[ 'js' ][ BOOT_MODULE ];

            RessourceDispatcher._ensureCache( ressources.__boot__, ensureCacheBoot_callback );
        }

        function ensureCacheBoot_callback( err ) {
            if ( err ) {
                return callback( err );
            }
            delete ressources.__boot__;
            for ( var ressourceType in ressources ) {
                var nextContext = {
                    type: ressourceType,
                    oneshotPath: path.join( CACHE_DIR, 'oneshot.' + ressourceType ),
                    };
                ++pendingOperations;
                fs.stat( nextContext.oneshotPath, statOneshot_callback.bind( nextContext ) );
            }
        }

        function statOneshot_callback( err, stats ) {
            var context = this;
            --pendingOperations;
            if ( err ) {
                if ( err.code == 'ENOENT' ) {
                    stats = { mtime: 0 };
                } else {
                    return callback( err );
                }
            }
            if ( maxMtimes[ context.type ] >= stats.mtime ) {
                var typeRessources = ressources[ context.type ];
                pendingOperations += Object.getOwnPropertyNames( typeRessources ).length;
                writeStreams[ context.type ] = fs.createWriteStream( context.oneshotPath + '_' );
                for ( var relativePath in typeRessources ) {
                    // filter maximized ressources
                    var reversePathSplit = relativePath.split( '.' ).reverse();
                    if ( reversePathSplit.length >= 3 && reversePathSplit[ 1 ] !== 'min') {
                        var minPath = reversePathSplit.slice( 1 ).reverse().concat( 'min', reversePathSplit[ 0 ] ).join( '.' );
                        if ( typeRessources[ minPath ] ) {
                            process.nextTick( writeOneshot_callback );
                            continue;
                        }
                    }
                    var ressource = typeRessources[ relativePath ];
                    if ( context.type === 'js' ) {
                        RessourceDispatcher._ensureCache( ressource, ensureCache_callback.bind( ressource ) );
                    } else {
                        ressource.cachePath = ressource.rawPath;
                        ensureCache_callback.call( ressource );
                    }
                };
            } else {
                ++pendingOperations;
                process.nextTick( renameOneshot_callback );
            }
        }

        function ensureCache_callback( err ) {
            var ressource = this;
            if ( err ) {
                return callback( err );
            }
            var content = fs.readFileSync( ressource.cachePath, 'utf8' );
            content = content.replace( /^\s+/gm, '' );
            content = [
                '/* ' + ( ressource.virtualPath + '.' + ressource.ressourceType + ' ' + '*'.repeat( 72 ) ).slice( 0, 74 )
                + '*' + '/',
                content,
                ''
                ].join( '\n' );
            writeStreams[ ressource.ressourceType ].write( content, 'utf8', writeOneshot_callback );
        }

        function writeOneshot_callback( err ) {
            --pendingOperations;
            if ( err ) {
                return callback( err );
            }
            if ( pendingOperations ) {
                return;
            }
            for ( var ressourceType in writeStreams ) {
                ++pendingOperations;
                var writeStream = writeStreams[ ressourceType ];
                writeStream.close();
                fs.rename( writeStream.path,
                           writeStream.path.slice( 0, -1 ),
                           renameOneshot_callback );
            }
        }

        function renameOneshot_callback( err ) {
            --pendingOperations;
            if ( err ) {
                return callback( err );
            }
            if ( pendingOperations ) {
                return;
            }
            process.nextTick( callback );
        }
    }
});
