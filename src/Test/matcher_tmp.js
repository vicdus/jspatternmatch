// @flow


// predicator: a Pattern, literal constant or a boolean function
// map_func: A Mapper, literal value, any => any function

class env {
    static _envs = [{}];

    constructor() {
        throw 'abstract!';
    }

    static head() {
        return env._envs[env._envs.length - 1];
    }

    static put(name, value) {
        env.head()[name] = value;
    }

    static dup_head() {
        env._envs.push(Object.assign({}, env.head()));
    }

    static pop() {
        return env._envs.pop();
    }

    static flush() {
        env._envs = [{}];
    }

}

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
            return (src) => {
                return src instanceof Array &&
                    src.length !== patterns.length &&
                    Array.from(patterns.entries()).every(([ind, p]) => P.create(p).predicate(src[ind]));
            };
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
        return src => Object.entries(obj).every(([prop_name, predicator]) =>
            src instanceof Object &&
            src.hasOwnProperty(prop_name) &&
            P.create(predicator).predicate(src[prop_name]));
    }
}


class Mapper {
    map_func: any => any;

    constructor(map: (any => any) | any) {
        this.map_func = map;
    }

    static create(map: Mapper | (any => any) | any) {
        if (map instanceof Mapper) {
            return map;
        } else if (map instanceof Function) {
            return new Mapper(map);
        } else {
            return new Mapper(x => map);
        }
    }
}


class PatternCase {
    pattern: PatternBase;
    mapper: Mapper;

    constructor(pattern: PatternBase, mapper: Mapper) {
        this.pattern = pattern;
        this.mapper = mapper;
    }
}


const Case = (predicate: boolean | (any => boolean) | PatternBase, mapper: any | (any => any) | Mapper) => {
    return new PatternCase(P.create(predicate), Mapper.create(mapper));
};


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

    static as(p, name) {
        // $FlowFixMe
        return P.create(p).as(name);
    }
}


const Mappers = {
    IdentityMapper: Mapper.create(x => x),
    AlwaysZeroMapper: Mapper.create(0),
    AlwaysHiMapper: Mapper.create('hi'),
    AlwaysThrowMapper: Mapper.create(x => {
        throw 'always throw';
    }),
};


const Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper),
};


class Matcher {
    cases: Array<PatternCase>;

    constructor(cases: Array<PatternCase>) {
        this.cases = cases;
    }

    match(src: any) {
        const found = this.cases.find(c => c.pattern.predicate(src));
        if (found) {
            console.log('mapfunc = ', found.mapper.map_func);
            const cur_env = env.pop();
            const res = found.mapper.map_func(Object.keys(cur_env).length === 0 ? src : cur_env);
            env.flush();
            return res;
        } else {
            throw 'Not match!';
        }
    };

    static create(items: Array<any>) {
        const cases = [];
        let temp = null;
        items.forEach(e => {
            if (e instanceof PatternCase) {
                cases.push(e);
            } else if (temp !== null) {
                // temp is pattern, e is mapper
                // temp = P.create(temp);
                // e = Mapper.create(e);
                cases.push(Case(temp, e));
                temp = null;
            } else if (temp === null) {
                temp = P.create(e);
            } else {
                throw 'bad init';
            }
        });
        return new Matcher(cases);
    }
}

//
// const m = Matcher.create([
//     '123', x => console.log(x),
//     ['@whatever', '@anything'], x => console.log(x),
//     {code: '@code'}, x => console.log(x),
//     P.as(x => x === 100, 'goodname'), x => console.log(x),
//     '@final', x => console.log(x)
// ]);
//
//
// m.match(100);
// m.match('123');
// m.match([333, 999]);


const matcher = Matcher.create([
    [x => x > 100, 'xixi'], 'Literal match [>100, xixi]',
    P.string, 'Your input is a string',
    x => x === 100, x => x + 200,
    23333, 'exactly 23333',
    P.greaterThanTen, 'This is a number and is greater than ten',
    [P.string, P.greaterThanTen], 'Complicated array!',
    P.nonEmptyArr, 'nonempty array',
    {
        status: 200,
        content: P.string.as('ct')
    }, src => ('200 and have content! status code' + src.ct),
    Cases.AcceptAllAlwaysThrowCase,
]);


// console.log(matcher.match(20));
// console.log(matcher.match('str'));
// console.log(matcher.match(23333));
// console.log(matcher.match([1, 2, 3]));
// console.log(matcher.match(100));
// console.log(matcher.match(['hi', 233]));
// console.log(matcher.match([99, 'xixi']));
// console.log(matcher.match({status: 200, content: 'xixi'}));
//

try {
    console.log(matcher.match(null));
} catch (e) {
    console.log('You get always throw! ' + e);
}

module.exports.acd = 123;