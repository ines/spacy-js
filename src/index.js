import Language from './language'

export default {
    load: function(model, api) {
        return new Language(model, api);
    }
}
