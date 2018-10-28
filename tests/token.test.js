import spacy from '../src';
import { Doc, Token, Span } from '../src/tokens';
import { text, words, spaces, attrs } from './util'

jest.mock('../src/language');

const nlp = spacy.load('en_core_web_sm');

test('allows manual construction', async () => {
    const doc = await nlp(text);
    const token = new Token(doc, words[7], spaces[7], attrs.tokens[7]);
    expect(token).toBeInstanceOf(Token);
    expect(token.text).toBe('about');
});

test('allows indexing from Doc', async () => {
    const doc = await nlp(text);
    const token = doc[7];
    expect(token.text).toBe('about');
});

test('has Token attributes', async () => {
    const doc = await nlp(text);
    const token = doc[7];
    expect(token.length).toBe(5);
    expect(token.toString()).toBe('about');
    expect(token.text).toBe('about');
    expect(token.textWithWs).toBe('about ');
    expect(token.whitespace).toBe(' ');
    expect(token.orth).toBe(942632335873952620);
    expect(token.i).toBe(7);
    expect(token.entType).toBe('');
    expect(token.entIob).toBe('O');
    expect(token.lemma).toBe('about');
    expect(token.norm).toBe('about');
    expect(token.lower).toBe('about');
    expect(token.shape).toBe('xxxx');
    expect(token.prefix).toBe('a');
    expect(token.suffix).toBe('out');
    expect(token.pos).toBe('ADP');
    expect(token.tag).toBe('IN');
    expect(token.dep).toBe('prep');
    expect(token.isAlpha).toBe(true);
    expect(token.isAscii).toBe(true);
    expect(token.isDigit).toBe(false);
    expect(token.isLower).toBe(true);
    expect(token.isUpper).toBe(false);
    expect(token.isTitle).toBe(false);
    expect(token.isPunct).toBe(false);
    expect(token.isLeftPunct).toBe(false);
    expect(token.isRightPunct).toBe(false);
    expect(token.isSpace).toBe(false);
    expect(token.isBracket).toBe(false);
    expect(token.isCurrency).toBe(false);
    expect(token.likeUrl).toBe(false);
    expect(token.likeNum).toBe(false);
    expect(token.likeEmail).toBe(false);
    expect(token.isOov).toBe(true);
    expect(token.isStop).toBe(true);
    expect(token.isSentStart).toBe(null);
});

test('has parent Doc', async() => {
    const doc = await nlp(text);
    const token = doc[7];
    expect(token.doc).toBeInstanceOf(Doc);
    expect(token.doc).toBe(doc);
});

test('has head', async () => {
    const doc = await nlp(text);
    const head = doc[7].head;
    expect(head).toBeInstanceOf(Token);
    expect(head.i).toBe(6);
    expect(head.text).toBe('sentence');
});
