const _ = require('lodash');
const fonts = require('./fonts');

const functions = {
    stencilColor(themeSettings, args) {
        const key = getArg(args, 0);
        return themeSettings[key] ||'transparent';
    },

    stencilNumber(themeSettings, args) {
        const key = getArg(args, 0);
        const unit = getArg(args, 1) || 'px';
        var value = 0;

        if (themeSettings[key]) {
            value = parseFloat(themeSettings[key]);
        }

        if (_.isNaN(value)) {
            value = 0;
        }

        return `${value}${unit}`;
    },

    stencilString(themeSettings, args) {
        const key = getArg(args, 0);

        return quote(themeSettings[key]);
    },

    stencilImage(themeSettings, args) {
        const sizeRegex = /^\d+x\d+$/g;
        const image = getArg(args, 0);
        const size = getArg(args, 1);
        var ret;

        if (themeSettings[image] && themeSettings[image].indexOf('{:size}') !== -1 && sizeRegex.test(themeSettings[size])) {
            ret = quote(themeSettings[image].replace('{:size}', themeSettings[size]));
        } else {
            ret = 'Null';
        }

        return ret;
    },

    stencilFontFamily(themeSettings, args) {
        const key = getArg(args, 0);

        return fonts.stencilFont(themeSettings[key], 'family');
    },

    stencilFontWeight(themeSettings, args) {
        const key = getArg(args, 0);

        return fonts.stencilFont(themeSettings[key], 'weight');
    },
};

function applyFunctions(content, themeSettings) {
    content = content.replace(/stencilColor\((.+?)\)/g, (match, args) => functions.stencilColor(themeSettings, args));
    content = content.replace(/stencilNumber\((.+?)\)/g, (match, args) => functions.stencilNumber(themeSettings, args));
    content = content.replace(/stencilString\((.+?)\)/g, (match, args) => functions.stencilString(themeSettings, args));
    content = content.replace(/stencilImage\((.+?)\)/g, (match, args) => functions.stencilImage(themeSettings, args));
    content = content.replace(/stencilFontFamily\((.+?)\)/g, (match, args) => functions.stencilFontFamily(themeSettings, args));
    content = content.replace(/stencilFontWeight\((.+?)\)/g, (match, args) => functions.stencilFontWeight(themeSettings, args));

    return content;
}

function getArg(data, index) {
    const args = data.split(',').map(unquote);

    console.log(index, data, '>', args);

    return args[index];
}

function unquote(string) {
    var output = string.trim();

    if (output.match(/^["|'].*["|']$/)) {
        output = output.substring(1, output.length - 1);
    }

    return output;
}

function quote(string) {
    return `"${string}"`;
}

module.exports = applyFunctions;
