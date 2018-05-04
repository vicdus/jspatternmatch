'use strict';

var A = require('./a.js');

var X = function X(p) {
    console.log('xixi');
};

A.getInstance().foo();

X(A.getInstance());