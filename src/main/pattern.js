// @flow

const Env = require('./Env');
const PatternBase = require('./PatternBase');


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
        return BindingPattern.create(this, name);
    }
}


class AlwaysAcceptPattern extends SimplePattern {
    constructor() {
        super(src => true);
    }

    static create() {
        return new AlwaysAcceptPattern();
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
            Env.put(this.name, src);
            return true;
        } else {
            Env.reset_head();
            return false;
        }
    }

    // $FlowFixMe
    static create(predicator: any, name: string) {
        if (typeof(name) === 'string' && name.length > 0) {
            return new BindingPattern(P.create(predicator), name);
        } else {
            throw 'Invalid binding name. Must be non-empty string';
        }
    }
}


class LiteralEqualsPattern extends SimplePattern {
    static create(expected: any) {
        return new SimplePattern(src => src === expected);
    }
}


class ArrayRestPattern extends AlwaysAcceptPattern {
    static create() {
        return new ArrayRestPattern();
    }
}


class ArrayPattern extends SimplePattern {
    patterns: Array<PatternBase>;

    constructor(patterns: Array<PatternBase>) {
        super(ArrayPattern._get_predicate_function(patterns));
        this.patterns = patterns;
    }

    static create(patterns: Array<PatternBase>) {
        if (patterns instanceof Array) {
            return new ArrayPattern(patterns);
        } else {
            throw 'Must init with Array of patterns!';
        }
    }

    static _get_predicate_function(predicators: Array<any>) {
        if (predicators instanceof Array) {
            return (src: any) => {
                Env.dup_head();
                if (src instanceof Array) {
                    for (const [ind, p] of Array.from(predicators.entries())) {
                        if ((p instanceof ArrayRestPattern) || (p instanceof BindingPattern && p.pattern instanceof ArrayRestPattern)) {
                            // match rest of array, always true
                            return p.predicate(src.slice(ind));
                        } else if (ind > src.length - 1) {
                            // src array too short
                            Env.pop();
                            return false;
                        } else if (ind === predicators.length - 1 && ind < src.length - 1) {
                            // unmatched remainder of src array. i.e src array too long
                            Env.pop();
                            return false;
                        } else if (!P.create(p).predicate(src[ind])) {
                            // if doesn't match
                            Env.pop();
                            return false;
                        }
                    }
                    return true;
                } else {
                    Env.pop();
                    return false;
                }
            };
        } else {
            throw 'Must init with Array of predicators!';
        }
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
        return (src: Object) => {
            Env.dup_head();
            if (src instanceof Object &&
                Object.entries(obj).every(([prop_name, predicator]) =>
                    src.hasOwnProperty(prop_name) &&
                    P.create(predicator).predicate(src[prop_name]))) {
                return true;
            } else {
                Env.pop();
                return false;
            }
        };
    }
}


class P {
    static AcceptAllPattern = SimplePattern.create(x => true);
    static string = SimplePattern.create(x => typeof x === 'string');
    static greaterThanTen = SimplePattern.create(x => typeof x === 'number' && x > 10);
    static nonEmptyArr = SimplePattern.create(x => x instanceof Array && x.length > 0);

    static create(p: any) {
        // TODO: Refactor this when necessary. It's ok for now.
        if (p instanceof PatternBase) {
            if (p.constructor.name === PatternBase.name) throw 'do not use pattern base directly';
            return p;
        } else if (p instanceof Array) {
            return ArrayPattern.create(p);
        } else if (p instanceof Function) {
            return SimplePattern.create(p);
        } else if (p instanceof Object) {
            return ObjectPattern.create(p);
        } else if (typeof p === 'string' && p[0] === '@') {
            return BindingPattern.create(x => true, p.slice(1));
        } else if (p === '_') {
            return AlwaysAcceptPattern.create();
        } else if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean' || p === null || p === undefined) {
            return LiteralEqualsPattern.create(p);
        }
        throw 'not supported yet !';
    };

    static as(p: any, name: string) {
        return P.create(p).as(name);
    }
}


module.exports.P = P;
module.exports.REST = ArrayRestPattern.create();
module.exports.ANY = AlwaysAcceptPattern.create();
module.exports.Literal = (literal: any) => LiteralEqualsPattern.create(literal);
