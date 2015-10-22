# coins-tracker-importer
Generates SQL to import tracker data.  Specifically it:

1. generates new trackers, unless matching trackers already exist on API server
1. generates a new event associated with adding new responses for an ursi
1. generates new tracker responses
  1. responses map to a pre-defined response if the tracker pre-defined already exists
  1. else, responses map to custom-text responses on the tracker

# install
```
npm install -g coins-tracker-importer
```

# usage
```bash
coins-tracker-importer test/dummy.csv --study=2319 --api=api-server.domain.org --apikey=abc123 --out=tracker-sql.out
```
where the csv looks similair to:

```csv
ursi,tracker_name_1,tracker_name_2,...,tracker_name_n
M123,tracker_resp_1,tracker_resp_2,...,tracker_resp_n
```

## options

### flags
  - `api` required, server where api installed
  - `apikiey` required, key to tap into api
  - `force` optional, warn some error cases vs error out
  - `study` required, study id
  - `out` option, generate sql to file, else shows in STDOUT


- empties are allowed for responses
- empties not allowed for ursi
- all responses are entered as 'custom text' responses, as pre-defined response option imports are not (yet?) supported

# changelog
- 2.0.0 - support existing data, map to existing trackers and pre-def response options
