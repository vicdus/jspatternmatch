// @flow

const {List} = require('immutable');


class PatternBase {
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
        console.log('create ---', predicate);
        if (predicate instanceof Function) {
            return new PatternBase(predicate);
        } else if (typeof predicate === 'boolean') {
            // $FlowFixMe
            return new PatternBase(x => predicate);
        } else {
            throw 'bad pattern init' + predicate.toString();
        }
    }

}


class ArrayExactlyPattern extends PatternBase {
    patterns: Array<PatternBase>;

    constructor(patterns: Array<PatternBase>) {
        super(ArrayExactlyPattern._get_predicate_function(patterns));
        this.patterns = patterns;
    }

    static create(patterns: Array<PatternBase>) {
        return new ArrayExactlyPattern(patterns);
    }

    static _get_predicate_function(patterns: Array<PatternBase>) {
        return (src) => {
            if (!(src instanceof List || src instanceof Array)) {
                return false;
            }
            if (src instanceof List) {
                if (src.size !== patterns.length) return false;
            } else if (src instanceof Array) {
                if (src.length !== patterns.length) return false;
            }
            let ind = 0;
            src.forEach(p => {
                if (!patterns[ind].predicate(p)) return false;
                ind += 1;
            });
            return true;
        };
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
        // $FlowFixMe
        return src => Object.entries(obj).every(([k, v]) => src.hasOwnProperty(k) && v.predicate(src[k]));
    }
}


class Mapper {
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
    AcceptAllPattern: SimplePattern.create(true),
    string: SimplePattern.create(x => typeof x === 'string'),
    greaterThanTen: SimplePattern.create(x => typeof x === 'number' && x > 10),
    nonEmptyArr: SimplePattern.create(x => x instanceof Array && x.length > 0),

    create: (p) => {
        if (p instanceof PatternBase) {
            return p;
        } else if (p instanceof Array) {
            console.log('here');
            return ArrayExactlyPattern.create(p);
        } else if (p instanceof Function) {
            return SimplePattern.create(p);
        } else if (p instanceof Object) {
            return ObjectPattern.create(p);
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
    cases: List<PatternCase>;

    constructor(cases: List<PatternCase>) {
        this.cases = cases;
    }

    match(src: any) {
        return this.cases.find(c => c.pattern.predicate(src)).mapper.map(src);
    };

    static create(items: Array<any>) {
        const buffer = [];
        let temp = null;
        items.forEach(e => {
            if (e instanceof PatternCase) {
                buffer.push(e);
            } else if (temp !== null) {
                console.log('pattern---- ', temp);
                console.log('mapper----- ', e);
                buffer.push(Case(temp, e));
                temp = null;
            } else if (temp === null) {
                console.log(e);
                temp = P.create(e);
            } else {
                throw 'bad init';
            }
        });
        return new Matcher(List(buffer));
    }
}


// Matcher.create([[x => x === 1, x => x === 2], 'xixi']);


const matcher = Matcher.create([
    P.string, 'Your input is a string',
    x => x === 100, x => x + 200,
    P.greaterThanTen, 'This is a number and is greater than ten',
    [P.string, P.greaterThanTen], 'Complicated array!',
    P.nonEmptyArr, 'nonempty array',
    {
        status: P.greaterThanTen,
        content: P.string
    }, src => ('not 404 and have content! status code' + src.status.toString()),
    Cases.AcceptAllAlwaysThrowCase,
]);


console.log(matcher.match(20));
console.log(matcher.match('str'));
console.log(matcher.match([1, 2, 3]));
console.log(matcher.match(100));
console.log(matcher.match(['hi', 233]));
console.log(matcher.match({status: 200, content: 'xixi'}));

try {
    matcher.match(null);
} catch (e) {
    console.log('You get always throw! ' + e);
}
