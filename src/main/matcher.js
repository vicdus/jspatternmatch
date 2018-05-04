// @flow

const PatternCase = require('./case').PatternCase;
const Case = require('./case').Case;
const env = require('./env');
const P = require('./pattern').P;


class Matcher {
    cases: Array<PatternCase>;

    constructor(cases: Array<PatternCase>) {
        this.cases = cases;
    }

    match(src: any) {
        const found = this.cases.find(c => c.pattern.predicate(src));
        if (found) {
            console.log('mapfunc = ', found.mapper.map_func);
            const cur_env = env.pop();
            const res = found.mapper.map_func(Object.keys(cur_env).length === 0 ? src : cur_env);
            env.flush();
            return res;
        } else {
            throw 'Not match!';
        }
    };

    static create(items: Array<any>) {
        const cases = [];
        let temp = null;
        items.forEach(e => {
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
}

