/* earth/common/plants.js ****************************************************/
WebClient.define( "earth/common/plants", function $__module__earth_common_plants__( exports, require, module ) {
"use strict";

var Class = require( '../../utils/Class6' );
var Class5 = require( '../../utils/Class5' );

var LivingThing = require( './earth' ).LivingThing;
var LivingThing5 = require( './earth' ).LivingThing5;

var Plant = this.Plant = Class( module, class Plant extends LivingThing {
    constructor() {
        super();
    }
});

var Plant5 = this.Plant5 = Class5( module, 'class Plant5 extends', LivingThing5, {
    constructor: function Plant5() {
        this._super();
    }
});

var Tree = this.Tree = Class( module, class Tree extends Plant {
    constructor() {
        super();
    }
});

var Tree5 = this.Tree5 = Class5( module, 'class Tree5 extends', Plant5, {
    constructor: function Tree5() {
        this._super();
    }
});

var Flower = this.Flower = Class( module, class Flower extends Plant {
    constructor() {
        super();
    }
});

var Flower5 = this.Flower5 = Class5( module, 'class Flower5 extends', Plant5, {
    constructor: function Flower5() {
        this._super();
    }
});

});
