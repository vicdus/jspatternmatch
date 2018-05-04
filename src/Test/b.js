// @flow


const A = require('./a.js');


const X = (p: A) => {
    console.log('xixi');
};


A.getInstance().foo();

X(A.getInstance());











