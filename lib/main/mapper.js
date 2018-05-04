'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Mapper = function () {
    function Mapper(map) {
        _classCallCheck(this, Mapper);

        this.map_func = map;
    }

    _createClass(Mapper, null, [{
        key: 'create',
        value: function create(map) {
            if (map instanceof Mapper) {
                return map;
            } else if (map instanceof Function) {
                return new Mapper(map);
            } else {
                return new Mapper(function (x) {
                    return map;
                });
            }
        }
    }]);

    return Mapper;
}();

var Mappers = {
    IdentityMapper: Mapper.create(function (x) {
        return x;
    }),
    AlwaysZeroMapper: Mapper.create(0),
    AlwaysHiMapper: Mapper.create('hi'),
    AlwaysThrowMapper: Mapper.create(function (x) {
        throw 'always throw';
    })
};