'use strict';
var app = require('ampersand-app');
module.exports = function() {
    var opts = require("nomnom")
    .option('study', {
        abbr: 's',
        flag: true,
        help: 'specify study id'
    })
    .option('api', {
        abbr: 'a',
        flag: true,
        help: 'api server <devcoinx.mrn.org>'
    })
    .option('apikey', {
        abbr: 'k',
        flag: true,
        help: 'api server <devcoinx.mrn.org>'
    })
    .option('force', {
        abbr: 'f',
        flag: true,
        help: 'force SQL to be generated even if potential error detected'
    })
    .option('out', {
        abbr: 'o',
        flag: true,
        help: 'output file'
    })
    .parse();

    if (!opts.study && opts.study != 0) {
        throw new Error('study required');
    }

    if (!opts.api) {
        throw new Error('api server required');
    }

    if (!opts.apikey) {
        throw new Error('you must provide an apikey')
    }

    if (opts._[0] && opts._[0].trim().match(/\.csv$/)) {
        opts.filename = opts._[0];
    } else {
        throw new Error('csv must be passed first, and named {file}.csv');
    }

    app.opts = opts;
    return Promise.resolve(opts);
};
