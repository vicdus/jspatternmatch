// @flow


class Env {
    static _envs = [{}];

    constructor() {
        throw 'abstract!';
    }

    static head(): Object {
        return Env._envs[Env._envs.length - 1];
    }

    static put(name: string, value: any): void {
        Env.head()[name] = value;
    }

    static dup_head(): void {
        Env._envs.push(Object.assign({}, Env.head()));
    }

    static pop(): Object {
        return Env._envs.pop();
    }

    static flush(): void {
        Env._envs = [{}];
    }

    static reset_head(): void {
        Env._envs[Env._envs.length - 1] = {};
    }
}

module.exports = Env;
