const _ = require('lodash');
/**
 * Calls the appropriate font parser for a given provider (Google, etc.)
 *
 * @param value
 * @param type
 * @returns string or null
 */
function stencilFont(value, type) {
    const provider = value.split('_')[0];

    switch (provider) {
    case 'Google':
        return googleFontParser(value, type);
    default:
        return defaultFontParser(value, type);
    }
}

/**
 * Removes "Google_" from the value and calls the default parser
 * Expects the value in the config has a family_weight structure.
 * Eg value: "Google_Open+Sans_700", "Google_Open+Sans", "Google_Open+Sans_400_sans", "Google_Open+Sans_400,700_sans"
 * @param value
 * @param type - 'family' or 'weight'
 * @returns {*}
 */
function googleFontParser(value, type) {
    // Splitting the value
    // Eg: 'Google_Open+Sans_700' -> [Google, Open+Sans, 700]
    value = value.split('_');

    // Removing the Google value
    // Eg: [Google, Open+Sans, 700] -> [Open+Sans, 700]
    value = value.splice(1);

    // Join the value again
    // Eg: [Open+Sans, 700] -> 'Open+Sans_700'
    value = value.join('_');

    return defaultFontParser(value, type);
}

/**
 * Returns the font family or weight
 * Expects the value to have a family_weight structure.
 * Will convert + to spaces
 * Eg value: "Open+Sans_700", "Open Sans", "Open+Sans_400_sans", "Open+Sans_400,700_sans"
 * @param value
 * @param type - 'family' or 'weight'
 * @returns {*}
 */
function defaultFontParser(value, type) {
    const typeFamily = type === 'family';
    const index = typeFamily ? 0 : 1;
    var formattedString;
    var split;


    if (!_.isString(value)) {
        return 'null';
    }

    split = value.split('_');

    if (_.isEmpty(split[index])) {
        return 'null';
    }

    formattedString = split[index].split(',')[0];
    formattedString = formattedString.replace(/\+/g, ' ');

    // Make sure the string has no quotes in it
    formattedString = formattedString.replace(/'|"/g, '');

    if (typeFamily) {
        // Wrap the string in quotes since Sass type String
        // works with quotes and without quotes (it won't add them)
        // and we end up with font-family: Open Sans with no quotes
        formattedString = `"${formattedString}"`;
    }

    return formattedString;
}


module.exports = { stencilFont, googleFontParser, defaultFontParser };
