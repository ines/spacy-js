import spacy from '../src';
import { Doc, Token, Span } from '../src/tokens';
import { text, words, spaces, attrs } from './util'

jest.mock('../src/language');

const nlp = spacy.load('en_core_web_sm');

test('allows manual construction', () => {
    const doc = new Doc(words, spaces, attrs);
    expect(doc).toBeInstanceOf(Doc);
});

test('has Doc attributes', async () => {
    const doc = await nlp(text);
    expect(doc.text).toBe(text);
    expect(doc.toString()).toBe(text);
    expect(doc.length).toBe(10);
    expect(doc.cats).toEqual({});
    expect(doc.isTagged).toBe(true);
    expect(doc.isParsed).toBe(true);
    expect(doc.isSentenced).toBe(true);
});

test('allows token indexing', async () => {
    const doc = await nlp(text);
    for (let i = 0; i < doc.length; i++) {
        expect(doc[i]).toBeInstanceOf(Token);
    }
    expect(doc[doc.length + 1]).toBeUndefined();
});

test('allows token iteration', async () => {
    const doc = await nlp(text);
    for (let token of doc) {
        expect(token).toBeInstanceOf(Token);
    }
});

test('has named entities (doc.ents)', async () => {
    const doc = await nlp(text);
    expect(doc.ents).toBeInstanceOf(Array);
    expect(doc.ents).toEqual(expect.arrayContaining([ expect.any(Span) ]));
    expect(doc.ents.length).toBe(1);
    const entity = doc.ents[0];
    expect(entity).toBeInstanceOf(Span);
    expect(entity.text).toBe('Facebook');
    expect(entity.start).toBe(8);
    expect(entity.end).toBe(9);
    expect(entity.label).toBe('ORG');
});

test('has sentences (doc.sents)', async () => {
    const doc = await nlp(text);
    expect(doc.sents).toBeInstanceOf(Array);
    expect(doc.sents).toEqual(expect.arrayContaining([ expect.any(Span) ]));
    expect(doc.sents.length).toBe(2);
    const sentence = doc.sents[0];
    expect(sentence).toBeInstanceOf(Span);
    expect(sentence.text).toBe('Hello world!');
    expect(sentence.start).toBe(0);
    expect(sentence.end).toBe(3);
});

test('has noun chunks (doc.noun_chunks)', async () => {
    const doc = await nlp(text);
    expect(doc.nounChunks).toBeInstanceOf(Array);
    expect(doc.nounChunks).toEqual(expect.arrayContaining([ expect.any(Span) ]));
    expect(doc.nounChunks.length).toBe(3);
    const chunk = doc.nounChunks[0];
    expect(chunk).toBeInstanceOf(Span);
    expect(chunk.text).toBe('Hello world');
    expect(chunk.start).toBe(0);
    expect(chunk.end).toBe(2);
});
