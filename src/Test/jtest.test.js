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
    expect(() => m.match({status: 200, type: 'text'})).toThrow('No match!');
    expect(m.match({status: 404, errmsg: 'err'})).toEqual('NOT FOUND!');
    expect(() => m.match({})).toThrow('No match!');
});


test('Array match', () => {
    const m = Matcher.create([
            [1, 2, 3], 'one two three',
            [0, REST.as('rest_items')], env => env.rest_items,
        ]
    );

    expect(m.match([1, 2, 3])).toEqual('one two three');
    expect(m.match([0, 233, null, 'string'])).toEqual([233, null, 'string']);
});



