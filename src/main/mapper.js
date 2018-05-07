// @flow


class Mapper {
    map_func: any => any;

    constructor(map: (any => any) | any) {
        this.map_func = map;
    }

    static create(map: Mapper | (any => any) | any) {
        if (map instanceof Mapper) {
            return map;
        } else if (map instanceof Function) {
            return new Mapper(map);
        } else {
            return new Mapper(x => map);
        }
    }
}


module.exports = Mapper;
