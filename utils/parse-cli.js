'use strict';
module.exports = function() {
    var opts = require("nomnom")
    .option('study', {
        abbr: 's',
        flag: true,
        help: 'specify study id'
    })
    .parse();

    if (!opts.study && opts.study != 0) {
        throw new Error('study required');
    }

    if (opts._[0] && opts._[0].trim().match(/\.csv$/)) {
        opts.filename = opts._[0];
    } else {
        throw new Error('csv must be passed first, and named {file}.csv');
    }

    return Promise.resolve(opts);
};
