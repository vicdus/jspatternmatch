const Matcher = require('../main/matcher');
const P = require('../main/P');
const REST = require('../main/pattern').REST;

test('Literal match', () => {
    const m = Matcher.create([
            'literal string', 'Your result is Literal String',
            16, x => x * 2,
            undefined, 'Something undefined!',
            null, 'nullable thing'
        ]
    );
    expect(m.match('literal string')).toEqual('Your result is Literal String');
    expect(m.match(16)).toEqual(32);
    expect(m.match(undefined)).toEqual('Something undefined!');
    expect(() => m.match('NO_MATCH')).toThrow('No match!');
});


test('Object match', () => {
    const m = Matcher.create([
            {status: 200, type: 'text', content: '@some_content'}, e => e.some_content,
            {status: 404}, 'NOT FOUND!'
        ]
    );
    expect(m.match({status: 200, type: 'text', content: 'hello world!'})).toEqual('hello world!');
    expect(m.match({status: 404, errmsg: 'err'})).toEqual('NOT FOUND!');

    expect(() => m.match({status: 200, type: 'text'})).toThrow('No match!');
    expect(() => m.match({status: 500})).toThrow('No match!');
    expect(() => m.match({})).toThrow('No match!');
});


test('Array match', () => {
    const m = Matcher.create([
            [1, 2, 3], 'one two three',
            [0, REST], 'array that start with zero',
        ]
    );

    expect(m.match([1, 2, 3])).toEqual('one two three');
    expect(() => m.match([1, 2, 3, 4])).toThrow('No match!');
    expect(() => m.match([1, 2])).toThrow('No match!');
    expect(m.match([0, 233, null, 'string'])).toEqual('array that start with zero');
});


test('Array match with binding', () => {
    const m = Matcher.create([
            [1, 2, 3], 'one two three',
            [0, '@second', REST.as('third_and_rest')], env => {
                return {'second': env.second, 'rest': env.third_and_rest};
            },
            [1, 3, 5], src => src.map(num => num * num)
        ]
    );

    expect(m.match([1, 2, 3])).toEqual('one two three');
    expect(m.match([0, 233, null, 'string'])).toEqual({second: 233, rest: [null, 'string']});
    expect(m.match([1, 3, 5])).toEqual([1, 9, 25]);


    expect(() => m.match([1, 2, 3, 4])).toThrow('No match!');
    expect(() => m.match([1, 2])).toThrow('No match!');
});





