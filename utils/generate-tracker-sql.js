'use strict';

/**
 * Generate model def array from header Vector
 * @param {Vector} csv table header
 */
var generateTrackerModels = function(header) {
    var models = [];
    header.elements.forEach(function modelTracker(str, ndx, arr) {
        // \W is the negation of shorthand \w for [A-Za-z0-9_]
        str = str.toLowerCase().replace(/[\W]+/g,'_');
        if (!str || str === 'ursi') {
            return;
        }
        models.push({
            name: str,
            sylv_col: ndx + 1
        });
    })
    return models;
};

/**
 * Parse out available responses, add them to the corresponding tracker models
 * @param {Matrix} response matrix
 * @param {array} model def array
 */
var appendResponseOptions = function(responses, trackerModels) {
    return trackerModels.map(function appendRespones(trackerModel) {
        var uniq = require('lodash.uniq');
        var without = require('lodash.without');
        // append unique items in column to response options, without empty vals
        trackerModel.responseOptions = uniq(
            without(
                responses.col(trackerModel.sylv_col).elements,
                null, undefined, ''
            )
        );
        return trackerModel;
    });
};

/**
 * Go through each participant response set,
 */
var buildEvents = function(responses, trackerModels) {
    return responses.elements.map(function(responseSet) {
        var takeRight = require('lodash.takeright');
        var ursi = responseSet[0];
        var trackerResponses = takeRight(responseSet, responseSet.length - 1); //remove ursi
        if (!ursi) {
            throw new ReferenceError('ursi missing');
        }
        return {
            ursi: ursi,
            responses: trackerResponses.map(function getTrackerResponse(respValue, ndx) {
                return {
                    tracker: trackerModels[ndx],
                    value: respValue
                }
            })
        };
    })
}

var outputSQL = function(conf) {
    var handlebars = require('handlebars');
    var fs = require('fs');
    handlebars.registerPartial('define-upsert-tracker', fs.readFileSync('./templates/define-upsert-tracker.template', 'utf8'));
    handlebars.registerPartial('upsert-trackers', fs.readFileSync('./templates/upsert-trackers.template', 'utf8'));
    var content = fs.readFileSync('./templates/generate-tracker-sql.template', 'utf8');
    var template = handlebars.compile(content);
    console.log(template(conf));
};

/**
 * @param {array} parsedCsv [of, rows], where each row ~[of, cells]
 */
module.exports = function(parsedCsv, opts, config) {
    var takeRight = require('lodash.takeright');
    var sylvester = require('sylvester');
    var matrix = sylvester.Matrix.create(parsedCsv);
    var header = matrix.row(1);
    var responses = sylvester.Matrix.create(takeRight(parsedCsv, parsedCsv.length - 1));
    var events;
    var trackers = generateTrackerModels(header);
    trackers = appendResponseOptions(responses, trackers);
    events = buildEvents(responses, trackers);
    outputSQL({
        opts: opts,
        trackers: trackers,
        events: events
    });
};
