// @flow

const PatternCase = require('./case');
const Mapper = require('./mapper');
const PatternBase = require('./PatternBase');
const P = require('./pattern').P;

const Case = (predicate: boolean | (any => boolean) | PatternBase, mapper: any | (any => any) | Mapper) => {
    return new PatternCase(P.create(predicate), Mapper.create(mapper));
};


module.exports = Case;
