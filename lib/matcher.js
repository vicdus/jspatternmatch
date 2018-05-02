const { List } = require('immutable');

class Pattern {

    constructor(predicate) {
        this._predicator = predicate;
    }

    predicate(src) {
        return this._predicator(src);
    }

    static create(predicate) {
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

    constructor(patterns) {
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

class Mapper {

    constructor(map) {
        if (typeof map === 'function') {
            this.map = map;
        } else {
            this.map = x => map;
        }
    }

    static create(mapper) {
        return new Mapper(mapper);
    }
}

class PatternCase {

    constructor(pattern, mapper) {
        this.pattern = pattern;
        this.mapper = mapper;
    }
}

const Case = (predicate, mapper) => {
    if (predicate instanceof Pattern && mapper instanceof Mapper) {
        return new PatternCase(predicate, mapper);
    } else if (!(predicate instanceof Pattern) && mapper instanceof Mapper) {
        return new PatternCase(Pattern.create(predicate), mapper);
    } else if (predicate instanceof Pattern && !(mapper instanceof Mapper)) {
        return new PatternCase(predicate, Mapper.create(mapper));
    } else if (!(predicate instanceof Pattern) && !(mapper instanceof Mapper)) {
        return new PatternCase(Pattern.create(predicate), Mapper.create(mapper));
    } else {
        throw 'bad init';
    }
};

const P = {
    AcceptAllPattern: Pattern.create(true),
    IsString: Pattern.create(x => typeof x === 'string'),
    IsGreaterThanTen: Pattern.create(x => typeof x === 'number' && x > 10),
    IsNonEmptyArray: Pattern.create(x => x instanceof Array && x.length > 0)
};

const Mappers = {
    IdentityMapper: Mapper.create(x => x),
    AlwaysZeroMapper: Mapper.create(0),
    AlwaysHiMapper: Mapper.create('hi'),
    AlwaysThrowMapper: Mapper.create(x => {
        throw 'always throw';
    })
};

const Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper)
};

class Matcher {

    constructor(cases) {
        this.cases = cases;
    }

    match(src) {
        return this.cases.find(c => c.pattern.predicate(src)).mapper.map(src);
    }

    static create(items) {
        const buffer = [];
        let temp = null;
        items.forEach(e => {
            if (e instanceof PatternCase) {
                buffer.push(e);
            } else if (temp !== null) {
                buffer.push(Case(temp, e));
                temp = null;
            } else if (temp === null) {
                if (e instanceof Array) {
                    temp = new ArrayExactlyPattern(e);
                } else {
                    temp = e;
                }
            } else {
                throw 'bad init';
            }
        });
        return new Matcher(List(buffer));
    }
}

const matcher = Matcher.create([P.IsString, 'Your input is a string', x => x === 100, x => x + 200, P.IsGreaterThanTen, 'This is a number and is greater than ten', [P.IsString, P.IsGreaterThanTen], 'Complicated array!', P.IsNonEmptyArray, 'nonempty array', Cases.AcceptAllAlwaysThrowCase]);

console.log(matcher.match(20));
console.log(matcher.match('str'));
console.log(matcher.match([1, 2, 3]));
console.log(matcher.match(100));
console.log(matcher.match(['hi', 233]));

try {
    matcher.match(null);
} catch (e) {
    console.log('You get always throw! ' + e);
}