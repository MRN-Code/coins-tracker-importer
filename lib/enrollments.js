'use strict';
var axios = require('axios');
var path = require('path');
var qs = require('qs');
var url = require('url');
var _ = require('lodash');
var opts = require('ampersand-app').opts;

var exp = {
    assertUrsisHaveEnrollments: function(enrolledUrsis, importUrsis) {
        var missingEnrollments = _.without.apply(this, [importUrsis].concat(enrolledUrsis));
        var errMsg = missingEnrollments.toString() + ' are not enrolled in study ' + opts.study
        if (missingEnrollments.length) {
            if (opts.force) {
                console.warn(errMsg);
            } else {
                throw new Error(errMsg);
            }
        }
    },

    extractUrsisFromCsv: function(csv) {
        var ursis = [];
        if (!csv || !csv.length || !csv[0] || !csv[0].length) {
            throw new ReferenceError('invalid parsed csv. expect [ of []s ]');
        }
        csv.forEach(function(row, ndx) {
            if (!ndx) { return; } // ignore header row
            ursis.push(row[0]);
        });
        return ursis;
    },

    get: function() {
        var query = { apikey: opts.apikey };
        query = _.values(query).length ? qs.stringify(query) : null;
        var _url = url.format({
            protocol: 'https',
            host: opts.api,
            pathname: [
                '/coins_core/api/v1/study/',
                opts.study.toString().trim(),
                '/enrollment'
            ].join(''),
            search: query ? query : null
        });
        return axios({
            method: 'get',
            url: _url
        });
    },
};

module.exports = exp;
