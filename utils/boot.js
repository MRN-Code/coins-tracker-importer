'use strict';
module.exports = function() {
    require('bluebirdify')({ chirp: true });
    var pOpts = require('./parse-cli.js')();
    var pGlobals = require('./define-globals.js')();
    return Promise.all([pOpts, pGlobals]).then(function resolveParsable(results) {
        return {
            cliOpts: results[0],
        }
    })
};
