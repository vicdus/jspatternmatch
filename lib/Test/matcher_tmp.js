'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// predicator: a Pattern, literal constant or a boolean function
// map_func: A Mapper, literal value, any => any function

var env = function () {
    function env() {
        _classCallCheck(this, env);

        throw 'abstract!';
    }

    _createClass(env, null, [{
        key: 'head',
        value: function head() {
            return env._envs[env._envs.length - 1];
        }
    }, {
        key: 'put',
        value: function put(name, value) {
            env.head()[name] = value;
        }
    }, {
        key: 'dup_head',
        value: function dup_head() {
            env._envs.push(Object.assign({}, env.head()));
        }
    }, {
        key: 'pop',
        value: function pop() {
            return env._envs.pop();
        }
    }, {
        key: 'flush',
        value: function flush() {
            env._envs = [{}];
        }
    }]);

    return env;
}();

env._envs = [{}];

var PatternBase = function () {
    function PatternBase() {
        _classCallCheck(this, PatternBase);
    }

    _createClass(PatternBase, [{
        key: 'predicate',
        value: function predicate(src) {
            throw 'do not use base predicate';
        }
    }], [{
        key: 'create',
        value: function create(predicate) {
            throw 'please implement create function';
        }
    }]);

    return PatternBase;
}();

var SimplePattern = function (_PatternBase) {
    _inherits(SimplePattern, _PatternBase);

    function SimplePattern(predicate) {
        _classCallCheck(this, SimplePattern);

        var _this = _possibleConstructorReturn(this, (SimplePattern.__proto__ || Object.getPrototypeOf(SimplePattern)).call(this));

        _this._predicator = predicate;
        return _this;
    }

    _createClass(SimplePattern, [{
        key: 'predicate',
        value: function predicate(src) {
            return this._predicator(src);
        }
    }, {
        key: 'as',
        value: function as(name) {
            return BindingPattern.create(this._predicator, name);
        }
    }], [{
        key: 'create',
        value: function create(predicate) {
            if (predicate instanceof Function) {
                return new SimplePattern(predicate);
            } else {
                throw 'Must init with a boolean function';
            }
        }
    }]);

    return SimplePattern;
}(PatternBase);

var BindingPattern = function (_SimplePattern) {
    _inherits(BindingPattern, _SimplePattern);

    function BindingPattern(pattern, name) {
        _classCallCheck(this, BindingPattern);

        var _this2 = _possibleConstructorReturn(this, (BindingPattern.__proto__ || Object.getPrototypeOf(BindingPattern)).call(this, function (src) {
            return pattern.predicate(src);
        }));

        _this2.name = name;
        _this2.pattern = pattern;
        return _this2;
    }

    _createClass(BindingPattern, [{
        key: 'predicate',
        value: function predicate(src) {
            if (this.pattern.predicate(src)) {
                env.dup_head();
                env.put(this.name, src);
                return true;
            } else {
                env.flush();
                return false;
            }
        }

        // $FlowFixMe

    }], [{
        key: 'create',
        value: function create(predicator, name) {
            return new BindingPattern(P.create(predicator), name);
        }
    }]);

    return BindingPattern;
}(SimplePattern);

var LiteralEqualsPattern = function (_SimplePattern2) {
    _inherits(LiteralEqualsPattern, _SimplePattern2);

    function LiteralEqualsPattern() {
        _classCallCheck(this, LiteralEqualsPattern);

        return _possibleConstructorReturn(this, (LiteralEqualsPattern.__proto__ || Object.getPrototypeOf(LiteralEqualsPattern)).apply(this, arguments));
    }

    _createClass(LiteralEqualsPattern, null, [{
        key: 'create',
        value: function create(base_type_value) {
            return new SimplePattern(function (src) {
                return base_type_value === src;
            });
        }
    }]);

    return LiteralEqualsPattern;
}(SimplePattern);

var ArrayExactPattern = function (_SimplePattern3) {
    _inherits(ArrayExactPattern, _SimplePattern3);

    function ArrayExactPattern(patterns) {
        _classCallCheck(this, ArrayExactPattern);

        var _this4 = _possibleConstructorReturn(this, (ArrayExactPattern.__proto__ || Object.getPrototypeOf(ArrayExactPattern)).call(this, ArrayExactPattern._get_predicate_function(patterns)));

        _this4.patterns = patterns;
        return _this4;
    }

    _createClass(ArrayExactPattern, null, [{
        key: 'create',
        value: function create(patterns) {
            if (patterns instanceof Array) {
                return new ArrayExactPattern(patterns);
            } else {
                throw 'Must init with Array of patterns!';
            }
        }
    }, {
        key: '_get_predicate_function',
        value: function _get_predicate_function(patterns) {
            if (patterns instanceof Array) {
                return function (src) {
                    return src instanceof Array && src.length !== patterns.length && Array.from(patterns.entries()).every(function (_ref) {
                        var _ref2 = _slicedToArray(_ref, 2),
                            ind = _ref2[0],
                            p = _ref2[1];

                        return P.create(p).predicate(src[ind]);
                    });
                };
            } else {
                throw 'Must init with Array of patterns!';
            }
        }
    }]);

    return ArrayExactPattern;
}(SimplePattern);

var ArrayAllPattern = function (_SimplePattern4) {
    _inherits(ArrayAllPattern, _SimplePattern4);

    function ArrayAllPattern() {
        _classCallCheck(this, ArrayAllPattern);

        return _possibleConstructorReturn(this, (ArrayAllPattern.__proto__ || Object.getPrototypeOf(ArrayAllPattern)).apply(this, arguments));
    }

    _createClass(ArrayAllPattern, null, [{
        key: 'create',
        value: function create(pattern) {
            return new SimplePattern(function (src) {
                return src instanceof Array && src.every(function (e) {
                    return pattern.predicate(e);
                });
            });
        }
    }]);

    return ArrayAllPattern;
}(SimplePattern);

var ObjectPattern = function (_SimplePattern5) {
    _inherits(ObjectPattern, _SimplePattern5);

    function ObjectPattern(obj) {
        _classCallCheck(this, ObjectPattern);

        var _this6 = _possibleConstructorReturn(this, (ObjectPattern.__proto__ || Object.getPrototypeOf(ObjectPattern)).call(this, ObjectPattern._get_predicate_function(obj)));

        _this6.obj = obj;
        return _this6;
    }

    _createClass(ObjectPattern, null, [{
        key: 'create',
        value: function create(obj) {
            return new ObjectPattern(obj);
        }
    }, {
        key: '_get_predicate_function',
        value: function _get_predicate_function(obj) {
            return function (src) {
                return Object.entries(obj).every(function (_ref3) {
                    var _ref4 = _slicedToArray(_ref3, 2),
                        prop_name = _ref4[0],
                        predicator = _ref4[1];

                    return src instanceof Object && src.hasOwnProperty(prop_name) && P.create(predicator).predicate(src[prop_name]);
                });
            };
        }
    }]);

    return ObjectPattern;
}(SimplePattern);

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

var PatternCase = function PatternCase(pattern, mapper) {
    _classCallCheck(this, PatternCase);

    this.pattern = pattern;
    this.mapper = mapper;
};

var Case = function Case(predicate, mapper) {
    return new PatternCase(P.create(predicate), Mapper.create(mapper));
};

var P = function () {
    function P() {
        _classCallCheck(this, P);
    }

    _createClass(P, null, [{
        key: 'create',
        value: function create(p) {
            if (p instanceof PatternBase) {
                if (p.constructor.name === PatternBase.name) throw 'do not use pattern base directly';
                return p;
            } else if (p instanceof Array) {
                return ArrayExactPattern.create(p);
            } else if (p instanceof Function) {
                return SimplePattern.create(p);
            } else if (p instanceof Object) {
                return ObjectPattern.create(p);
            } else if (typeof p === 'string' && p[0] === '@') {
                return BindingPattern.create(function (x) {
                    return true;
                }, p.slice(1));
            } else if (typeof p === 'string' || typeof p === 'number' || typeof p === 'boolean' || p === null || p === undefined) {
                return LiteralEqualsPattern.create(p);
            }
            throw 'not supported yet !';
        }
    }, {
        key: 'as',
        value: function as(p, name) {
            // $FlowFixMe
            return P.create(p).as(name);
        }
    }]);

    return P;
}();

P.AcceptAllPattern = SimplePattern.create(function (x) {
    return true;
});
P.string = SimplePattern.create(function (x) {
    return typeof x === 'string';
});
P.greaterThanTen = SimplePattern.create(function (x) {
    return typeof x === 'number' && x > 10;
});
P.nonEmptyArr = SimplePattern.create(function (x) {
    return x instanceof Array && x.length > 0;
});


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

var Cases = {
    AcceptAllIdenticalMapCase: Case(P.AcceptAllPattern, Mappers.IdentityMapper),
    AcceptAllAlwaysThrowCase: Case(P.AcceptAllPattern, Mappers.AlwaysThrowMapper)
};

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

//
// const m = Matcher.create([
//     '123', x => console.log(x),
//     ['@whatever', '@anything'], x => console.log(x),
//     {code: '@code'}, x => console.log(x),
//     P.as(x => x === 100, 'goodname'), x => console.log(x),
//     '@final', x => console.log(x)
// ]);
//
//
// m.match(100);
// m.match('123');
// m.match([333, 999]);


var matcher = Matcher.create([[function (x) {
    return x > 100;
}, 'xixi'], 'Literal match [>100, xixi]', P.string, 'Your input is a string', function (x) {
    return x === 100;
}, function (x) {
    return x + 200;
}, 23333, 'exactly 23333', P.greaterThanTen, 'This is a number and is greater than ten', [P.string, P.greaterThanTen], 'Complicated array!', P.nonEmptyArr, 'nonempty array', {
    status: 200,
    content: P.string.as('ct')
}, function (src) {
    return '200 and have content! status code' + src.ct;
}, Cases.AcceptAllAlwaysThrowCase]);

// console.log(matcher.match(20));
// console.log(matcher.match('str'));
// console.log(matcher.match(23333));
// console.log(matcher.match([1, 2, 3]));
// console.log(matcher.match(100));
// console.log(matcher.match(['hi', 233]));
// console.log(matcher.match([99, 'xixi']));
// console.log(matcher.match({status: 200, content: 'xixi'}));
//

try {
    console.log(matcher.match(null));
} catch (e) {
    console.log('You get always throw! ' + e);
}

module.exports.acd = 123;