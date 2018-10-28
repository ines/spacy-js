import spacy from '../src';
import { Doc, Token, Span } from '../src/tokens';
import { text, words, spaces, attrs } from './util'

jest.mock('../src/language');

const nlp = spacy.load('en_core_web_sm');

test('allows manual construction', async () => {
    const doc = await nlp(text);
    const span = new Span(doc, 6, 9);
    expect(span).toBeInstanceOf(Span);
    expect(span.text).toBe('sentence about Facebook');
});

test('allows being sliced off Doc', async () => {
    const doc = await nlp(text);
    const span = doc.slice(6, 9);
    expect(span).toBeInstanceOf(Span);
    expect(span.text).toBe('sentence about Facebook');
});

test('has Span attributes', async () => {
    const doc = await nlp(text);
    const span = doc.slice(6, 9);
    expect(span.toString()).toBe('sentence about Facebook');
    expect(span.length).toBe(3);
    expect(span.start).toBe(6);
    expect(span.end).toBe(9);
    expect(span.label).toBeUndefined();
});

test('has parent Doc', async() => {
    const doc = await nlp(text);
    const span = doc.slice(6, 9);
    expect(span.doc).toBeInstanceOf(Doc);
    expect(span.doc).toBe(doc);
});

test('has entity label', async () => {
    const doc = await nlp(text);
    const span = doc.slice(8, 9);
    expect(span.toString()).toBe('Facebook');
    expect(span.label).toBe('ORG');
});

test('allows token indexing', async () => {
    const doc = await nlp(text);
    const span = doc.slice(6, 9);
    for (let i = 0; i < span.length; i++) {
        expect(span[i]).toBeInstanceOf(Token);
    }
    expect(span[span.length + 1]).toBeUndefined();
});

test('allows token iteration', async () => {
    const doc = await nlp(text);
    const span = doc.slice(6, 9);
    for (let token of span) {
        expect(token).toBeInstanceOf(Token);
    }
});
