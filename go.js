var path = require('path');
module.exports = function go(opts, config) {
    var pParsed = require('./utils/parse.js')(path.resolve(__dirname, opts.filename));
    return pParsed.then(function(parsedCsv) {
        return require('./utils/generate-tracker-sql.js')(parsedCsv, opts, config);
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
