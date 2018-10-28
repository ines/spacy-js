# coding: utf8
from __future__ import unicode_literals

import hug
from hug_middleware_cors import CORSMiddleware
import waitress
import spacy
import plac


MODELS = {}


@plac.annotations(
    models=("Comma-separated list of spaCy models", "positional", None, str),
    host=("Host to serve API", "option", "ho", str),
    port=("Port to serve API", "option", "p", int)
)
def main(models=None, host='0.0.0.0', port=8080):
    if not models:
        models = ['en_core_web_sm']
    else:
        models = [m.strip() for m in models.split(',')]
    for model in models:
        print("Loading model '{}'...".format(model))
        MODELS[model] = spacy.load(model)
    # Serving Hug API
    app = hug.API(__name__)
    app.http.add_middleware(CORSMiddleware(app))
    waitress.serve(__hug_wsgi__, port=port)



def doc2json(doc: spacy.tokens.Doc, model: str):
    json_doc = {
        'text': doc.text,
        'text_with_ws': doc.text_with_ws,
        'cats': doc.cats,
        'is_tagged': doc.is_tagged,
        'is_parsed': doc.is_parsed,
        'is_sentenced': doc.is_sentenced
    }
    ents = [{
        'start': ent.start,
        'end': ent.end,
        'label': ent.label_
    } for ent in doc.ents]
    sents = [{
        'start': sent.start,
        'end': sent.end
    } for sent in doc.sents]
    noun_chunks = [{
        'start': chunk.start,
        'end': chunk.end
    } for chunk in doc.noun_chunks]
    tokens = [{
        'text': token.text,
        'text_with_ws': token.text_with_ws,
        'whitespace': token.whitespace_,
        'orth': token.orth,
        'i': token.i,
        'ent_type': token.ent_type_,
        'ent_iob': token.ent_iob_,
        'lemma': token.lemma_,
        'norm': token.norm_,
        'lower': token.lower_,
        'shape': token.shape_,
        'prefix': token.prefix_,
        'suffix': token.suffix_,
        'pos': token.pos_,
        'tag': token.tag_,
        'dep': token.dep_,
        'is_alpha': token.is_alpha,
        'is_ascii': token.is_ascii,
        'is_digit': token.is_digit,
        'is_lower': token.is_lower,
        'is_upper': token.is_upper,
        'is_title': token.is_title,
        'is_punct': token.is_punct,
        'is_left_punct': token.is_left_punct,
        'is_right_punct': token.is_right_punct,
        'is_space': token.is_space,
        'is_bracket': token.is_bracket,
        'is_currency': token.is_currency,
        'like_url': token.like_url,
        'like_num': token.like_num,
        'like_email': token.like_email,
        'is_oov': token.is_oov,
        'is_stop': token.is_stop,
        'is_sent_start': token.is_sent_start,
        'head': token.head.i
    } for token in doc]
    return {
        'model': model,
        'doc': json_doc,
        'ents': ents,
        'sents': sents,
        'noun_chunks': noun_chunks,
        'tokens': tokens
    }


@hug.post('/parse')
def parse(model: str, text: str):
    nlp = MODELS[model]
    doc = nlp(text)
    return doc2json(doc, model)


@hug.post('/similarity')
def similarity(model: str, text1: str, text2: str):
    # We can always create Doc objects here, because the result is the same
    nlp = MODELS[model]
    doc1 = nlp(text1)
    doc2 = nlp(text2)
    return {'similarity': doc1.similarity(doc2)}


if __name__ == '__main__':
    plac.call(main)
