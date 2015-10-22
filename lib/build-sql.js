'use strict';
var _ = require('lodash');
var rooted = require('rooted');
var enrollments = rooted('lib/enrollments.js');
var trackers = rooted('lib/trackers.js');
var responses = rooted('lib/responses.js');
var genSQL = rooted('utils/generate-tracker-sql.js');
var parseCsv = rooted('utils/parse.js');
var opts = require('ampersand-app').opts;
var path = require('path');

module.exports = function() {
    var csv, importUrsis;
    var getStudyData = function() {
        if (!csv || !importUrsis) {
            throw new Error('csv and importUrsis must be populated prior to fetching data');
        }
        return Promise.props({
            enrollments: enrollments.get(),
            trackers: trackers.get(),
            latest: responses.get() // latests state of all the ursis. returns rows of all subject data, including latest responses
        });
    }
    return parseCsv(path.resolve(process.cwd(), opts.filename))
    .then(function(parsedCsv) { csv = parsedCsv; return parsedCsv; })
    .then(enrollments.extractUrsisFromCsv)
    .then(function(ursis) { importUrsis = ursis; })
    .then(getStudyData)
    .then(function(response) {
        var enrolled = response.enrollments.data.data; // axios returns a resp w/ .data, then api returns data in .data
        var enrolledUrsis = _.pluck(enrolled, 'ursi');
        enrollments.assertUrsisHaveEnrollments(enrolledUrsis, importUrsis);
        return {
            enrollments: enrolled,
            trackers: response.trackers.data.data,
            latest: response.latest
        };
    })
    .then(function(data) {
        var args = _.assign({}, { parsedCsv: csv }, data);
        return genSQL(args);
    });
};

// parse workbook
// - get list of trackers, trackers = {
//  name1: {},
//  name2: {}
// }
// - get with list of unique responses for each tracker, name1: { responseOptions: ['resp1', 'resp2'], permit_custom_responses: bool }
// - get list of events, which is all rows that have any responses
//  - build responses as we build an event
//
//  generate sql to:
//      get subject_ids for all URSIS in the study (take study as input)
//      add trackers, return their $IDs
//      add events using $ID
