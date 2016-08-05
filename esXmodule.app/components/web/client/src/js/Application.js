"use strict";

var OldStyleClass = require( '../utils/common/Class' );

var instance = null;

var Application = module.exports = OldStyleClass( module, 'class Application', {
    __static_run: function run() {
        new Application();
    },
    constructor: function constructor() {
        if ( instance !== null ) {
            throw new TypeError( 'Only on Application allowed.' );
        }
        instance = this;

        console.log( new Date() );
        // var LivingThing = require( '../earth' ).LivingThing;
        var animals = require( '../earth/animals' );
        var MammalWidget = animals.MammalWidget;
        var Mammal5Widget = animals.Mammal5Widget;
        var InsectWidget = animals.InsectWidget;
        var plants = require( '../earth/common/plants_' );
        var Tree = plants.Tree;
        var Flower = plants.Flower;

        var mammal = new MammalWidget();
        var insect = new InsectWidget();
        var tree = new Tree();
        var flower = new Flower();
        var mammal5 = new Mammal5Widget();
        window.C = OldStyleClass;
        mammal.foo();
        mammal5.foo();
        window.jQuery = window.$ = require( './jquery/jquery-2.1.4' );
        require( './jquery/jquery-ui-1.11.4' );
        require( './bootstrap-3.3.5/bootstrap' );
        console.log( module.allModules.__main__ );

        var M1 = OldStyleClass( module, 'class M1', {
            m1: function m1() {
                console.log( 'm1' );
                return this;
            },
        });
        
        var M2 = OldStyleClass( module, 'class M2 extends', M1, {
            m2: function m2() {
                console.log( 'm2' );
                return this;
            },
        });

        var I = OldStyleClass( module, 'class I', {
            am: OldStyleClass.abstractMethod,
        });

        var B = OldStyleClass( module, I, M2, 'class B', {
            foo: function foo() {
                console.log( 'foo' );
                return this;
            },
        });

        var C1 = OldStyleClass( module, 'class C1 extends', B, {
        });

        var C2 = OldStyleClass( module, 'class C2 extends', B, {
            foo: B.prototype.foo,
            am: function am() {},
        });

        B.prototype.foo = function foo() {
            console.log( 'bar' );
            return this;
        };

        new C1().foo().m2().m1().foo();
        new C2().foo().m2().m1().foo();
    },
});
