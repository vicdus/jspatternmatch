// @flow


const Mapper = require('./mapper');
const PatternBase = require('./PatternBase');


class PatternCase {
    pattern: PatternBase;
    mapper: Mapper;

    constructor(pattern: PatternBase, mapper: Mapper) {
        this.pattern = pattern;
        this.mapper = mapper;
    }
}


module.exports = PatternCase;