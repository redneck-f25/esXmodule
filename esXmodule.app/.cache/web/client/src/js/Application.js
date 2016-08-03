/* web/Application.js ********************************************************/
WebClient.define( "web/Application", function $__module__web_Application__( exports, require, module ) {
"use strict";

var Class = require( '../utils/Class5' );
// var LivingThing = require( '../earth' ).LivingThing;
var animals = require( '../earth/animals' );
var MammalWidget = animals.MammalWidget;
var InsectWidget = animals.InsectWidget;
var plants = require( '../earth/common/plants' );
var Tree = plants.Tree;
var Flower = plants.Flower;

var instance = null;

var Application = module.exports = Class( module, 'class Application', {
    // static __class_init() {
    //     Application.instance = new Application();
    // }
    __static_run: function run() {
        new Application();
    },
    constructor: function Application() {
        if ( instance !== null ) {
            throw new TypeError( 'Only on Application allowed.' );
        }
        instance = this;
        var mammal = new MammalWidget();
        var insect = new InsectWidget();
        var tree = new Tree();
        var flower = new Flower();
        var mammal5 = new animals.Mammal5Widget();
        mammal.foo();
        mammal5.foo();
        window.jQuery = window.$ = require( './jquery/jquery-2.1.4' );
        require( './jquery/jquery-ui-1.11.4' );
        require( './bootstrap-3.3.5/bootstrap' );
        console.log( new Date() );
    },
});

});
