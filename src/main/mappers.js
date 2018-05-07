// @flow


const Mapper = require('./mapper');


const Mappers = {
    IdentityMapper: Mapper.create(x => x),
    AlwaysZeroMapper: Mapper.create(0),
    AlwaysHiMapper: Mapper.create('hi'),
    AlwaysThrowMapper: Mapper.create(x => {
        throw 'always throw';
    }),
};

module.exports = Mappers;