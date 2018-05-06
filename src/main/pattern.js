// @flow

const env = require('./env');

class PatternBase {
    predicate(src: any): boolean {
        throw 'do not use base predicate';
    }

    static create(predicate: any) {
        throw 'please implement create function';
    }
}


class SimplePattern extends PatternBase {
    _predicator: any => boolean;

    constructor(predicate: any => boolean) {
        super();
        this._predicator = predicate;
    }

    predicate(src: any): boolean {
        return this._predicator(src);
    }

    static create(predicate: any) {
        if (predicate instanceof Function) {
            return new SimplePattern(predicate);
        } else {
            throw 'Must init with a boolean function';
        }
    }

    as(name: string) {
        return BindingPattern.create(this._predicator, name);
    }
}

class BindingPattern extends SimplePattern {
    name: string;
    pattern: PatternBase;

    constructor(pattern: PatternBase, name: string) {
        super(src => pattern.predicate(src));
        this.name = name;
        this.pattern = pattern;
    }

    predicate(src: any): boolean {
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
    static create(predicator: any, name: string) {
        return new BindingPattern(P.create(predicator), name);
    }
}

class LiteralEqualsPattern extends SimplePattern {
    static create(base_type_value: string | number | boolean) {
        return new SimplePattern(src => base_type_value === src);
    }
}


class ArrayExactPattern extends SimplePattern {
    patterns: Array<PatternBase>;

    constructor(patterns: Array<PatternBase>) {
        super(ArrayExactPattern._get_predicate_function(patterns));
        this.patterns = patterns;
    }

    static create(patterns: Array<PatternBase>) {
        if (patterns instanceof Array) {
            return new ArrayExactPattern(patterns);
        } else {
            throw 'Must init with Array of patterns!';
        }

    }

    static _get_predicate_function(patterns: Array<PatternBase>) {
        if (patterns instanceof Array) {
            return (src: Array<PatternBase>) =>
                src instanceof Array &&
                src.length === patterns.length &&
                Array.from(patterns.entries()).every(([ind, p]) => P.create(p).predicate(src[ind]));
        } else {
            throw 'Must init with Array of patterns!';
        }
    }
}

class ArrayAllPattern extends SimplePattern {
    static create(pattern: PatternBase) {
        return new SimplePattern(src =>
            src instanceof Array &&
            src.every(e => pattern.predicate(e)));
    }
}


class ObjectPattern extends SimplePattern {
    obj: Object;

    constructor(obj: Object) {
        super(ObjectPattern._get_predicate_function(obj));
        this.obj = obj;
    }

    static create(obj: Object) {
        return new ObjectPattern(obj);
    }

    static _get_predicate_function(obj: Object) {
        return (src: Object) =>
            src instanceof Object &&
            Object.entries(obj).every(([prop_name, predicator]) =>
                src.hasOwnProperty(prop_name) &&
                P.create(predicator).predicate(src[prop_name]));
    }
}

class P {
    static AcceptAllPattern = SimplePattern.create(x => true);
    static string = SimplePattern.create(x => typeof x === 'string');
    static greaterThanTen = SimplePattern.create(x => typeof x === 'number' && x > 10);
    static nonEmptyArr = SimplePattern.create(x => x instanceof Array && x.length > 0);

    static create(p: any) {
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
    };

    static as(p: any, name: string) {
        // $FlowFixMe
        return P.create(p).as(name);
    }
}


module.exports.PatternBase = PatternBase;
module.exports.P = P;