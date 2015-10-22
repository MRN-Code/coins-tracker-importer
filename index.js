'use strict';
var ready = require('./utils/boot.js')();
var buildSQL = require('./lib/build-sql.js');

ready.then(function() {
    return buildSQL().catch(function(err) {
        console.error('fatal');
        console.log(err);
        throw err;
    });
}).then(function() {
    process.exit();
});
