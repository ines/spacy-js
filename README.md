<a href="https://explosion.ai"><img src="https://explosion.ai/assets/img/logo.svg" width="125" height="125" align="right" /></a>

# spaCy JS

[![npm](https://img.shields.io/npm/v/spacy.svg?style=flat-square)](https://www.npmjs.com/package/spacy)
[![GitHub](https://img.shields.io/github/release/ines/spacy-js/all.svg?style=flat-square)](https://github.com/ines/spacy-js)
[![unpkg](https://img.shields.io/badge/unpkg-dist/index.js-brightgreen.svg?style=flat-square)](https://unpkg.com/spacy)


JavaScript interface for accessing linguistic annotations provided by
[spaCy](https://spacy.io). This project is mostly experimental and was
developed for fun to play around with different ways of mimicking spaCy's
Python API.

The results will still be computed in Python and made available via a REST API.
The JavaScript API resembles spaCy's Python API as closely as possible (with
a few exceptions, as the values are all pre-computed and it's tricky to express
complex recursive relationships).

```javascript
const spacy = require('spacy');

(async function() {
    const nlp = spacy.load('en_core_web_sm');
    const doc = await nlp('This is a text about Facebook.');
    for (let ent of doc.ents) {
        console.log(ent.text, ent.label);
    }
    for (let token of doc) {
        console.log(token.text, token.pos, token.head.text);
    }
})();
```

## ⌛️ Installation

### Installing the JavaScript library

You can install the JavaScript package via npm:

```bash
npm install spacy
```

### Setting up the Python server

First, clone this repo and install the requirements. If you've installed the
package via npm, you can also use the `api/server.py` and `requirements.txt` in
your `./node_modules/spacy` directory. It's recommended to use a virtual
environment.

```bash
pip install -r requirements.txt
```

You can then run the REST API. By default, this will serve the API via
`0.0.0.0:8080`:

```bash
python api/server.py
```

If you like, you can install more [models](https://spacy.io/models) and specify
a comma-separated list of models to load as the first argument when you run
the server. All models need to be installed in the same environment.

```bash
python api/server.py en_core_web_sm,de_core_news_sm
```

| Argument | Type | Description | Default |
| --- | --- | --- | --- |
| `models` | positional (str) | Comma-separated list of models to load and make available. | `en_core_web_sm` |
| `--host`, `-ho` | option (str) | Host to serve the API. | `0.0.0.0` |
| `--port`, `-p` | option (int) | Port to server the API. | `8080` |

## 🎛 API

### `spacy.load`

"Load" a spaCy model. This method mostly exists for consistency with the Python
API. It sets up the REST API and `nlp` object, but doesn't actually load
anything, since the models are already available via the REST API.

```javascript
const nlp = spacy.load('en_core_web_sm');
```

| Argument | Type | Description |
| --- | --- | --- |
| `model` | String | Name of model to load, e.g. `'en_core_web_sm'`. Needs to be available via the REST API. |
| `api` | String | Alternative URL of REST API. Defaults to `http://0.0.0.0:8080`. |
| **RETURNS** | [`Language`](src/language.js) | The `nlp` object. |

### `nlp` <kbd>async</kbd>

The `nlp` object created by `spacy.load` can be called on a string of text
and makes a request to the REST API. The easiest way to use it is to wrap the
call in an `async` function and use `await`:

```javascript
async function() {
    const nlp = spacy.load('en_core_web_sm');
    const doc = await nlp('This is a text.');
}
```

| Argument | Type | Description |
| --- | --- | --- |
| `text` | String | The text to process. |
| **RETURNS** | [`Doc`](src/doc.js) | The processed `Doc`. |

### `Doc`

Just like [in the original API](https://spacy.io/api/doc), the `Doc` object can
be constructed with an array of `words` and `spaces`. It also takes an
additional `attrs` object, which corresponds to the JSON-serialized linguistic
annotations created in [`doc2json` in `api/server.py`](api/server.py).

The `Doc` behaves just like the regular spaCy `Doc` – you can iterate over its
tokens, index into individual tokens, access the `Doc` attributes and properties
and also use native JavaScript methods like `map` and `slice` (since there's no
real way to make Python's slice notation like `doc[2:4]` work).

#### Construction

```javascript
import { Doc } from 'spacy';

const words = ['Hello', 'world', '!'];
const spaces = [true, false, false];
const doc = Doc(words, spaces)
console.log(doc.text) // 'Hello world!'
```

| Argument | Type | Description |
| --- | --- | --- |
| `words` | Array | The individual token texts. |
| `spaces` | Array | Whether the token at this position is followed by a space or not. |
| `attrs` | Object | JSON-serialized attributes, see [`doc2json`](api/server.py). |
| **RETURNS** | [`Doc`](src/tokens.js) | The newly constructed `Doc`. |

#### Symbol iterator and token indexing

```javascript
async function() {
    const nlp = spacy.load('en_core_web_sm');
    const doc = await nlp('Hello world');

    for (let token of doc) {
        console.log(token.text);
    }
    // Hello
    // world

    const token1 = doc[0];
    console.log(token1.text);
    // Hello
}
```

#### Properties and Attributes

| Name | Type | Description |
| --- | --- | --- |
| `text` | String | The `Doc` text. |
| `length` | Number | The number of tokens in the `Doc`. |
| `ents` | Array | A list of [`Span`](src/tokens.js) objects, describing the named entities in the `Doc`. |
| `sents` | Array | A list of [`Span`](src/tokens.js) objects, describing the sentences in the `Doc`. |
| `nounChunks` | Array | A list of [`Span`](src/tokens.js) objects, describing the base noun phrases in the `Doc`. |
| `cats` | Object | The document categories predicted by the text classifier, if available in the model. |
| `isTagged` | Boolean | Whether the part-of-speech tagger has been applied to the `Doc`. |
| `isParsed` | Boolean | Whether the dependency parser has been applied to the `Doc`. |
| `isSentenced` | Boolean | Whether the sentence boundary detector has been applied to the `Doc`. |

### `Span`

A `Span` object is a slice of a `Doc` and contains of one or more tokens. Just
like [in the original API](https://spacy.io/api/span), it can be constructed
from a `Doc`, a start and end index and an optional label, or by slicing a `Doc`.

#### Construction

```javascript
import { Doc, Span } from 'spacy';

const doc = Doc(['Hello', 'world', '!'], [true, false, false]);
const span = Span(doc, 1, 3);
console.log(span.text) // 'world!'
```

| Argument | Type | Description |
| --- | --- | --- |
| `doc` | `Doc` | The reference document. |
| `start` | Number | The start token index. |
| `end` | Number | The end token index. This is *exclusive*, i.e. "up to token X". |
| `label` | String | Optional label. |
| **RETURNS** | [`Span`](src/tokens.js) | The newly constructed `Span`. |

#### Properties and Attributes

| Name | Type | Description |
| --- | --- | --- |
| `text` | String | The `Span` text. |
| `length` | Number | The number of tokens in the `Span`. |
| `doc` | `Doc` | The parent `Doc`. |
| `start` | Number | The `Span`'s start index in the parent document. |
| `end` | Number | The `Span`'s end index in the parent document. |
| `label` | String | The `Span`'s label, if available. |

### `Token`

For token attributes that exist as string and ID versions (e.g. `Token.pos` vs.
`Token.pos_`), only the string versions are exposed.

#### Usage Examples

```javascript
async function() {
    const nlp = spacy.load('en_core_web_sm');
    const doc = await nlp('Hello world');

    for (let token of doc) {
        console.log(token.text, token.pos, token.isLower);
    }
    // Hello INTJ false
    // world NOUN true
}
```

#### Properties and Attributes

| Name | Type | Description |
| --- | --- | --- |
| `text` | String | The token text. |
| `whitespace` | String | Whitespace character following the token, if available. |
| `textWithWs` | String | Token text with training whitespace. |
| `orth` | Number | ID of the token text. |
| `doc` | `Doc` | The parent `Doc`. |
| `head` | `Token` | The syntactic parent, or "governor", of this token. |
| `i` | Number | Index of the token in the parent document. |
| `entType` | String | The token's named entity type. |
| `entIob` | String | IOB code of the token's named entity tag. |
| `lemma` | String | The token's lemma, i.e. the base form. |
| `norm` | String | The normalised form of the token. |
| `lower` | String | The lowercase form of the token. |
| `shape` | String | Transform of the tokens's string, to show orthographic features. For example, "Xxxx" or "dd". |
| `prefix` | String | A length-N substring from the start of the token. Defaults to `N=1`. |
| `suffix` | String | Length-N substring from the end of the token. Defaults to `N=3`. |
| `pos` | String | The token's coarse-grained part-of-speech tag. |
| `tag` | String | The token's fine-grained part-of-speech tag. |
| `isAlpha` | Boolean | Does the token consist of alphabetic characters? |
| `isAscii` | Boolean | Does the token consist of ASCII characters? |
| `isDigit` | Boolean | Does the token consist of digits? |
| `isLower` | Boolean | Is the token lowercase? |
| `isUpper` | Boolean | Is the token uppercase? |
| `isTitle` | Boolean | Is the token titlecase? |
| `isPunct` | Boolean | Is the token punctuation? |
| `isLeftPunct` | Boolean | Is the token left punctuation? |
| `isRightPunct` | Boolean | Is the token right punctuation? |
| `isSpace` | Boolean | Is the token a whitespace character? |
| `isBracket` | Boolean | Is the token a bracket? |
| `isCurrency` | Boolean | Is the token a currency symbol? |
| `likeUrl` | Boolean | Does the token resemble a URL? |
| `likeNum` | Boolean | Does the token resemble a number? |
| `likeEmail` | Boolean | Does the token resemble an email address? |
| `isOov` | Boolean | Is the token out-of-vocabulary? |
| `isStop` | Boolean | Is the token a stop word? |
| `isSentStart` | Boolean | Does the token start a sentence? |

## 🔔 Run Tests

### Python

First, make sure you have `pytest` and all dependencies installed. You can then
run the tests by pointing `pytest` to [`/tests`](/tests):

```bash
python -m pytest tests
```

### JavaScript

This project uses [Jest](https://jestjs.io) for testing. Make sure you have
all dependencies and development dependencies installed. You can then run:

```bash
npm run test
```

To allow testing the code without a REST API providing the data, the test suite
currently uses a [mock of the `Language` class](src/__mocks__), which returns
static data located in [`tests/util.js`](tests/util.js).

## ✅ Ideas and Todos

- [ ] Add Travis CI integration.
- [ ] Improve JavaScript tests.
- [ ] Experiment with NodeJS bindings to make Python integration easier. To be fair, running a separate API in an environment controlled by the user and *not* hiding it a few levels deep is often much easier. But maybe there are some modern Node tricks that this project could benefit from.
