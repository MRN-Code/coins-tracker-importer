'use strict';
var toArray = require('lodash.toarray');

module.exports = function() {
    global.log = function() {
        toArray(arguments).forEach(function(v, n) {
            console.log(n + ':', v);
        });
    };
};
