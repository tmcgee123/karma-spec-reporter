# karma-spec-reporter

Test reporter, that prints detailed results to console (similar to mocha's spec reporter).

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

Take a look at the [karma-spec-reporter-example](http://github.com/mlex/karma-spec-reporter-example) repository to see the reporter in action.
