'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PatternCase = require('./pattern.js');
var Case = require('./case.js');
var env = require('./env');

var Matcher = function () {
    function Matcher(cases) {
        _classCallCheck(this, Matcher);

        this.cases = cases;
    }

    _createClass(Matcher, [{
        key: 'match',
        value: function match(src) {
            var found = this.cases.find(function (c) {
                return c.pattern.predicate(src);
            });
            if (found) {
                console.log('mapfunc = ', found.mapper.map_func);
                var cur_env = env.pop();
                var res = found.mapper.map_func(Object.keys(cur_env).length === 0 ? src : cur_env);
                env.flush();
                return res;
            } else {
                throw 'Not match!';
            }
        }
    }], [{
        key: 'create',
        value: function create(items) {
            var cases = [];
            var temp = null;
            items.forEach(function (e) {
                if (e instanceof PatternCase) {
                    cases.push(e);
                } else if (temp !== null) {
                    // temp is pattern, e is mapper
                    // temp = P.create(temp);
                    // e = Mapper.create(e);
                    cases.push(Case(temp, e));
                    temp = null;
                } else if (temp === null) {
                    temp = P.create(e);
                } else {
                    throw 'bad init';
                }
            });
            return new Matcher(cases);
        }
    }]);

    return Matcher;
}();