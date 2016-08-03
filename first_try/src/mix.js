( function( instance ) {
"use strict";
var Module5 = new instance.ecmascript.v5.Module( 'mix' );
var Module6 = new instance.ecmascript.v6.Module( 'mix' );

var MixBase5 = Module5.Class( 'class MixBase5', {
    constructor: function( hint ) {
        instance.log( '[' + hint + '] MixBase5::constructor() for ' + this.__class__.name );
    },
    __static_classMethod: function( hint ) {
        instance.log( '[' + hint + '] static MixBase5::classMethod() for ' + this.name );
    },
    doit: function( hint ) {
        instance.log( '[' + hint + '] MixBase5::doit() for ' + this.__class__.name );
        return this;
    },
});

var MixBase6 = Module6.Class( class MixBase6 {
    constructor( hint ) {
        instance.log( '[' + hint + '] MixBase6::constructor() for ' + this.__class__.name );
    }
    static classMethod( hint ) {
        instance.log( '[' + hint + '] static MixBase6::classMethod() for ' + this.name );
    }
    doit( hint ) {
        instance.log( '[' + hint + '] MixBase6::doit() for ' + this.__class__.name );
        return this;
    }
});

var DictMixin = {
    foobar: function( hint ) {
        instance.log( '[' + hint + '] DictMixin::foobar() for ' + this.__class__.name );
        return this;
    },
};

var Class5Mixin = Module5.Class( false, 'class Class5Mixin', {
    foobaz: function( hint ) {
        instance.log( '[' + hint + '] Class5Mixin::foobaz() for ' + this.__class__.name );
        return this;
    }
});

var Class6Mixin = Module6.Class( false, class Class6Mixin {
    foobaz( hint ) {
        instance.log( '[' + hint + '] Class6Mixin::foobaz() for ' + this.__class__.name );
        return this;
    }
});

var MixClass1 = Module5.Class( 'class MixClass1 extends', MixBase5, {
    constructor: function( hint ) {
        this._super( [ hint ] );
        instance.log( '[' + hint + '] MixClass1::constructor() for ' + this.__class__.name );
    },
    doit: function( hint ) {
        var ret = this._super( 'doit', [ hint ] );
        instance.log( '[' + hint + '] MixClass1::doit() for ' + this.__class__.name );
        return ret;
    },
});

var MixClass11 = Module5.Class( DictMixin, Class5Mixin, 'class MixClass11 extends', MixClass1, {
    constructor: function( hint ) {
        this._super( [ hint ] );
        instance.log( '[' + hint + '] MixClass11::constructor() for ' + this.__class__.name );
    },
    doit: function( hint ) {
        var ret = this._super( 'doit', [ hint ] );
        instance.log( '[' + hint + '] MixClass11::doit() for ' + this.__class__.name );
        return ret
    },
});

var MixClass2 = Module6.Class( class MixClass2 extends MixBase6 {
    constructor( hint ) {
        super( hint );
        instance.log( '[' + hint + '] MixClass2::constructor() for ' + this.__class__.name );
    }
    doit( hint ) {
        var ret = super.doit( hint );
        instance.log( '[' + hint + '] MixClass2::doit() for ' + this.__class__.name );
        return ret
    }
});

var MixClass21 = Module6.Class( DictMixin, Class6Mixin, class MixClass21 extends MixClass2 {
    constructor( hint ) {
        super( hint );
        instance.log( '[' + hint + '] MixClass21::constructor() for ' + this.__class__.name );
    }
    doit( hint ) {
        var ret = super.doit( hint );
        instance.log( '[' + hint + '] MixClass21::doit() for ' + this.__class__.name );
        return ret
    }
});

var MixClass3 = Module6.Class( class MixClass3 extends MixBase5 {
    constructor( hint ) {
        super( hint );
        instance.log( '[' + hint + '] MixClass1::constructor() for ' + this.__class__.name );
    }
    doit( hint ) {
        var ret = super.doit( hint );
        instance.log( '[' + hint + '] MixClass1::doit() for ' + this.__class__.name );
        return ret
    }
});

/*
var MixClass4 = Module5.Class( 'class MixClass4 extends', MixBase6, {
    constructor: function( hint ) {
        this._super( [ hint ] );
        instance.log( '[' + hint + '] MixClass1::constructor() for ' + this.__class__.name );
    },
    doit: function( hint ) {
        var ret = this._super( 'doit', [ hint ] );
        instance.log( '[' + hint + '] MixClass1::doit() for ' + this.__class__.name );
        return ret
    }
});
*/

})( WebClient );
