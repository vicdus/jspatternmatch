const env = require('./env.js');

class PatternBase {
    predicate(src) {
        throw 'do not use base predicate';
    }

    static create(predicate) {
        throw 'please implement create function';
    }
}

class SimplePattern extends PatternBase {

    constructor(predicate) {
        super();
        this._predicator = predicate;
    }

    predicate(src) {
        return this._predicator(src);
    }

    static create(predicate) {
        if (predicate instanceof Function) {
            return new SimplePattern(predicate);
        } else {
            throw 'Must init with a boolean function';
        }
    }

    as(name) {
        return BindingPattern.create(this._predicator, name);
    }
}

class BindingPattern extends SimplePattern {

    constructor(pattern, name) {
        super(src => pattern.predicate(src));
        this.name = name;
        this.pattern = pattern;
    }

    predicate(src) {
        if (this.pattern.predicate(src)) {
            env.dup_head();
            env.put(this.name, src);
            return true;
        } else {
            env.flush();
            return false;
        }
    }

    // $FlowFixMe
    static create(predicator, name) {
        return new BindingPattern(P.create(predicator), name);
    }
}

class LiteralEqualsPattern extends SimplePattern {
    static create(base_type_value) {
        return new SimplePattern(src => base_type_value === src);
    }
}

class ArrayExactPattern extends SimplePattern {

    constructor(patterns) {
        super(ArrayExactPattern._get_predicate_function(patterns));
        this.patterns = patterns;
    }

    static create(patterns) {
        if (patterns instanceof Array) {
            return new ArrayExactPattern(patterns);
        } else {
            throw 'Must init with Array of patterns!';
        }
    }

    static _get_predicate_function(patterns) {
        if (patterns instanceof Array) {
            return src => {
                return src instanceof Array && src.length !== patterns.length && Array.from(patterns.entries()).every(([ind, p]) => P.create(p).predicate(src[ind]));
            };
        } else {
            throw 'Must init with Array of patterns!';
        }
    }
}

class ArrayAllPattern extends SimplePattern {
    static create(pattern) {
        return new SimplePattern(src => src instanceof Array && src.every(e => pattern.predicate(e)));
    }
}

class ObjectPattern extends SimplePattern {

    constructor(obj) {
        super(ObjectPattern._get_predicate_function(obj));
        this.obj = obj;
    }

    static create(obj) {
        return new ObjectPattern(obj);
    }

    static _get_predicate_function(obj) {
        return src => Object.entries(obj).every(([prop_name, predicator]) => src instanceof Object && src.hasOwnProperty(prop_name) && P.create(predicator).predicate(src[prop_name]));
    }
}

class P {

    static create(p) {
        if (p instanceof PatternBase) {
            if (p.constructor.name === PatternBase.name) throw 'do not use pattern base directly';
            return p;
        } else if (p instanceof Array) {
            return ArrayExactPattern.create(p);
        } else if (p instanceof Function) {
            return SimplePattern.create(p);
        } else if (p instanceof Object) {
            return ObjectPattern.create(p);
        } else if (typeof p === 'string' && p[0] === '@') {
            return BindingPattern.create(x => true, p.slice(1));
        } else if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean' || p === null || p === undefined) {
            return LiteralEqualsPattern.create(p);
        }
        throw 'not supported yet !';
    }

    static as(p, name) {
        // $FlowFixMe
        return P.create(p).as(name);
    }
}
P.AcceptAllPattern = SimplePattern.create(x => true);
P.string = SimplePattern.create(x => typeof x === 'string');
P.greaterThanTen = SimplePattern.create(x => typeof x === 'number' && x > 10);
P.nonEmptyArr = SimplePattern.create(x => x instanceof Array && x.length > 0);