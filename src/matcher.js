// @flow

const {List} = require('immutable');


class Pattern {
    _predicator: any => boolean;

    constructor(predicate: any => boolean) {
        this._predicator = predicate;
    }

    predicate(src: any): boolean {
        return this._predicator(src);
    }


    static create(predicate: ((any => boolean ) | boolean)) {
        if (predicate instanceof Function) {
            return new Pattern(predicate);
        } else if (typeof predicate === 'boolean') {
            // $FlowFixMe
            return new Pattern(x => predicate);
        } else {
            throw 'bad pattern init';
        }
    }
}

class ArrayExactlyPattern extends Pattern {
    patterns: Array<Pattern>;

    constructor(patterns: Array<Pattern>) {
        super(src => {
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
        });
        this.patterns = patterns;
    }
}

class ObjectPattern extends Pattern {
    obj: Object;

    constructor(obj: Object) {
        // $FlowFixMe
        super(src => Object.entries(obj).every(([k, v]) => src.hasOwnProperty(k) && v.predicate(src[k])));
        this.obj = obj;
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
    pattern: Pattern;
    mapper: Mapper;

    constructor(pattern: Pattern, mapper: Mapper) {
        this.pattern = pattern;
        this.mapper = mapper;
    }
}


const Case = (predicate: boolean | (any => boolean) | Pattern, mapper: any | (any => any) | Mapper) => {
    if ((predicate instanceof Pattern) && (mapper instanceof Mapper)) {
        return new PatternCase(predicate, mapper);
    } else if (!(predicate instanceof Pattern) && (mapper instanceof Mapper)) {
        return new PatternCase(Pattern.create(predicate), mapper);
    } else if ((predicate instanceof Pattern) && !(mapper instanceof Mapper)) {
        return new PatternCase(predicate, Mapper.create(mapper));
    } else if (!(predicate instanceof Pattern) && !(mapper instanceof Mapper)) {
        return new PatternCase(Pattern.create(predicate), Mapper.create(mapper));
    } else {
        throw 'bad init';
    }
};


const P = {
    AcceptAllPattern: Pattern.create(true),
    string: Pattern.create(x => typeof x === 'string'),
    greaterThanTen: Pattern.create(x => typeof x === 'number' && x > 10),
    nonEmptyArr: Pattern.create(x => x instanceof Array && x.length > 0),
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
                console.log('pattern ', temp);
                console.log('mapper ', e);
                buffer.push(Case(temp, e));
                temp = null;
            } else if (temp === null) {
                if (e instanceof Pattern || e instanceof Function) {
                    temp = e;
                } else if (e instanceof Array) {
                    temp = new ArrayExactlyPattern(e);
                } else if (e instanceof Object) {
                    temp = new ObjectPattern(e);
                }
            } else {
                throw 'bad init';
            }
        });
        return new Matcher(List(buffer));
    }
}


const matcher = Matcher.create([
    P.string, 'Your input is a string',
    x => x === 100, x => x + 200,
    P.greaterThanTen, 'This is a number and is greater than ten',
    [P.string, P.greaterThanTen], 'Complicated array!',
    P.nonEmptyArr, 'nonempty array', {
        status: P.greaterThanTen,
        content: P.string
    }, src => 'not 404 and have content! status code' + src.status.toString(),
    Cases.AcceptAllAlwaysThrowCase,
]);

//
// console.log(matcher.match(20));
// console.log(matcher.match('str'));
// console.log(matcher.match([1, 2, 3]));
// console.log(matcher.match(100));
// console.log(matcher.match(['hi', 233]));
console.log(matcher.match({status: 200, content: 'xixi'}));

// try {
//     matcher.match(null);
// } catch (e) {
//     console.log('You get always throw! ' + e);
// }
