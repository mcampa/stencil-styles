const _ = require('lodash');
const fonts = require('./fonts');

function applyFunctions(content, themeSettings) {
    content = content.replace(/stencilColor\((.+?)\)/g, (match, args) => stencilColor(themeSettings, args));
    content = content.replace(/stencilNumber\((.+?)\)/g, (match, args) => stencilNumber(themeSettings, args));
    content = content.replace(/stencilString\((.+?)\)/g, (match, args) => stencilString(themeSettings, args));
    content = content.replace(/stencilImage\((.+?)\)/g, (match, args) => stencilImage(themeSettings, args));
    content = content.replace(/stencilFontFamily\((.+?)\)/g, (match, args) => stencilFontFamily(themeSettings, args));
    content = content.replace(/stencilFontWeight\((.+?)\)/g, (match, args) => stencilFontWeight(themeSettings, args));

    content = content.replace(/stencilImage\((.+?)\)/g, (match, key) => {
        key = key.replace(/"/g, '');
        return '//example.com/image.jpg';
    });

    return content;
}

function stencilColor(themeSettings, args) {
    const key = getArg(args, 1);
    return themeSettings[key] ||'transparent';
}
// TODO: implement unit (suffix)
function stencilNumber(themeSettings, args) {
    const key = getArg(args, 1);
    var value = 0;

    if (themeSettings[key]) {
        value = parseFloat(themeSettings[key]);
    }

    if (_.isNaN(value)) {
        value = 0;
    }

    return value;
}

function stencilString(themeSettings, args) {
    const key = getArg(args, 1);

    return `"${themeSettings[key]}"`;
}

function stencilImage(themeSettings, args) {
}

function stencilFontFamily(themeSettings, args) {
    const key = getArg(args, 1);

    return fonts.stencilFont(themeSettings[key], 'family');
}

function stencilFontWeight(themeSettings, args) {
    const key = getArg(args, 1);

    return fonts.stencilFont(themeSettings[key], 'weight');
}

function getArg(args, n) {
    // TODO
    return args.replace(/"/g, '');
}

Object.assign(applyFunctions.prototype, {
    stencilColor,
    stencilNumber,
    stencilString,
    stencilImage,
    stencilFontFamily,
    stencilFontWeight,
});

module.exports = applyFunctions;
