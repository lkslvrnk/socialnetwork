const fs = require('fs')
const path = require('path')
const typescript = require("typescript")
const chalk = require('chalk');

module.exports = {
    input: [
        'src/**/*.{js,jsx,ts,tsx}',
    ],
    output: './',
    options: {
        debug: true,
        func: {
            list: ['i18n.t', 't'],
        },
		sort: true,
        lngs: ['fr', 'ru', 'uk', 'de'],
        ns: [
            'translation',
        ],
        defaultLng: 'en',
        defaultNs: 'translation',
        defaultValue: '__NOT_TRANSLATED__',
        resource: {
            loadPath: 'public/locales/{{lng}}/{{ns}}.json',
            savePath: 'public/locales/{{lng}}/{{ns}}.json',
            jsonIndent: 4,
            lineEnding: '\n'
        },
        nsSeparator: false,
        keySeparator: '.',
        interpolation: {
            prefix: '{{',
            suffix: '}}'
        },
        removeUnusedKeys: true,
    },

    transform: function customTransform(file, enc, done) {
        "use strict";
        
        const parser = this.parser
        const content = fs.readFileSync(file.path, enc)
        let count = 0

        let parse = (key, options) => {
            parser.set(key, Object.assign({}, options, {
                nsSeparator: false,
                keySeparator: false
            }));
            ++count;
        }
				
        parser.parseFuncFromString(content, { list: ['t'] }, parse)

        if (count > 0) {
            console.log(`i18next-scanner: count=${chalk.cyan(count)}, file=${chalk.yellow(JSON.stringify(file.relative))}`)
        }
        done();
    }
};
