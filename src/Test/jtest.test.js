const Matcher = require('../main/matcher');
const P = require('../main/P');


test('Literal match', () => {
    const m = Matcher.create([
            'literal string', 'Your result is Literal String',
            16, x => x * 2,
            undefined, 'Something undefined!',
            null, 'nullable thing'
        ]
    );
    expect(m.match('literal string')).toBe('Your result is Literal String');
    expect(m.match(16)).toBe(32);
    expect(m.match(undefined)).toBe('Something undefined!');
    expect(() => m.match('NO_MATCH')).toThrow('No match!');
});


test('Object match', () => {
    const m = Matcher.create([
            {status: 200, type: 'text', content: '@some_content'}, e => e.some_content,
            {status: 404}, 'NOT FOUND!'
        ]
    );
    expect(m.match({status: 200, type: 'text', content: 'hello world!'})).toBe('hello world!');
    expect(() => m.match({status: 200, type: 'text'})).toThrow('No match!');
    expect(m.match({status: 404, errmsg: 'err'})).toBe('NOT FOUND!');
    expect(() => m.match({})).toThrow('No match!');
});







