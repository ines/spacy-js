import Language from './language'
export { Doc, Token, Span } from './tokens'

export default {
    load: function(model, api) {
        return new Language(model, api);
    }
}
