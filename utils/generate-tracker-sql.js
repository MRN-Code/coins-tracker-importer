'use strict';
var _ = require('lodash');
var rooted = require('rooted');
var path = require('path');
var cliOpts = require('ampersand-app').opts;

var santize = function(str) {
    return str
        .toLocaleLowerCase()
        .trim()
        .replace(/ +/g, '_')
        .replace(/^_+/, '')
        .replace(/_+$/, '');
};

/**
 * Appends existing tracker models onto those that are present in the header row
 * of the csv, if there are matches between
 */
var applyExistingTrackers = function(trkrMdls, trackers) {
    var trackersByLabel = _.indexBy(trackers, 'label');
    return trkrMdls.map(function(mdl) {
        if (trackersByLabel[mdl.label]) {
            mdl.existing = trackersByLabel[mdl.label];
        }
        return mdl;
    })
}

/**
 * Generate model def array from header Vector
 * @param {Vector} csv table header
 */
var generateTrackerModels = function(header) {
    var models = [];
    header.elements.forEach(function modelTracker(str, ndx, arr) {
        str = santize(str);
        if (!str || str === 'ursi') {
            return;
        }
        models.push({
            label: str,
            sylv_col: ndx + 1
        });
    })
    return models;
};

/**
 * Parse out available responses, add them to the corresponding tracker models
 * Further, assign existing responses onto the option if available
 * @param {Matrix} response matrix
 * @param {array} model def array
 */
var appendResponseOptions = function(csvResponses, existingRespOpsByTracker, trackerModels) {
    return trackerModels.map(function appendRespones(trk) {
        var existingResponses;
        if (trk.existing && existingRespOpsByTracker[trk.existing.id]) {
            existingResponses = existingRespOpsByTracker[trk.existing.id];
        }

        // append unique items in column to response options, without empty vals
        trk.responseOptions = _.uniq(
            _.without(
                csvResponses.col(trk.sylv_col).elements,
                null, undefined, ''
            )
        );

        // 'responses-label' ==> { label: 'response-label', existing=: id }
        trk.responseOptions = trk.responseOptions.map(function(label) {
            return { label: label };
        });

        // merge existing response options onto the detected response option set
        if (trk.existing && existingRespOpsByTracker[trk.existing.id]) {
            var existingResponsesByLabel = _.groupBy(existingResponses, 'label');
            trk.responseOptions = trk.responseOptions.map(function addExistOpt(opt) {
                if (existingResponsesByLabel[opt.label] && existingResponsesByLabel[opt.label].length) {
                    opt.existing = existingResponsesByLabel[opt.label][0];
                }
                return opt;
            });
        }

        return trk;
    });
};

/**
 * Go through each participant response set,
 */
var buildEvents = function(responses, trackers) {
    return responses.elements.map(function(responseSet) {
        var ursi = responseSet[0];
        var trackerResponses = _.takeRight(responseSet, responseSet.length - 1); //remove ursi
        if (!ursi) {
            throw new ReferenceError('ursi missing');
        }
        return {
            ursi: ursi,
            responses: trackerResponses.map(function getTrackerResponse(respValue, ndx) {
                var existingResponse;
                var tracker = _.find(trackers, 'sylv_col', ndx + 2); // ndx starts at 0, sylv_col resonses start at 2
                debugger;
                if (tracker && tracker.responseOptions) {
                    existingResponse = _.find(tracker.responseOptions, 'existing.label', respValue);
                    existingResponse = existingResponse ? existingResponse.existing : null;
                }
                return {
                    existing: existingResponse,
                    tracker: tracker,
                    value: respValue
                }
            }).filter(function removeEmpties(r) { return r.value.trim(); })
        };
    });
}

var confirmTrackersOk = function() {
    return new Promise(function(res, rej) {
        var yesno = require('yesno');
        yesno.ask('Are you sure you want to continue (y/n)?', false, function(ok) {
            if (ok) {
                return res(ok);
            } else {
                console.log('ok, then we\'re not going to build any SQL for ya then!');
                return rej(ok);
            }
        });
    });
}

var outputSQL = function(conf) {
    var handlebars = require('handlebars');
    var fs = require('fs');
    handlebars.registerPartial('define-upsert-tracker', fs.readFileSync('./templates/define-upsert-tracker.template', 'utf8'));
    var content = fs.readFileSync('./templates/generate-tracker-sql.template', 'utf8');
    var template = handlebars.compile(content);
    var result = template(conf);
    if (cliOpts.out) {
        fs.writeFileSync(path.resolve(process.cwd(), cliOpts.out), result);
    } else {
        console.log(result);
    }
};

var santizeTrackerLabels = function(trackers) {
    trackers = trackers.map(function(t) {
        t.label = santize(t.label);
        return t;
    });
    return trackers;
}

/**
 * @param {object} opts
 * @param {array} opts.parsedCsv array [of, rows], where each row ~[of, cells]
 * @param {array} opts.trackers [of, tracker, models]
 */
module.exports = function(opts) {
    var parsedCsv = opts.parsedCsv;
    var sylvester = require('sylvester');
    var matrix = sylvester.Matrix.create(parsedCsv);
    var header = matrix.row(1);
    var csvResponses = sylvester.Matrix.create(_.takeRight(parsedCsv, parsedCsv.length - 1));
    var headerTrackers = generateTrackerModels(header);
    var trackers; // combined existing and those parsed from csv
    var events;
    opts.trackers = santizeTrackerLabels(opts.trackers);
    trackers = applyExistingTrackers(headerTrackers, opts.trackers);

    // prompt user to confirm that new and old trackers look correct
    // e.g. not adding two trackers that look === to one another
    var oldTrackers = trackers.filter(function(t) { return t.existing; });
    var newTrackers = trackers.filter(function(t) { return !t.existing; });
    console.log('existing trackers:', _.pluck(oldTrackers, 'label'));
    console.log('new trackers:', _.pluck(newTrackers, 'label'));
    return Promise.resolve()
    .then(confirmTrackersOk)
    .then(function() {
        var trackerRepsonsesP = oldTrackers.length ?
            rooted('lib/options').get(_.pluck(oldTrackers, 'id')) :
            Promise.resolve({ data: {data: [] }});
        return trackerRepsonsesP.then(function(resp) {
            return resp.data.data;
        });
    })
    .then(function(options) {
        var optionsByTracker = _.groupBy(options, 'tracker_id');
        trackers = appendResponseOptions(csvResponses, optionsByTracker, trackers);
        events = buildEvents(csvResponses, trackers);
        return outputSQL({
            opts: opts,
            study: cliOpts.study,
            trackers: trackers,
            events: events
        });
    });
};
