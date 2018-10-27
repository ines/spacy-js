'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fetch = _interopDefault(require('node-fetch'));
var url = _interopDefault(require('url'));

async function makeRequest(api, endpoint, opts, method = 'POST') {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };
  const credentials = 'same-origin';
  const body = JSON.stringify(opts);
  const apiUrl = url.resolve(api, endpoint);

  try {
    const res = await fetch(apiUrl, {
      method,
      headers,
      credentials,
      body
    });
    return await res.json();
  } catch (err) {
    console.log(`Error fetching data from API: ${api}`);
  }
}
async function getSimilarity(api, model, text1, text2) {
  const json = await makeRequest(api, '/similarity', {
    model,
    text1,
    text2
  });
  return json.similarity;
}

class Doc {
  constructor(words, spaces, attrs = {}) {
    this._doc = attrs.doc || {};
    this._tokens = attrs.tokens || [];
    this._ents = attrs.ents || [];
    this._sents = attrs.sents || [];
    this._chunks = attrs.chunks || [];
    this._model = attrs.model;
    this._api = attrs.api;
    this.tokens = words.map((word, i) => new Token(this, word, spaces[i], this._tokens[i]));

    for (let i = 0; i < this.tokens.length; i++) {
      this[i] = this.tokens[i];
    }

    this.cats = this._doc.cats;
    this.isTagged = this._doc.is_tagged;
    this.isParsed = this._doc.is_parsed;
    this.isSentenced = this._doc.is_sentenced;
  }

  inspect() {
    return this.text;
  }

  get text() {
    let text = '';

    for (let token of this.tokens) {
      text += token.textWithWs;
    }

    return text;
  }

  get length() {
    return this.tokens.length;
  }

  get ents() {
    return this._ents.map(({
      start,
      end,
      label
    }) => new Span(this, start, end, label));
  }

  get sents() {
    return this._sents.map(({
      start,
      end
    }) => new Span(this, start, end));
  }

  get nounChunks() {
    return this._chunks.map(({
      start,
      end
    }) => new Span(this, start, end));
  }

  *[Symbol.iterator]() {
    let i = 0;

    while (this.tokens[i] !== undefined) {
      yield this.tokens[i];
      ++i;
    }
  }

  toString() {
    return this.text;
  }

  map(func) {
    let tokens = [];

    for (let token of this) {
      tokens.push(func(token));
    }

    return tokens;
  }

  slice(start, end) {
    return new Span(this, start, end);
  }

  async similarity(obj) {
    return await getSimilarity(this._api, this._model, this.text, obj.text);
  }

}
class Span {
  constructor(doc, start, end, label) {
    this.doc = doc;
    this.start = start;
    this.end = end;
    this.label = label;
    this.tokens = [...this.doc].slice(this.start, this.end);

    for (let i = 0; i < this.tokens.length; i++) {
      this[i] = this.tokens[0];
    }
  }

  get text() {
    let text = '';

    for (let token of this.tokens) {
      text += token.textWithWs;
    }

    return text;
  }

  get length() {
    return this.tokens.length;
  }

  *[Symbol.iterator]() {
    let i = 0;

    while (this.tokens[i] !== undefined) {
      yield this.tokens[i];
      ++i;
    }
  }

  slice(start, end) {
    return new Span(this, start, end);
  }

  toString() {
    return this.text;
  }

  inspect() {
    return this.text;
  }

  async similarity(obj) {
    return await getSimilarity(this.doc._api, this.doc._model, this.text, obj.text);
  }

}
class Token {
  constructor(doc, word, space, attrs = {}) {
    this.doc = doc;
    this.whitespace = space ? ' ' : '';
    this.text = word;
    this.textWithWs = this.text + this.whitespace;
    this.orth = attrs.orth;
    this.i = attrs.i;
    this.entType = attrs.ent_type;
    this.entIob = attrs.ent_iob;
    this.lemma = attrs.lemma;
    this.norm = attrs.norm;
    this.lower = attrs.lower;
    this.shape = attrs.shape, this.prefix = attrs.prefix;
    this.suffix = attrs.suffix;
    this.pos = attrs.pos;
    this.tag = attrs.tag;
    this.dep = attrs.dep;
    this.lang = attrs.lang;
    this.isAlpha = attrs.is_alpha;
    this.isAscii = attrs.is_ascii;
    this.isDigit = attrs.is_digit;
    this.isLower = attrs.is_lower;
    this.isUpper = attrs.is_upper;
    this.isTitle = attrs.is_title;
    this.isPunct = attrs.is_punct;
    this.isLeftPunct = attrs.is_left_punct;
    this.isRightPunct = attrs.is_right_punct;
    this.isSpace = attrs.is_space;
    this.isBracket = attrs.is_bracket;
    this.isCurrency = attrs.is_currency;
    this.likeUrl = attrs.like_url;
    this.likeNum = attrs.like_num;
    this.likeEmail = attrs.like_email;
    this.isOov = attrs.is_oov;
    this.isStop = attrs.is_stop;
    this.isSentStart = attrs.is_sent_start;
    this._head = attrs.head;
  }

  get head() {
    return this.doc[this._head];
  }

  toString() {
    return this.text;
  }

  inspect() {
    return this.text;
  }

  async similarity(obj) {
    return await getSimilarity(this.doc._api, this.doc._model, this.text, obj.text);
  }

}

class Language {
  constructor(model, api = 'http://localhost:8080') {
    const self = this;
    return async function (text) {
      const {
        words,
        spaces,
        attrs
      } = await self.makeDoc(model, text, api);
      return new Doc(words, spaces, attrs);
    };
  }

  async makeDoc(model, text, api) {
    const json = await makeRequest(api, 'parse', {
      model,
      text
    });
    const words = json.tokens.map(({
      text
    }) => text);
    const spaces = json.tokens.map(({
      whitespace
    }) => Boolean(whitespace));
    return {
      words,
      spaces,
      attrs: Object.assign({}, json, {
        api
      })
    };
  }

}

var index = {
  load: function (model, api) {
    return new Language(model, api);
  }
};

module.exports = index;
