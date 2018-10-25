import Language from './language'

export default {
    load: function(model) {
        return new Language(model);
    }
}
