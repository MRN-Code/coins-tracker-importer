'use strict';
var axios = require('axios');
var qs = require('qs');
var url = require('url');
var opts = require('ampersand-app').opts;

var exp = {
    get: function() {
        var query = { apikey: opts.apikey };
        query = Object.keys(query).length ? qs.stringify(query) : null;
        var _url = url.format({
            protocol: 'https',
            host: opts.api,
            pathname: [
                '/coins_core/api/v1/study/',
                opts.study.toString().trim(),
                '/tracker'
            ].join(''),
            search: query ? query : null
        });
        return axios({
            method: 'get',
            url: _url
        });
    }
};

module.exports = exp;
