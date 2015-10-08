# coins-tracker-importer
Generates SQL to import tracker data.  Specifically it:

1. generates new trackers
1. generates a new event associated with adding new responses for an ursi
1. generates new tracker responses

# install
```
npm install -g coins-tracker-importer
```

# usage
```bash
coins-tracker-importer test/dummy.csv --study=2319 # > tracker-sql.out
```
where the csv looks similair to:

```csv
ursi,tracker_name_1,tracker_name_2,...,tracker_name_n
M123,tracker_resp_1,tracker_resp_2,...,tracker_resp_n
```

- empties are allowed for responses
- empties not allowed for ursi
- all responses are entered as 'custom text' responses, as pre-defined response option imports are not (yet?) supported
