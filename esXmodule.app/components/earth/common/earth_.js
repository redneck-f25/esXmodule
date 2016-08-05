"use strict";

var Class = require( '../../utils/common/ClassV6' );
var OldStyleClass = require( '../../utils/common/Class' );

var Thing = require( '../thing' ).Thing;
var Thing5 = require( '../thing' ).Thing5;

var LivingThing = this.LivingThing = Class( module, class LivingThing extends Thing {
    constructor() {
        super();
    }
});

var LivingThing5 = this.LivingThing5 = OldStyleClass( module, 'class LivingThing5 extends', Thing5, {
    constructor: function constructor() {
        this._super();
    }
});
