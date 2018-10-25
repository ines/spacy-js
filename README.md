<a href="https://explosion.ai"><img src="https://explosion.ai/assets/img/logo.svg" width="125" height="125" align="right" /></a>

# spaCy JS

## Installation

```bash
# Install the requirements
pip install -r requirements.txt

# Run the REST API
python app.py
```

## Example usage

```javascript
import spacy from './spacy';

(async function() {
    const nlp = spacy.load('en_core_web_sm');
    const doc = await nlp('This is a text about Facebook.');
    for (let ent of doc.ents) {
        console.log(ent.text, ent.label)
    }
    for (let token of doc) {
        console.log(token.text, token.pos, token.head.text);
    }

    const doc2 = await nlp("Bla bla Yolo")
    console.log('Similarity', await doc.similarity(doc2[1]))
})()
```
