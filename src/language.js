import { Doc } from './tokens';
import { makeRequest } from './util';

export default class Language {
    constructor(model, api = 'http://localhost:8080') {
        const self = this;
        return async function(text) {
            const { words, spaces, attrs } = await self.makeDoc(model, text, api);
            return new Doc(words, spaces, attrs);
        }
    }

    async makeDoc(model, text, api) {
        const json = await makeRequest(api, 'parse', { model, text })
        const words = json.tokens.map(({ text }) => text);
        const spaces = json.tokens.map(({ whitespace }) => Boolean(whitespace));
        return { words, spaces, attrs: Object.assign({}, json, { api }) }
    }
}
