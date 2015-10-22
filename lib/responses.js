'use strict';
var axios = require('axios');
var qs = require('qs');
var url = require('url');
var opts = require('ampersand-app').opts;
var _ = require('lodash');

module.exports = {
    latestUrl: function(studyId) {
        // hack in an encoded url known to get the latest tracker responses
        // by using the tracker table endpoint, which already supports this.
        // because the URL is genreated internally by DT,  just grab and encoded
        // version of it, ready to do
        // return [
        //     'https://', opts.api.trim() ,'/coins_core/api/v2/study/',
        //     opts.study.toString().trim(),
        //     '/tracker/table?draw=1&columns%5B0%5D%5Bdata%5D=ursi&columns',
        //     '%5B0%5D%5Bname%5D=ursi&columns%5B0%5D%5Bsearchable%5D=true&',
        //     'columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D',
        //     '%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&',
        //     'columns%5B1%5D%5Bdata%5D=subject_type_label&columns%5B1%5D%5B',
        //     'name%5D=subject_type_label&columns%5B1%5D%5Bsearchable%5D=true',
        //     '&columns%5B1%5D%5Borderable%5D=true&columns%5B1%5D%5Bsearch%5D%',
        //     '5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%',
        //     '5B2%5D%5Bdata%5D=function&columns%5B2%5D%5Bname%5D=enrolled_date',
        //     '&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%',
        //     '5D=true&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5B',
        //     'search%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=function&',
        //     'columns%5B3%5D%5Bname%5D=consent_date&columns%5B3%5D%5Bsearchable',
        //     '%5D=true&columns%5B3%5D%5Borderable%5D=true&columns%5B3%5D%5B',
        //     'search%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false',
        //     '&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=0&',
        //     'length=50&search%5Bvalue%5D=&search%5Bregex%5D=false&',
        //     '_=1445382063082'
        // ].join('');
        var query = { apikey: opts.apikey };
        var dtQuery = {
            draw: '1',
            columns:
            [ { data: 'ursi',
               name: 'ursi',
               searchable: 'true',
               orderable: 'true',
             },
             { data: 'subject_type_label',
               name: 'subject_type_label',
               searchable: 'true',
               orderable: 'true',
             },
             { data: 'function',
               name: 'enrolled_date',
               searchable: 'true',
               orderable: 'true',
             },
             { data: 'function',
               name: 'consent_date',
               searchable: 'true',
               orderable: 'true',
             }
            ],
            order: [ { column: '0', dir: 'asc' } ],
            start: '0',
            length: '50',
            search: { value: '', regex: 'false' },
            _: '1445382063082'
        };

        var _url = url.format({
            protocol: 'https',
            host: opts.api,
            pathname: [
                '/coins_core/api/v2/study/',
                opts.study.toString().trim(),
                '/tracker/table'
            ].join(''),
            search: '?' + qs.stringify(_.assign({}, dtQuery, query))
        });

        return _url;

    },

    get: function() {
        return axios({
            method: 'get',
            url: this.latestUrl()
        }).then(function(resp) {
            return resp.data.data;
        });
    }
};
