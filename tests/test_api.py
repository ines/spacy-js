# coding: utf8
from __future__ import unicode_literals

import pytest
import spacy
import json

from api.server import parse, doc2json


@pytest.fixture(scope='session')
def model():
    return 'en_core_web_sm'


@pytest.fixture(scope='session')
def text():
    return 'This is a sentence about Facebook. This is another one.'


@pytest.fixture(scope='session')
def nlp(model):
    return spacy.load(model)


@pytest.fixture(scope='session')
def doc(nlp, text):
    return nlp(text)


def test_server_parse(model, text, doc):
    json_doc = parse(model, text)
    direct_json_doc = doc2json(doc, model)
    assert json.dumps(json_doc, sort_keys=True) == json.dumps(direct_json_doc, sort_keys=True)


def test_doc2json_doc_tokens(doc, model):
    data = doc2json(doc, model)
    assert data['model'] == model
    assert data['doc']['text'] == doc.text
    assert data['doc']['text_with_ws'] == doc.text_with_ws
    assert data['doc']['is_tagged']
    assert data['doc']['is_parsed']
    assert data['doc']['is_sentenced']
    assert len(data['tokens']) == len(doc)
    assert data['tokens'][0]['text'] == doc[0].text
    assert data['tokens'][0]['head'] == doc[0].head.i


def test_doc2json_doc_ents(doc, model):
    data = doc2json(doc, model)
    ents = list(doc.ents)
    assert 'ents' in data
    assert len(data['ents']) == len(ents)
    assert len(data['ents']) >= 1
    assert data['ents'][0]['start'] == ents[0].start
    assert data['ents'][0]['end'] == ents[0].end
    assert data['ents'][0]['label'] == ents[0].label_


def test_doc2json_doc_sents(doc, model):
    data = doc2json(doc, model)
    sents = list(doc.sents)
    assert 'sents' in data
    assert len(data['sents']) == len(sents)
    assert len(data['sents']) >= 1
    assert data['sents'][0]['start'] == sents[0].start
    assert data['sents'][0]['end'] == sents[0].end


def test_doc2json_doc_noun_chunks(doc, model):
    data = doc2json(doc, model)
    chunks = list(doc.noun_chunks)
    assert 'noun_chunks' in data
    assert len(data['noun_chunks']) == len(chunks)
    assert len(data['noun_chunks']) >= 1
    assert data['noun_chunks'][0]['start'] == chunks[0].start
    assert data['noun_chunks'][0]['end'] == chunks[0].end
