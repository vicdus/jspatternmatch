// @flow


const Matcher = require('./main/matcher');
const P = require('./main/pattern').P;
const Env = require('./main/Env');

const m = Matcher([
    {'a': {'b': '@b_val', 'c': '@c_val'}}, x => console.log(x),
    {'a': {'b': '_', 'd': '@d_val'}}, x => console.log(x)
]);


m.match({'a': {'b': 4, 'd': 2}});
console.log(Env._envs);

// const m = Matcher([
//     '123', x => console.log(x),
//     ['@whatever', '@anything'], x => console.log(x),
//     {code: '@code'}, x => console.log(x),
//     P.as(x => x === 100, 'goodname'), x => console.log(x),
//     '@final', x => console.log(x)
// ]);
//
//
// m.match(100);
// m.match('123');
// m.match([333, 999]);
//
//
// const matcher = Matcher([
//     [x => x > 100, 'xixi'], 'Literal match [>100, xixi]',
//     P.string, 'Your input is a string',
//     x => x === 100, x => x + 200,
//     23333, 'exactly 23333',
//     P.greaterThanTen, 'This is a number and is greater than ten',
//     [P.string, P.greaterThanTen], 'Complicated array!',
//     P.nonEmptyArr, 'nonempty array',
//     {
//         status: 200,
//         content: P.string.as('ct')
//     }, src => ('200 and have content! status code' + src.ct),
// ]);
//
//
// console.log(matcher.match(20));
// console.log(matcher.match('str'));
// console.log(matcher.match(23333));
// console.log(matcher.match([1, 2, 3]));
// console.log(matcher.match(100));
// console.log(matcher.match(['hi', 233]));
// console.log(matcher.match([99, 'xixi']));
// console.log(matcher.match({status: 200, content: 'xixi'}));
