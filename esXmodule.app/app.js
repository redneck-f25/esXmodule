var path = require( 'path' );
var debug = require( 'debug' )( 'esXmodule.app:server' );
var logger = require( 'morgan' );
var express = require( 'express' );

var RessourceDispatcher = require( './components/web/RessourceDispatcher' );

var app = express();
var router = express.Router();

// var Mammal = require( './components/earth/animals' ).MammalDB;
// var Mammal5 = require( './components/earth/animals' ).Mammal5DB;

// var mammal = new Mammal();
// var mammal5 = new Mammal5();
// mammal.foo();
// mammal5.foo();

app.use( logger( 'dev' ));

router.get( '/', function( req, res, next ) {
    res.sendFile( path.join( __dirname, 'components/web/client/index.html' ) );
});

router.get( RessourceDispatcher.routerRegExp, RessourceDispatcher.handleRequest );

app.use( '/', router );

RessourceDispatcher.makeOneshotRessources( makeOneshotRessources_callback );

function makeOneshotRessources_callback( err ) {
    if ( err ) {
        throw err;
    }

    app.listen( 3000 )
    .on( 'error', function onError( error ) {
        if ( error.syscall !== 'listen' ) {
            throw error;
        }

        var bind = typeof port === 'string'
            ? 'Pipe ' + port
            : 'Port ' + port;

        // handle specific listen errors with friendly messages
        switch ( error.code ) {
            case 'EACCES':
                console.error( bind + ' requires elevated privileges' );
                process.exit( 1 );
                break;
            case 'EADDRINUSE':
                console.error( bind + ' is already in use' );
                process.exit( 1 );
                break;
            default:
                throw error;
        }
    })
    .on( 'listening', function onListening() {
        var addr = this.address();
        var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
        debug( 'Listening on ' + bind );
    });
}
