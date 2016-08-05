 "use strict";

var animals = require( './common/animals_' );

var Class = require( '../utils/common/ClassV6' );
var OldStyleClass = require( '../utils/common/Class' );

var WidgetDictMixin = {
    dispose: function dispose () {},
}

class WidgetClassMixin {
    render() {}
}

var MammalWidget = this.MammalWidget = Class( module,
        Class.I.Disposable, Class.I.Renderable, WidgetClassMixin,
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

var Mammal5Widget = this.Mammal5Widget = OldStyleClass( module,
        OldStyleClass.I.Disposable, OldStyleClass.I.Renderable, WidgetClassMixin, WidgetDictMixin,
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
