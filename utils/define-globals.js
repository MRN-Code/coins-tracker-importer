'use strict';
var _ = require('lodash');
var bluebirdify = require('bluebirdify');
bluebirdify();
bluebirdify.chirp();

module.exports = function() {
    global.log = function() {
        _.toArray(arguments).forEach(function(v, n) {
            console.log(n + ':', v);
        });
    };
};
