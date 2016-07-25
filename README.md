# esmodule

run at <https://friday.w3tools.de/githubcontent/esmodule/master/index.html>

## Example
```javascript
( function( instance ) {
"use strict";
var Module5 = new instance.ecmascript.v5.Module( 'mix' );
var Module6 = new instance.ecmascript.v6.Module( 'mix' );

var MixBase5 = Module5.Class( 'class MixBase', {
    constructor: function( hint ) {
        console.log( '[' + hint + '] MixBase5() for ' + this.__class__.name )
    },
    doit: function( hint ) {
        console.log( '[' + hint + '] MixBase5::doit() for ' + this.__class__.name )
        return this;
    },
});

var MixBase6 = Module6.Class( class MixBase {
    constructor( hint ) {
        console.log( '[' + hint + '] MixBase5() for ' + this.__class__.name )
    }
    doit( hint ) {
        console.log( '[' + hint + '] MixBase5::doit() for ' + this.__class__.name )
        return this;
    }
});

var DictMixin = {
    foobar: function( hint ) {
        console.log( '[' + hint + '] DictMixin::foobar() for ' + this.__class__.name )
        return this;
    },
};

var Class5Mixin = Module5.Class( false, 'class Class5Mixin', {
    foobaz: function( hint ) {
        console.log( '[' + hint + '] Class5Mixin::foobac() for ' + this.__class__.name )
        return this;
    }
});

var Class6Mixin = Module6.Class( false, class Class6Mixin {
    foobaz( hint ) {
        console.log( '[' + hint + '] Class6Mixin::foobaz() for ' + this.__class__.name )
        return this;
    }
});

var MixClass1 = Module5.Class( 'class MixClass1 extends', MixBase5, {
    constructor: function( hint ) {
        this._super( [ hint ] );
        console.log( '[' + hint + '] MixClass1() for ' + this.__class__.name )
    },
    doit: function( hint ) {
        var ret = this._super( 'doit', [ hint ] );
        console.log( '[' + hint + '] MixClass1::doit() for ' + this.__class__.name )
        return ret;
    },
});

var MixClass11 = Module5.Class( DictMixin, Class5Mixin, 'class MixClass11 extends', MixClass1, {
    constructor: function( hint ) {
        this._super( [ hint ] );
        console.log( '[' + hint + '] MixClass11() for ' + this.__class__.name )
    },
    doit: function( hint ) {
        var ret = this._super( 'doit', [ hint ] );
        console.log( '[' + hint + '] MixClass11::doit() for ' + this.__class__.name )
        return ret
    },
});

var MixClass2 = Module6.Class( class MixClass2 extends MixBase6 {
    constructor( hint ) {
        super( hint );
        console.log( '[' + hint + '] MixClass2() for ' + this.__class__.name )
    }
    doit( hint ) {
        var ret = super.doit( hint );
        console.log( '[' + hint + '] MixClass2::doit() for ' + this.__class__.name )
        return ret
    }
});

var MixClass21 = Module6.Class( DictMixin, Class6Mixin, class MixClass21 extends MixClass2 {
    constructor( hint ) {
        super( hint );
        console.log( '[' + hint + '] MixClass21() for ' + this.__class__.name )
    }
    doit( hint ) {
        var ret = super.doit( hint );
        console.log( '[' + hint + '] MixClass21::doit() for ' + this.__class__.name )
        return ret
    }
});

var MixClass3 = Module6.Class( class MixClass3 extends MixBase5 {
    constructor( hint ) {
        super( hint );
        console.log( '[' + hint + '] MixClass1() for ' + this.__class__.name )
    }
    doit( hint ) {
        var ret = super.doit( hint );
        console.log( '[' + hint + '] MixClass1::doit() for ' + this.__class__.name )
        return ret
    }
});

})( WebClient );
```

```javascript
new instance.mix.MixClass1( 'MixClass1' ).doit( 'MixClass1' );
var mixclass11 = new instance.mix.MixClass11( 'MixClass11' ).doit( 'MixClass11' ).foobar( 'MixClass11' )
mixclass11.foobar( 'MixClass21' );
new instance.mix.MixClass2( 'MixClass2' ).doit( 'MixClass2' );
new instance.mix.MixClass21( 'MixClass21' ).doit( 'MixClass21' ).foobar( 'MixClass21' ).foobaz( 'MixClass21' );
//new instance.mix.MixClass3( 'MixClass3' ).doit( 'MixClass3' );
```