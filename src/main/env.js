// @flow


class env {
    static _envs = [{}];

    constructor() {
        throw 'abstract!';
    }

    static head() {
        return env._envs[env._envs.length - 1];
    }

    static put(name: string, value: any) {
        env.head()[name] = value;
    }

    static dup_head() {
        env._envs.push(Object.assign({}, env.head()));
    }

    static pop() {
        return env._envs.pop();
    }

    static flush() {
        env._envs = [{}];
    }

}

module.exports = env;