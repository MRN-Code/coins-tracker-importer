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
    return Promise.resolve(opts);
};
