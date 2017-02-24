/* global beforeEach, it, describe */

'use strict';
/*
 * Based upon "Function.prototype.bind polyfill for PhantomJS"
 *  author: Tom Watson <tom.james.watson@gmail.com>
 *  homepage: https://github.com/tom-james-watson/phantomjs-polyfill
 *
 *  This fixes a compatibility issue with running Phantom1 with Angular 1.5
 */

/* jshint ignore:start */

// if (typeof Function.prototype.bind != 'function') {
//   Function.prototype.bind = function bind(obj) {
//     var args = Array.prototype.slice.call(arguments, 1),
//       self = this,
//       nop = function() {
//       },
//       bound = function() {
//         return self.apply(
//           this instanceof nop ? this : (obj || {}), args.concat(
//             Array.prototype.slice.call(arguments)
//           )
//         );
//       };
//     nop.prototype = this.prototype || {};
//     bound.prototype = new nop();
//     return bound;
//   };
// }

/* jshint ignore:end */

var rewire = require('rewire');
var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();
var expect = chai.expect;
var os = require('os');
var reporterRewire = rewire('../index.js');
var SpecReporter = require('../index.js')['reporter:spec'];

var ansiColors = {
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  green: '\u001b[32m',
  reset: '\u001b[39m'
};
var windowsIcons = {
  success: '\u221A',
  failure: '\u00D7',
  skipped: '.'
}

//baseReporterDecorator functions
var formatError = function (a, b) {
  return a + b;
};
function noop() {}
var baseReporterDecorator = function (context) {
  context.renderBrowser = sinon.spy();
  context.writeCommonMsg = sinon.spy();
  context.write = sinon.spy();
};

describe('SpecReporter', function () {
  describe('when initializing', function () {
    describe('and on a windows machine', function () {
      var newSpecReporter;
      var config = {};

      beforeEach(function () {
        var processMock = {
          platform: function () {
            return 'win32';
          }
        };
        reporterRewire.__set__({
          'reporter:spec': SpecReporter,
          process: {
            platform: 'win32'
          }
        });
        newSpecReporter = new reporterRewire['reporter:spec'][1](baseReporterDecorator, formatError, config);
      });

      it('SpecReporter should have icons defined appropriately', function () {
        newSpecReporter.prefixes.success.should.equal(windowsIcons.success);
        newSpecReporter.prefixes.failure.should.equal(windowsIcons.failure);
        newSpecReporter.prefixes.skipped.should.equal(windowsIcons.skipped);
      });
    });
    describe('and colors are not defined', function () {
      var newSpecReporter;
      var config = {};

      beforeEach(function () {
        newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
      });

      it('SpecReporter should be defined appropriately', function () {
        SpecReporter[0].should.equal('type');
        newSpecReporter.should.be.a('object');
      });

      it('should set USE_COLORS to false by default', function () {
        newSpecReporter.USE_COLORS.should.equal(false);
      });
    });
    describe('and colors are defined', function () {
      var newSpecReporter;
      var config = {
        colors: true
      };

      beforeEach(function () {
        newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
      });

      it('SpecReporter should be defined appropriately', function () {
        SpecReporter[0].should.equal('type');
        newSpecReporter.should.be.a('object');
      });

      it('should set USE_COLORS to true', function () {
        newSpecReporter.USE_COLORS.should.equal(true);
      });

      it('should set the BaseReporter function\'s colors', function () {
        //NOTE: this is temporary as the colors module was updated
        if (os.platform() === 'win32') {
            newSpecReporter.SPEC_FAILURE.should.equal('%s %s FAILED\n');
            newSpecReporter.SPEC_SLOW.should.equal('%s SLOW %s: %s\n');
            newSpecReporter.ERROR.should.equal('%s ERROR\n');
            newSpecReporter.FINISHED_ERROR.should.equal(' ERROR');
            newSpecReporter.FINISHED_SUCCESS.should.equal(' SUCCESS');
            newSpecReporter.FINISHED_DISCONNECTED.should.equal(' DISCONNECTED');
            newSpecReporter.X_FAILED.should.equal(' (%d FAILED)');
            newSpecReporter.TOTAL_SUCCESS.should.equal('TOTAL: %d SUCCESS\n');
            newSpecReporter.TOTAL_FAILED.should.equal('TOTAL: %d FAILED, %d SUCCESS\n');
        } else {
            newSpecReporter.SPEC_FAILURE.should.equal(ansiColors.red + '%s %s FAILED' + ansiColors.reset + '\n');
            newSpecReporter.SPEC_SLOW.should.equal(ansiColors.yellow + '%s SLOW %s: %s' + ansiColors.reset + '\n');
            newSpecReporter.ERROR.should.equal(ansiColors.red + '%s ERROR' + ansiColors.reset + '\n');
            newSpecReporter.FINISHED_ERROR.should.equal(ansiColors.red + ' ERROR' + ansiColors.reset);
            newSpecReporter.FINISHED_SUCCESS.should.equal(ansiColors.green + ' SUCCESS' + ansiColors.reset);
            newSpecReporter.FINISHED_DISCONNECTED.should.equal(ansiColors.red + ' DISCONNECTED' + ansiColors.reset);
            newSpecReporter.X_FAILED.should.equal(ansiColors.red + ' (%d FAILED)' + ansiColors.reset);
            newSpecReporter.TOTAL_SUCCESS.should.equal(ansiColors.green + 'TOTAL: %d SUCCESS' + ansiColors.reset + '\n');
            newSpecReporter.TOTAL_FAILED.should.equal(ansiColors.red + 'TOTAL: %d FAILED, %d SUCCESS' + ansiColors.reset + '\n');
        }
      });
    });

    describe('and there are configurations set for the spec reporter', function () {
      describe('and suppressFailed is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            suppressFailed: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSkipped', function () {
          expect(newSpecReporter.specFailure()).to.equal();
        });
      });

      describe('and suppressSkipped is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            suppressSkipped: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSkipped', function () {
          expect(newSpecReporter.specSkipped()).to.equal();
        });
      });

      describe('and suppressPassed is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            suppressPassed: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSuccess', function () {
          expect(newSpecReporter.specSuccess()).to.equal();
        });
      });

      describe('and suppressErrorSummary is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            suppressErrorSummary: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the suppressErrorSummary flag to true', function () {
          newSpecReporter.suppressErrorSummary.should.equal(true);
        });
      });

      describe('and showSpecTiming is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            showSpecTiming: true,
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the showSpecTiming flag to true', function () {
          newSpecReporter.showSpecTiming.should.equal(true);
        });
      });
    });
  });

  describe('functionality', function () {
    describe('onRunComplete', function () {
      describe('with no browsers', function () {
        var newSpecReporter;
        var config = {};

        beforeEach(function () {
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);

          newSpecReporter.currentSuite.push('suite name');
          newSpecReporter.onRunComplete([], []);
        });

        it('should reset failures and currentSuite arrays', function () {
          newSpecReporter.currentSuite.length.should.equal(0);
          newSpecReporter.failures.length.should.equal(0);
        });

        it('should call writeCommonMsg', function () {
          newSpecReporter.writeCommonMsg.should.have.been.called;
        });

        it('should call write', function () {
          newSpecReporter.write.should.have.been.called;
        });
      });

      describe('with browsers', function () {
        describe('and there are no failures', function () {
          var newSpecReporter;
          var config = {};

          beforeEach(function () {
            newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
            newSpecReporter.currentSuite.push('suite name');
            newSpecReporter.onRunComplete(['testValue'], {
              disconnected: false,
              error: false,
              failed: 0,
              success: 10
            });
          });

          it('should call to write all of the successful specs', function () {
            newSpecReporter.write.should.have.been.calledWith(undefined, 10);
          });

          it('should reset failures and currentSuite arrays', function () {
            newSpecReporter.currentSuite.length.should.equal(0);
            newSpecReporter.failures.length.should.equal(0);
          });

          it('should call writeCommonMsg', function () {
            newSpecReporter.writeCommonMsg.should.have.been.called;
          });
        });

        describe('and there are failures', function () {
          describe('and suppressErrorSummary is true', function () {
            var newSpecReporter;
            var config = {
              specReporter: {
                suppressErrorSummary: true
              }
            };
            beforeEach(function () {
              newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
              newSpecReporter.logFinalErrors = sinon.spy();
              newSpecReporter.currentSuite.push('suite name');
              newSpecReporter.onRunComplete(['testValue'], {
                disconnected: false,
                error: false,
                failed: 10,
                success: 0
              });
            });

            it('should call to write all of the failed and successful specs', function () {
              newSpecReporter.write.should.have.been.calledWith(undefined, 10, 0);
            });

            it('should reset failures and currentSuite arrays', function () {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should call writeCommonMsg', function () {
              newSpecReporter.writeCommonMsg.should.have.been.called;
            });

            it('should not call to log the final errors', function () {
              newSpecReporter.logFinalErrors.should.not.have.been.called;
            });
          });

          describe('and suppressErrorSummary is false', function () {
            var newSpecReporter;
            var config = {};
            beforeEach(function () {
              newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
              newSpecReporter.logFinalErrors = sinon.spy();
              newSpecReporter.currentSuite.push('suite name');
              newSpecReporter.onRunComplete(['testValue'], {
                disconnected: false,
                error: false,
                failed: 10,
                success: 0
              });
            });

            it('should call to write all of the failed and successful specs', function () {
              newSpecReporter.write.should.have.been.calledWith(undefined, 10, 0);
            });

            it('should reset failures and currentSuite arrays', function () {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should call writeCommonMsg', function () {
              newSpecReporter.writeCommonMsg.should.have.been.called;
            });

            it('should call to log the final errors', function () {
              newSpecReporter.logFinalErrors.should.have.been.called;
            });
          });
        });
      });
    });

    describe('onSpecFailure', function () {
      describe('with FAIL_FAST option', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            failFast: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });
        it('should throw an error', function () {
          expect(function () {
            newSpecReporter.onSpecFailure([],{
              suite: [],
              log: []
            })
          }).to.throw(Error, /failFast/);
        });
      });
    });
  });
});
