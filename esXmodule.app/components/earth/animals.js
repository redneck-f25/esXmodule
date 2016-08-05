 "use strict";

var animals = require( './common/animals_' );

var Class = require( '../utils/common/ClassV6' );
var OldStyleClass = require( '../utils/common/Class' );

var MammalDB = this.MammalDB = Class( module, class MammalDB extends animals.Mammal {
    constructor() {
        super();
    }
    foo() {
        this.bar( 'foobar', 'foobaz' );
        super.bar( 'foobar', 'foobaz' );
    }
    bar( msg ) {
        super.bar( msg );
    }
});

var Mammal5DB = this.Mammal5DB = OldStyleClass( module, 'class Mammal5DB extends', animals.Mammal5, {
    constructor: function Mammal5DB() {
        this._super();
    },
    foo: function foo() {
        this.bar( 'foobar', 'foobaz' );
        this._super( 'bar', [ 'foobar', 'foobaz' ] );
    },
    bar: function bar( msg ) {
        this._super( 'bar', [ msg ] );
    },
});

var InsectDB = this.InsectDB = Class( module, class InsectDB extends animals.Insect {
    constructor() {
        super();
    }
});
