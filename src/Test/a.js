// @flow


class A {
    constructor() {
    }

    foo() {
        console.log('I am A');
    }

    static getInstance(): A {
        return new A();
    }
}

module.exports = A;
