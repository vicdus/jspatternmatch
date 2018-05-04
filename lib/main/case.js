'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

require('./mapper.js');
require('./pattern.js');

var PatternCase = function PatternCase(pattern, mapper) {
    _classCallCheck(this, PatternCase);

    this.pattern = pattern;
    this.mapper = mapper;
};

var Case = function Case(predicate, mapper) {
    return new PatternCase(P.create(predicate), Mapper.create(mapper));
};

var Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper)
};

module.exports = Case;