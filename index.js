'use strict';
var ready = require('./utils/boot.js')();
var go = require('./go.js');

ready.then(function(bootResults) {
    return go(bootResults.cliOpts, bootResults.config);
});
