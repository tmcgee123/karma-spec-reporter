var util = require('util');

var SpecReporter = function(baseReporterDecorator, formatError) {
  baseReporterDecorator(this);
  
  // Here we could override the output-adapter
  // The default adapter (stdout) is defined in karma/reporters/Base.js
  //this.adapters = [
  //  function(msg) {
  //    process.stdout.write(msg);
  //  }
  //];

  this.onRunStart = function(browsers) {
    browsers.forEach(function(browser) {
      var browserId = browser.id;
      var browserName = browser.fullName;
    });
  };

  this.onBrowserComplete = function(browser) {
    var result = browser.lastResult;

    // available properties
    result.total;
    result.disconnected;
    result.error;
    result.failed;
    result.netTime; // in millieseconds? or microseconds?
  };

  this.onRunComplete = function() {
  };

  this.specSuccess = function(browser, result) {
    var specName = result.suite.join(' ') + ' ' + result.description;
    var msg = util.format('%s %s PASSED'.green, browser, specName);

    result.log.forEach(function(log) {
      msg += formatError(log, '\t');
    });

    this.writeCommonMsg(msg);

    browser.id;
    browser.fullName;
    
    result.suite;
    result.description;
    result.time;

    result.skipped;
    result.success;
  };

  this.specSkipped = function(browser, result) {
    var specName = result.suite.join(' ') + ' ' + result.description;
    var msg = util.format('%s %s SKIPPED'.gray, browser, specName);

    result.log.forEach(function(log) {
      msg += formatError(log, '\t');
    });

    this.writeCommonMsg(msg);
  };
};

SpecReporter.$inject = ['baseReporterDecorator', 'logger', 'formatError'];

// PUBLISH DI MODULE
module.exports = {
  'reporter:spec': ['type', SpecReporter]
};
