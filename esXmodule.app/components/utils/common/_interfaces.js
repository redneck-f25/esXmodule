"use strict";

var Class = require( './Class' );

module.exports = {
    Disposable:    { dispose:   Class.abstractMethod },
    Serializable:  { serialize: Class.abstractMethod },
    Closable:      { close:     Class.abstractMethod },
    Persistable:   { persist:   Class.abstractMethod },
    Renderable:    { render:    Class.abstractMethod },
    Hidable:       { hide:      Class.abstractMethod },
    Showable:      { show:      Class.abstractMethod },
    Comperable:    { compare:   Class.abstractMethod },
    Savable:       { save:      Class.abstractMethod },
};
