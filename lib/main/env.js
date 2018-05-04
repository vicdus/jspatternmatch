'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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


module.exports = env;