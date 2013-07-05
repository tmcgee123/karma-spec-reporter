require('colors');

var SpecReporter = function(baseReporterDecorator, logger, formatError) {
  baseReporterDecorator(this);

  // colorize output of BaseReporter functions
  this.USE_COLORS = true;
  this.SPEC_FAILURE = '%s %s FAILED'.red + '\n';
  this.SPEC_SLOW = '%s SLOW %s: %s'.yellow + '\n';
  this.ERROR = '%s ERROR'.red + '\n';
  this.FINISHED_ERROR = ' ERROR'.red;
  this.FINISHED_SUCCESS = ' SUCCESS'.green;
  this.FINISHED_DISCONNECTED = ' DISCONNECTED'.red;
  this.X_FAILED = ' (%d FAILED)'.red;
  this.TOTAL_SUCCESS = 'TOTAL: %d SUCCESS'.green + '\n';
  this.TOTAL_FAILED = 'TOTAL: %d FAILED, %d SUCCESS'.red + '\n';


  this.onRunStart = function(browsers) {
    browsers.forEach(function(browser) {
      // useful properties
      browser.id;
      browser.fullName;
    });
  };

  this.onBrowserComplete = function(browser) {
    // useful properties
    var result = browser.lastResult;
    result.total;
    result.disconnected;
    result.error;
    result.failed;
    result.netTime; // in millieseconds? or microseconds?
  };

  this.onRunComplete = function(browsers, results) {
    // the renderBrowser function is defined in karma/reporters/Base.js
    this.writeCommonMsg(browsers.map(this.renderBrowser).join('\n') + '\n');

    if (browsers.length > 1 && !results.disconnected && !results.error) {
      if (!results.failed) {
        this.write(this.TOTAL_SUCCESS, results.success);
      } else {
        this.write(this.TOTAL_FAILED, results.failed, results.success);
      }
    }

    this.write("\n");
  };

  this.currentSuite = [];
  this.writeSpecMessage = function(status) {
    return (function(browser, result) {
      var suite = result.suite
      var indent = "";
      suite.forEach(
        // beware, this in the context of a foreach loop is not what you expect!
        // To be sure, we bind this explicitly
        (function(value, index) {
          if (index >= this.currentSuite.length || this.currentSuite[index] != value) {
            if (index == 0) {
              this.writeCommonMsg('\n');
            }
            this.writeCommonMsg(indent + value + ':\n');
            this.currentSuite = [];
          }
          indent += "    ";
        }).bind(this)
      );
      this.currentSuite = suite;

      var specName = result.description;
      //TODO: add timing information
      var msg = '  '  + indent + status + " - " + specName, specName

      result.log.forEach(function(log) {
        // TODO: have to find out, what this line exactly does. just copied it from karma's BaseReporter
        msg += formatError(log, '\t');
      });

      this.writeCommonMsg(msg + '\n');

      // other useful properties
      browser.id;
      browser.fullName;
      result.time;
      result.skipped;
      result.success;
    }).bind(this);
  };

  this.specSuccess = this.writeSpecMessage('PASSED '.green);
  this.specSkipped = this.writeSpecMessage('SKIPPED'.gray);
  this.specFailure = this.writeSpecMessage('FAILED '.red);
};

SpecReporter.$inject = ['baseReporterDecorator', 'logger', 'formatError'];

module.exports = {
  'reporter:spec': ['type', SpecReporter]
};
