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

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
chai.use(sinonChai);
var should = chai.should();
var expect = chai.expect;
var os = require('os');
var SpecReporter = require('../index.js')['reporter:spec'];

var ansiColors = {
  red: '\u001b[31m',
  yellow: '\u001b[33m',
  green: '\u001b[32m',
  reset: '\u001b[39m'
};
var windowsIcons = {
  success: '\u221A ',
  failure: '\u00D7 ',
  skipped: '- '
};

//baseReporterDecorator functions
var formatError = function(a, b) {
  return a + b;
};
function noop() {}
var baseReporterDecorator = function(context) {
  context.renderBrowser = sinon.spy();
  context.writeCommonMsg = sinon.spy();
  context.write = sinon.spy();
};
var originalPlatform = '';
describe('SpecReporter', function() {
  describe('when initializing', function() {
    describe('and on a windows machine', function() {
      after(function(done){
        Object.defineProperty(process, 'platform', {
           value: originalPlatform
        });
        done();
      })
      function createSpecReporter(config) {
        config = config || {};
        originalPlatform = process.platform;
        Object.defineProperty(process, 'platform', {
           value: 'win32'
        });
        return new SpecReporter[1](baseReporterDecorator, formatError, config);
      }

      it('SpecReporter should have icons defined appropriately', function() {
        var newSpecReporter = createSpecReporter();
        newSpecReporter.prefixes.success.should.equal(windowsIcons.success);
        newSpecReporter.prefixes.failure.should.equal(windowsIcons.failure);
        newSpecReporter.prefixes.skipped.should.equal(windowsIcons.skipped);
      });

      function createConfigWithPrefixes(prefixes) {
        return {
          specReporter: {
            prefixes: prefixes
          }
        };
      }
      it('SpecReporter should allow overriding success icon only', function() {
        var expected = 'PASS';
        var config = createConfigWithPrefixes({ success: expected });
        var newSpecReporter = createSpecReporter(config);
        newSpecReporter.prefixes.success.should.equal(expected);
        newSpecReporter.prefixes.failure.should.equal(windowsIcons.failure);
        newSpecReporter.prefixes.skipped.should.equal(windowsIcons.skipped);
      });

      it('SpecReporter should allow overriding failure icon only', function() {
        var expected = 'FAIL';
        var config = createConfigWithPrefixes({ failure: expected });
        var newSpecReporter = createSpecReporter(config);
        newSpecReporter.prefixes.success.should.equal(windowsIcons.success);
        newSpecReporter.prefixes.failure.should.equal(expected);
        newSpecReporter.prefixes.skipped.should.equal(windowsIcons.skipped);
      });

      it('SpecReporter should allow overriding skipped icon only', function() {
        var expected = 'SKIPPED';
        var config = createConfigWithPrefixes({ skipped: expected });
        var newSpecReporter = createSpecReporter(config);
        newSpecReporter.prefixes.success.should.equal(windowsIcons.success);
        newSpecReporter.prefixes.failure.should.equal(windowsIcons.failure);
        newSpecReporter.prefixes.skipped.should.equal(expected);
      });

      it('SpecReporter should allow overriding all icons', function() {
        var config = createConfigWithPrefixes({
          skipped: 'Skipped',
          failure: 'Failed',
          success: 'Win!'
        });
        var expected = config.specReporter.prefixes;
        var newSpecReporter = createSpecReporter(config);
        newSpecReporter.prefixes.success.should.equal(expected.success);
        newSpecReporter.prefixes.failure.should.equal(expected.failure);
        newSpecReporter.prefixes.skipped.should.equal(expected.skipped);
      });
    });
    describe('and colors are not defined', function() {
      var newSpecReporter;
      var config = {};

      beforeEach(function() {
        newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
      });

      it('SpecReporter should be defined appropriately', function() {
        SpecReporter[0].should.equal('type');
        newSpecReporter.should.be.a('object');
      });

      it('should set USE_COLORS to false by default', function() {
        newSpecReporter.USE_COLORS.should.equal(false);
      });
    });
    describe('and colors are defined', function() {
      var newSpecReporter;
      var config = {
        colors: true
      };

      beforeEach(function() {
        newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
      });

      it('SpecReporter should be defined appropriately', function() {
        SpecReporter[0].should.equal('type');
        newSpecReporter.should.be.a('object');
      });

      it('should set USE_COLORS to true', function() {
        newSpecReporter.USE_COLORS.should.equal(true);
      });

      it("should set the BaseReporter function's colors", function() {
        newSpecReporter.SPEC_FAILURE.should.equal(ansiColors.red + '%s %s FAILED' + ansiColors.reset + '\n');
        newSpecReporter.SPEC_SLOW.should.equal(ansiColors.yellow + '%s SLOW %s: %s' + ansiColors.reset + '\n');
        newSpecReporter.ERROR.should.equal(ansiColors.red + '%s ERROR' + ansiColors.reset + '\n');
        newSpecReporter.FINISHED_ERROR.should.equal(ansiColors.red + ' ERROR' + ansiColors.reset);
        newSpecReporter.FINISHED_SUCCESS.should.equal(ansiColors.green + ' SUCCESS' + ansiColors.reset);
        newSpecReporter.FINISHED_DISCONNECTED.should.equal(ansiColors.red + ' DISCONNECTED' + ansiColors.reset);
        newSpecReporter.X_FAILED.should.equal(ansiColors.red + ' (%d FAILED)' + ansiColors.reset);
        newSpecReporter.TOTAL_SUCCESS.should.equal(ansiColors.green + 'TOTAL: %d SUCCESS' + ansiColors.reset + '\n');
        newSpecReporter.TOTAL_FAILED.should.equal(
          ansiColors.red + 'TOTAL: %d FAILED, %d SUCCESS' + ansiColors.reset + '\n'
        );
      });
    });

    describe('and there are configurations set for the spec reporter', function() {
      describe('and suppressFailed is truthy', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            suppressFailed: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSkipped', function() {
          expect(newSpecReporter.specFailure()).to.equal();
        });
      });

      describe('and suppressSkipped is truthy', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            suppressSkipped: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSkipped', function() {
          expect(newSpecReporter.specSkipped()).to.equal();
        });
      });

      describe('and suppressPassed is truthy', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            suppressPassed: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should return nothing for specSuccess', function() {
          expect(newSpecReporter.specSuccess()).to.equal();
        });
      });

      describe('and suppressSummary is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            suppressSummary: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the suppressSummary flag to true', function() {
          newSpecReporter.suppressSummary.should.equal(true);
        });
      })

      describe('and suppressErrorSummary is truthy', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            suppressErrorSummary: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the suppressErrorSummary flag to true', function() {
          newSpecReporter.suppressErrorSummary.should.equal(true);
        });
      });

      describe('and showSpecTiming is truthy', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            showSpecTiming: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the showSpecTiming flag to true', function() {
          newSpecReporter.showSpecTiming.should.equal(true);
        });
      });

      describe('and showBrowser is truthy', function () {
        var newSpecReporter;
        var config = {};
        beforeEach(function () {
          config.specReporter = {
            showBrowser: true,
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });

        it('should set the showBrowser flag to true', function () {
          newSpecReporter.showBrowser.should.equal(true);
        });
      });
    });
  });

  describe('functionality', function() {
    describe('onRunComplete', function() {
      describe('with no browsers', function() {
        var newSpecReporter;
        var config = {};

        beforeEach(function() {
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);

          newSpecReporter.currentSuite.push('suite name');
          newSpecReporter.onRunComplete([], []);
        });

        it('should reset failures and currentSuite arrays', function() {
          newSpecReporter.currentSuite.length.should.equal(0);
          newSpecReporter.failures.length.should.equal(0);
        });

        it('should call writeCommonMsg', function() {
          newSpecReporter.writeCommonMsg.should.have.been.called;
        });

        it('should call write', function() {
          newSpecReporter.write.should.have.been.called;
        });
      });

      describe('with browsers', function() {
        describe('and there are no failures', function() {
          describe('and suppressSummary is true', function() {
            var newSpecReporter;
            var config = {
              specReporter: {
                suppressSummary: true
              }
            };

            beforeEach(function() {
              newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
              newSpecReporter.currentSuite.push('suite name');
              newSpecReporter.onRunComplete(['testValue'], {
                disconnected: false,
                error: false,
                failed: 0,
                success: 10
              });
            });

            it('should not call to write all of the successful specs', function() {
              newSpecReporter.write.should.have.been.calledOnce;
              newSpecReporter.write.should.have.been.calledWithExactly('\n');
            });

            it('should reset failures and currentSuite arrays', function() {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should not call writeCommonMsg', function() {
              newSpecReporter.writeCommonMsg.should.not.have.been.called;
            });
          });

          describe('and suppressSummary is false', function() {
            var newSpecReporter;
            var config = {};

            beforeEach(function() {
              newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
              newSpecReporter.currentSuite.push('suite name');
              newSpecReporter.onRunComplete(['testValue'], {
                disconnected: false,
                error: false,
                failed: 0,
                success: 10
              });
            });

            it('should call to write all of the successful specs', function() {
              newSpecReporter.write.should.have.been.calledWith(undefined, 10);
            });

            it('should reset failures and currentSuite arrays', function() {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should call writeCommonMsg', function() {
              newSpecReporter.writeCommonMsg.should.have.been.called;
            });
          });
        });

        describe('and there are failures', function() {
          describe('and suppressErrorSummary is true', function() {
            var newSpecReporter;
            var config = {
              specReporter: {
                suppressErrorSummary: true
              }
            };
            beforeEach(function() {
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

            it('should call to write all of the failed and successful specs', function() {
              newSpecReporter.write.should.have.been.calledWith(undefined, 10, 0);
            });

            it('should reset failures and currentSuite arrays', function() {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should call writeCommonMsg', function() {
              newSpecReporter.writeCommonMsg.should.have.been.called;
            });

            it('should not call to log the final errors', function() {
              newSpecReporter.logFinalErrors.should.not.have.been.called;
            });
          });

          describe('and suppressErrorSummary is false', function() {
            var newSpecReporter;
            var config = {};
            beforeEach(function() {
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

            it('should call to write all of the failed and successful specs', function() {
              newSpecReporter.write.should.have.been.calledWith(undefined, 10, 0);
            });

            it('should reset failures and currentSuite arrays', function() {
              newSpecReporter.currentSuite.length.should.equal(0);
              newSpecReporter.failures.length.should.equal(0);
            });

            it('should call writeCommonMsg', function() {
              newSpecReporter.writeCommonMsg.should.have.been.called;
            });

            it('should call to log the final errors', function() {
              newSpecReporter.logFinalErrors.should.have.been.called;
            });
          });
        });

        describe('and there are slow running tests', () => {
          var newSpecReporter;
          var config = {
            reportSlowerThan: 200
          };
          beforeEach(function() {
            newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
            newSpecReporter.logFinalSlow = sinon.spy();
            newSpecReporter.currentSuite.push('suite name');
            newSpecReporter.onRunComplete(['testValue'], {
              disconnected: false,
              error: false,
              failed: 10,
              success: 0
            });
          });

          it('should not call to log the final errors', function() {
            newSpecReporter.logFinalSlow.should.have.been.called;
          });
        });
      });
    });

    describe('logFinalErrors', function() {
      var writtenMessages = [];
      beforeEach(function() {
        writtenMessages = [];
      });
      function passThrough(str) {
        return str;
      }
      function createSpecReporter(options) {
        var result = new SpecReporter[1](baseReporterDecorator, passThrough, options || {});
        result.writeCommonMsg = function(str) {
          writtenMessages.push(str);
        };
        return result;
      }

      it('should write a single failure out', function() {
        var errors = [
          {
            suite: ['A', 'B'],
            description: 'should do stuff',
            log: ['The Error!']
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[31m1) should do stuff\n\u001b[39m',
          '\u001b[31m     A B\n\u001b[39m',
          '     \u001b[90mThe Error!\u001b[39m',
          '\n'
        ];
        var specReporter = createSpecReporter();
        specReporter.logFinalErrors(errors);
        writtenMessages.should.eql(expected);
      });

      it('should truncate messages exceding maxLogLines in length', function() {
        var errors = [
          {
            suite: ['A', 'B'],
            description: 'should do stuff',
            log: ['The Error!\nThis line should be discarded']
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[31m1) should do stuff\n\u001b[39m',
          '\u001b[31m     A B\n\u001b[39m',
          '     \u001b[90mThe Error!\u001b[39m',
          '\n'
        ];
        var specReporter = createSpecReporter({
          specReporter: {
            maxLogLines: 1
          }
        });
        specReporter.logFinalErrors(errors);
        writtenMessages.should.eql(expected);
      });

      it('should write out multiple failures', function() {
        var errors = [
          {
            suite: ['A', 'B'],
            description: 'should do stuff',
            log: ['The Error!']
          },
          {
            suite: ['C', 'D'],
            description: 'should do more stuff',
            log: ['Another error!']
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[31m1) should do stuff\n\u001b[39m',
          '\u001b[31m     A B\n\u001b[39m',
          '     \u001b[90mThe Error!\u001b[39m',
          '\n',
          '\u001b[31m2) should do more stuff\n\u001b[39m',
          '\u001b[31m     C D\n\u001b[39m',
          '     \u001b[90mAnother error!\u001b[39m',
          '\n'
        ];
        var specReporter = createSpecReporter();
        specReporter.logFinalErrors(errors);
        writtenMessages.should.eql(expected);
      });
    });

    describe('logFinalSlow', function() {
      var writtenMessages = [];
      beforeEach(function() {
        writtenMessages = [];
      });
      function passThrough(str) {
        return str;
      }
      function createSpecReporter(options) {
        var result = new SpecReporter[1](baseReporterDecorator, passThrough, options || {});
        result.writeCommonMsg = function(str) {
          writtenMessages.push(str);
        };
        return result;
      }

      it('should write a single slow poke out', function() {
        var slowPokes = [
          {
            fullName: 'Suite like honey',
            time: 200
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[33mSLOW: 1\n\n\u001b[39m',
          '\u001b[33m5 Slowest: \n\u001b[39m',
          '\u001b[33m1) Suite like honey (200)\n\u001b[39m'
        ];
        var specReporter = createSpecReporter({ reportSlowerThan: 199 });
        specReporter.logFinalSlow(slowPokes);
        writtenMessages.should.eql(expected);
      });
      it('should sort by most slowest to least slowest', function() {
        var slowPokes = [
          {
            fullName: 'Least slowest',
            time: 300
          },
          {
            fullName: 'Least slowest',
            time: 300
          },
          {
            fullName: 'Most slowest',
            time: 500
          },
          {
            fullName: 'Next most slowest',
            time: 400
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[33mSLOW: 4\n\n\u001b[39m',
          '\u001b[33m5 Slowest: \n\u001b[39m',
          '\u001b[33m1) Most slowest (500)\n\u001b[39m',
          '\u001b[33m2) Next most slowest (400)\n\u001b[39m',
          '\u001b[33m3) Least slowest (300)\n\u001b[39m',
          '\u001b[33m4) Least slowest (300)\n\u001b[39m'
        ];
        var specReporter = createSpecReporter({ reportSlowerThan: 199 });
        specReporter.logFinalSlow(slowPokes);
        writtenMessages.should.eql(expected);
      });
      it('should only report the top 5 slowest', function() {
        var slowPokes = [
          {
            fullName: 'Least slowest',
            time: 500
          },
          {
            fullName: 'Next most slowest',
            time: 600
          },
          {
            fullName: 'Next most slowest',
            time: 700
          },
          {
            fullName: 'Next most slowest',
            time: 800
          },
          {
            fullName: 'Next most slowest',
            time: 900
          },
          {
            fullName: 'Most slowest',
            time: 1000
          }
        ];
        var expected = [
          '\n\n',
          '\u001b[33mSLOW: 6\n\n\u001b[39m',
          '\u001b[33m5 Slowest: \n\u001b[39m',
          '\u001b[33m1) Most slowest (1000)\n\u001b[39m',
          '\u001b[33m2) Next most slowest (900)\n\u001b[39m',
          '\u001b[33m3) Next most slowest (800)\n\u001b[39m',
          '\u001b[33m4) Next most slowest (700)\n\u001b[39m',
          '\u001b[33m5) Next most slowest (600)\n\u001b[39m'
        ];
        var specReporter = createSpecReporter({ reportSlowerThan: 199 });
        specReporter.logFinalSlow(slowPokes);
        writtenMessages.should.eql(expected);
      });
    });

    describe('onSpecFailure', function() {
      describe('with FAIL_FAST option', function() {
        var newSpecReporter;
        var config = {};
        beforeEach(function() {
          config.specReporter = {
            failFast: true
          };
          newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, config);
        });
        it('should throw an error', function() {
          expect(function() {
            newSpecReporter.onSpecFailure([], {
              suite: [],
              log: []
            });
          }).to.throw(Error, /failFast/);
        });
      });
    });

    describe('logSlowPoke', function() {
      let newSpecReporter;
      beforeEach(function() {
        newSpecReporter = new SpecReporter[1](baseReporterDecorator, formatError, {});
        newSpecReporter.logSlowPoke({ id: 1 });
      });
      it('should append the slow test', function() {
        expect(newSpecReporter.slowPokes[0].id).to.equal(1);
      });
    });
  });
});
