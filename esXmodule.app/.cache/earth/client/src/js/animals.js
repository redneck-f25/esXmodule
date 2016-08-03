/* earth/animals.js **********************************************************/
WebClient.define( "earth/animals", function $__module__earth_animals__( exports, require, module ) {
 "use strict";

var animals = require( './common/animals' );

var Class = require( '../utils/Class6' );
var Class5 = require( '../utils/Class5' );

var Disposable = {
    dispose: Class5.abstractMethod,
};

var Renderable = { 
    render: Class5.abstractMethod,
}

var WidgetDictMixin = {
    dispose: function dispose () {},
}

class WidgetClassMixin {
    render() {}
}

var MammalWidget = this.MammalWidget = Class( module,
        Disposable, Renderable, WidgetClassMixin, WidgetDictMixin,
        class MammalWidget extends animals.Mammal {
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

var Mammal5Widget = this.Mammal5Widget = Class5( module,
        Disposable, Renderable, WidgetClassMixin, WidgetDictMixin,
        'class Mammal5Widget extends', animals.Mammal5, {
    constructor: function constructor() {
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

var InsectWidget = this.InsectWidget = Class( module, class InsectWidget extends animals.Insect {
    constructor() {
        super();
    }
});

});
