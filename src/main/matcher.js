// @flow


const PatternCase = require('./PatternCase');
const Case = require('./case');
const Env = require('./Env');
const P = require('./P');


class PatternMatcher {
    cases: Array<PatternCase>;

    constructor(cases: Array<PatternCase>) {
        this.cases = cases;
    }

    match(src: any) {
        const found = this.cases.find(c => c.pattern.predicate(src));
        if (found) {
            // TODO: this is wrong, fix to support nested matching.
            const cur_env = Env.pop();
            const res = found.mapper.map_func(Object.keys(cur_env).length === 0 ? src : cur_env);
            Env.flush();
            return res;
        } else {
            throw 'No match!';
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
                cases.push(Case(temp, e));
                temp = null;
            } else if (temp === null) {
                temp = P.create(e);
            } else {
                throw 'bad init';
            }
        });
        return new PatternMatcher(cases);
    }
}


const Matcher = (items: Array<any>) => PatternMatcher.create(items);

module.exports = Matcher;
