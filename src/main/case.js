// @flow

const Mapper = require('./mapper').Mapper;
const Mappers = require('./mapper').Mappers;
const PatternBase = require('./pattern').PatternBase;
const P = require('./pattern').P;

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


const Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper),
};

module.exports.Case = Case;
module.exports.PatternCase = PatternCase;
module.exports.Cases = Cases;