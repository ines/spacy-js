import { Doc } from '../tokens';
import { words, spaces, attrs } from '../../tests/util';

export default class Language {
    constructor(model, api) {
        return async function(text) {
            return new Doc(words, spaces, attrs);
        }
    }
}
