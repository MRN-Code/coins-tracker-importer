'use strict';
var parse = require('csv-parse');
var fs = require('fs');

module.exports = function(file) {
    try {
        var deferred = Promise.pending();
        var parser = parse({ delimiter: ',' }, function(err, result) {
            if (err) { return deferred.reject(err); }
            return deferred.resolve(result);
        });
        fs.createReadStream(file).pipe(parser);
    } catch (err) {
        return Promise.reject(err);
    }
    return deferred.promise;
};
