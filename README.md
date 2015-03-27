# karma-spec-reporter

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
      specReporter: {maxLogLines: 5},
      plugins: ["karma-spec-reporter"],
    ...
```


