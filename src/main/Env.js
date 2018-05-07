// @flow


class Env {
    static _envs = [{}];

    constructor() {
        throw 'abstract!';
    }

    static head() {
        return Env._envs[Env._envs.length - 1];
    }

    static put(name: string, value: any) {
        Env.head()[name] = value;
    }

    static dup_head() {
        Env._envs.push(Object.assign({}, Env.head()));
    }

    static pop() {
        return Env._envs.pop();
    }

    static flush() {
        Env._envs = [{}];
    }

}

module.exports = Env;
