(function( instance ) {
/**
 * Based on John Resig's inheritance:
 *
 * Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/blog/simple-javascript-inheritance/
 * MIT Licensed.
 * 
 * see: https://github.com/odoo/odoo/blob/9.0/addons/web/static/src/js/framework/class.js
 * 
 * - multiple inheritance
 * - use __constructor() instead of init()
 * - set 
 * - __static for static functions and variables
 * - __static.init() as static initializer
 * - this._class verweist auf das Class-Objekt (wie Javas getClass())
 */

"use strict";

var initializing = false;
var fnTest = /xyz/.test(function () { xyz; }) ? /\b_(super|code_class)\b/ : /.*/;

// The base Class implementation (does nothing)
var Class = function () {};

// Create a new Class that inherits from this class
Class.extend = function (/** Object bases ...**/) {
    var _super = this.prototype;
    
    // Instantiate a base class (but only create the instance,
    // don’t run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
    
    // The dummy class constructor
    var Class = function () {
        this._super = null;
        // All construction is actually done in the init method
        if (!initializing && this.__constructor) {
            var ret = this.__constructor.apply(this, arguments);
            if (ret !== undefined) return ret;
        }
        return this;
    };
    
    for (var ii = 0; ii < arguments.length; ii++) {
        var prop = arguments[ii];
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we’re overwriting an existing function
            prototype[name] = typeof prop[name] == "function" &&
                              //typeof _super[name] == "function" &&
                              fnTest.test(prop[name])
                    ? (function (name, fn) {
                        var wrapped_fn = function () {
                            var tmp = this._super;

                            // Add a new ._super() method that is the same method
                            // but on the super-class
                            this._super = _super[name];

                            // The method only need to be bound temporarily, so we
                            // remove it when we’re done executing
                            var ret = fn.apply(this, arguments);
                            this._super = tmp;

                            return ret;
                        };
                        wrapped_fn.unwrapped = fn;
                        return wrapped_fn;
                    })(name, prop[name])
                    : prop[name];
        }
    }
    
    prototype.__class__ = Class;
    
    // Populate our constructed prototype object
    Class.prototype = prototype;
    
    // Enforce the constructor to be what we expect
    Class.constructor = Class;
    
    // And make this class extendable
    Class.extend = this.extend;
    
    if (prototype.__static_class_init) {
        prototype.__static_class_init.call(Class);
        delete prototype.__static_class_init;
    }
    
    return Class;
};

instance.ecmascript.Class = Class;

})( WebClient );