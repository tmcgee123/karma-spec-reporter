# karma-spec-reporter

[![Join the chat at https://gitter.im/mlex/karma-spec-reporter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/mlex/karma-spec-reporter?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Test reporter, that prints detailed results to console (similar to mocha's spec reporter).

## Usage

To use in your own Node.js project, just execute
```
npm install karma-spec-reporter --save-dev
```
This will download the karma-spec-reporter and add the dependency to `package.json`.

Then add 'spec' to reporters in karma.conf.js, e.g.

```
reporters: ['spec']
```

Take a look at the [karma-spec-reporter-example](http://github.com/mlex/karma-spec-reporter-example) repository to see the reporter in action.

## Configuration

To limit the number of lines logged per test
``` js
//karma.conf.js
...
  config.set({
    ...
      reporters: ["spec"],
      specReporter: {
        maxLogLines: 5         // limit number of lines logged per test
        suppressPassed: false  // do not print information about passed tests
        suppressFailed: false  // do not print information about failed tests
        suppressSkipped: true  // do not print information about skipped tests
      },
      plugins: ["karma-spec-reporter"],
    ...
```
### Disabling the error summary

To disable the logging of the final errors at the end of the specs being ran
``` js
//karma.conf.js
...
  config.set({
    ...
      reporters: ["spec"],
      specReporter: {showErrorSummary: false}, //defaults to true
      plugins: ["karma-spec-reporter"],
    ...
```
