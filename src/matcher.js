// @flow


// predicator: a Pattern, literal constant or a boolean function
// Mapper: A Mapper, literal value, any => any function
class PatternBase {
    _env: Object;
    _predicator: any => boolean;

    constructor(predicate: any => boolean) {
        this._predicator = predicate;
    }

    predicate(src: any): boolean {
        return this._predicator(src);
    }

    static create(predicate: any) {
        throw 'please implement create function';
    }
}

class SimplePattern extends PatternBase {
    static create(predicate: any) {
        if (predicate instanceof Function) {
            return new PatternBase(predicate);
        } else {
            throw 'Must init with a boolean function';
        }
    }
}

class LiteralEqualsPattern extends PatternBase {
    static create(base_type_value: string | number | boolean) {
        return new PatternBase(src => base_type_value === src);
    }
}


class ArrayExactPattern extends PatternBase {
    patterns: Array<PatternBase>;

    constructor(patterns: Array<PatternBase>) {
        super(ArrayExactPattern._get_predicate_function(patterns));
        this.patterns = patterns;
    }

    static create(patterns: Array<PatternBase>) {
        return new ArrayExactPattern(patterns);
    }

    static _get_predicate_function(patterns: Array<PatternBase>) {
        return (src) => {
            if (src.length !== patterns.length) return false;
            return Array.from(patterns.entries()).every(([ind, p]) => P.create(p).predicate(src[ind]));
        };
    }
}

class ArrayAllPattern extends PatternBase {
    static create(pattern: PatternBase) {
        return new PatternBase(src => src.every(e => pattern.predicate(e)));
    }
}


class BindingPattern extends PatternBase {
    _env: Object;
    name_without_at: string;

    constructor(name_without_at: string) {
        super(src => true);
        this._env = {};
        this.name_without_at = name_without_at;
    }

    predicate(src: any): boolean {
        this._env[this.name_without_at] = src;
        return true;
    }

    static create(name_with_at: string) {
        if (name_with_at[0] === '@') {
            return new BindingPattern(name_with_at.slice(1));
        } else {
            throw 'not binding!';
        }
    }
}


class ObjectPattern extends PatternBase {
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
            src.hasOwnProperty(prop_name) &&
            P.create(predicator).predicate(src[prop_name]));
    }
}


class Mapper {
    _env: Object;
    map: any => any;

    constructor(map: (any => any) | any) {
        if (typeof map === 'function') {
            this.map = map;
        } else {
            this.map = x => map;
        }
    }

    static create(mapper: (any => any) | any) {
        return new Mapper(mapper);
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
    if ((predicate instanceof PatternBase) && (mapper instanceof Mapper)) {
        return new PatternCase(predicate, mapper);
    } else if (!(predicate instanceof PatternBase) && (mapper instanceof Mapper)) {
        return new PatternCase(PatternBase.create(predicate), mapper);
    } else if ((predicate instanceof PatternBase) && !(mapper instanceof Mapper)) {
        return new PatternCase(predicate, Mapper.create(mapper));
    } else if (!(predicate instanceof PatternBase) && !(mapper instanceof Mapper)) {
        return new PatternCase(PatternBase.create(predicate), Mapper.create(mapper));
    } else {
        throw 'bad init';
    }
};


const P = {
    AcceptAllPattern: SimplePattern.create(x => true),
    string: SimplePattern.create(x => typeof x === 'string'),
    greaterThanTen: SimplePattern.create(x => typeof x === 'number' && x > 10),
    nonEmptyArr: SimplePattern.create(x => x instanceof Array && x.length > 0),

    create: (p) => {
        if (p instanceof PatternBase) {
            return p;
        } else if (p instanceof Array) {
            return ArrayExactPattern.create(p);
        } else if (p instanceof Function) {
            return SimplePattern.create(p);
        } else if (p instanceof Object) {
            return ObjectPattern.create(p);
        } else if (typeof p === 'string' && p[0] === '@') {
            return BindingPattern.create(p);
        } else if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean') {
            return LiteralEqualsPattern.create(p);
        }
        throw 'not supported yet !';
    }
};


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
            return found.mapper.map(src);
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
                temp = P.create(temp);
                e = Mapper.create(e);

                if (temp instanceof BindingPattern) {
                    e._env = temp._env;
                }
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


const matcher = Matcher.create([
    [x => x > 100, 'xixi'], 'Literal match [>100, xixi]',
    P.string, 'Your input is a string',
    x => x === 100, x => x + 200,
    23333, 'exactly 23333',
    P.greaterThanTen, 'This is a number and is greater than ten',
    [P.string, P.greaterThanTen], 'Complicated array!',
    P.nonEmptyArr, 'nonempty array',
    {
        status: P.greaterThanTen,
        content: P.string
    }, src => ('not 404 and have content! status code' + src.status.toString()),
    '@xixi', 'binding!',
    Cases.AcceptAllAlwaysThrowCase,
]);


console.log(matcher.match(20));
console.log(matcher.match('str'));
console.log(matcher.match(23333));
console.log(matcher.match([1, 2, 3]));
console.log(matcher.match(100));
console.log(matcher.match(['hi', 233]));
console.log(matcher.match([99, 'xixi']));
console.log(matcher.match({status: 200, content: 'xixi'}));


try {
    matcher.match(null);
} catch (e) {
    console.log('You get always throw! ' + e);
}
