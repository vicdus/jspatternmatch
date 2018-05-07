// @flow


class PatternBase {
    predicate(src: any): boolean {
        throw 'do not use base predicate';
    }

    static create(predicate: any) {
        throw 'please implement create function';
    }
}


module.exports = PatternBase;
