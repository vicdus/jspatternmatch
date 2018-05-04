class Mapper {

    constructor(map) {
        this.map_func = map;
    }

    static create(map) {
        if (map instanceof Mapper) {
            return map;
        } else if (map instanceof Function) {
            return new Mapper(map);
        } else {
            return new Mapper(x => map);
        }
    }
}

const Mappers = {
    IdentityMapper: Mapper.create(x => x),
    AlwaysZeroMapper: Mapper.create(0),
    AlwaysHiMapper: Mapper.create('hi'),
    AlwaysThrowMapper: Mapper.create(x => {
        throw 'always throw';
    })
};