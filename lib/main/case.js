require('./mapper.js');
require('./pattern.js');

class PatternCase {

    constructor(pattern, mapper) {
        this.pattern = pattern;
        this.mapper = mapper;
    }
}

const Case = (predicate, mapper) => {
    return new PatternCase(P.create(predicate), Mapper.create(mapper));
};

const Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper)
};

module.exports = Case;