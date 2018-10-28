import spacy from '../src';

jest.mock('../src/language');

test('creates new nlp object', () => {
    const nlp = spacy.load('en_core_web_sm');
    expect(nlp).toEqual(expect.any(Function));
});
