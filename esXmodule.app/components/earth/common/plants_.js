"use strict";

var Class = require( '../../utils/common/ClassV6' );
var OldStyleClass = require( '../../utils/common/Class' );

var LivingThing = require( './earth_' ).LivingThing;
var LivingThing5 = require( './earth_' ).LivingThing5;

var Plant = this.Plant = Class( module, class Plant extends LivingThing {
    constructor() {
        super();
    }
});

var Plant5 = this.Plant5 = OldStyleClass( module, 'class Plant5 extends', LivingThing5, {
    constructor: function constructor() {
        this._super();
    }
});

var Tree = this.Tree = Class( module, class Tree extends Plant {
    constructor() {
        super();
    }
});

var Tree5 = this.Tree5 = OldStyleClass( module, 'class Tree5 extends', Plant5, {
    constructor: function constructor() {
        this._super();
    }
});

var Flower = this.Flower = Class( module, class Flower extends Plant {
    constructor() {
        super();
    }
});

var Flower5 = this.Flower5 = OldStyleClass( module, 'class Flower5 extends', Plant5, {
    constructor: function constructor() {
        this._super();
    }
});
