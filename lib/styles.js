'use strict';

const _ = require('lodash');
const hoek = require('hoek');
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');
const path = require('path');
const sass = require('node-sass');
const SassJs = require('sass.js');
const applyFunctions = require('./functions');

function StencilStyles() {
    this.fullUrls = {};

    /**
     * Compiles the CSS based on which compiler has been specified
     *
     * @param compiler
     * @param options
     * @param callback
     */
    this.compileCss = (compiler, options, callback) => {
        this.scssCompiler(options, (err, css) => {
            if (err) {
                return callback(err);
            }

            callback(null, this.autoPrefix(css, options.autoprefixerOptions));
        });
    };

    this.autoPrefix = (css, autoprefixerOptions) => {
        const payload = typeof css === 'string' || css instanceof Buffer ? css : '';
        var output = css;

        try {
            output = postcss([autoprefixer(autoprefixerOptions)]).process(payload).css;
        } catch (e) {
            // invalid css
        }

        return output;
    };

    /**
     * Compile SCSS into CSS and return the content
     *
     * @param options
     * @param callback
     */
    this.scssCompiler = (options, callback) => {
        const sassJs = SassJs;

        const opts = {
            // Format output: nested, expanded, compact, compressed
            style: SassJs.style.nested,
            // // Precision for outputting fractional numbers
            // // (-1 will use the libsass default, which currently is 5)
            // precision: -1,
            // // If you want inline source comments
            // comments: false,
            // // Treat source_string as SASS (as opposed to SCSS)
            indentedSyntax: false,
            // // String to be used for indentation
            // indent: '  ',
            // // String to be used to for line feeds
            // linefeed: '\n',
            //
            // // Path to source map file
            // // Enables the source map generating
            // // Used to create sourceMappingUrl
            // sourceMapFile: 'file',
            // // Pass-through as sourceRoot property
            sourceMapRoot: 'root',
            // // The input path is used for source map generation.
            // // It can be used to define something with string
            // // compilation or to overload the input file path.
            // // It is set to "stdin" for data contexts
            // // and to the input file on file contexts.
            inputPath: 'stdin',
            // // The output path is used for source map generation.
            // // Libsass will not write to this file, it is just
            // // used to create information in source-maps etc.
            outputPath: 'stdout',
            // // Embed included contents in maps
            // sourceMapContents: true,
            // // Embed sourceMappingUrl as data uri
            sourceMapEmbed: true,
            // // Disable sourceMappingUrl in css output
            // sourceMapOmitUrl: true,
        };

        sassJs.importer((request, done) => {
            const data = this.scssImporter(options.files, request.current, request.previous);

            done({
                path: data.file,
                content: applyFunctions(data.contents, options.themeSettings)
            });
        });

        const timer = new hoek.Timer();

        console.log('Compiling SCSS');
        sassJs.compile(applyFunctions(options.data, options.themeSettings), opts, (result) => {
            console.log(`done in ${timer.elapsed()} milliseconds`);
            if (result.status) {
                result.formatted.split('\n').forEach(line => console.log(line));
                // console.log(`${result.file}:${result.line}:${result.column}`);
                return callback(new Error(result.message));
            }
            callback(null, result.text);
        });
    };

    /**
     * The custom importer function to pass to the node-sass compiler
     *
     * @param url
     * @param prev
     * @returns object
     */
    this.scssImporter = (files, url, prev) => {
        const prevParts = path.parse(prev);
        const urlParts = path.parse(url);
        const fullUrls = this.fullUrls;
        var fullUrl = url + (urlParts.ext === 'scss' ? '' : '.scss');
        var basePath;
        var possiblePaths;

        if (prev !== 'stdin') {
            basePath = prevParts.dir;
        }

        if (basePath) {
            fullUrl = path.join(basePath, fullUrl);
        }

        if (files[fullUrl] === undefined) {
            possiblePaths = _.keys(_.pick(fullUrls, val => val.indexOf(prev) !== -1));

            _.each(possiblePaths, possiblePath => {
                const possibleFullUrl = path.join(path.parse(possiblePath).dir, url);

                if (files[possibleFullUrl] !== undefined) {
                    fullUrl = possibleFullUrl;

                    // We found it so lets kick out of the loop
                    return false;
                }
            });
        }

        if (!files[fullUrl]) {
            return {
                file: fullUrl,
                contents: '//',
            };
        } else {
            if (! fullUrls[fullUrl]) {
                fullUrls[fullUrl] = [url];
            } else if (fullUrls[fullUrl].indexOf(url) === -1) {
                fullUrls[fullUrl].push(url)
            }

            return {
                file: fullUrl,
                contents: files[fullUrl]
            };
        }
    };
};

module.exports = StencilStyles;
