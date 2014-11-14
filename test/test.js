var chai = require('chai');
var expect = chai.expect;
var osa = require('../lib/osa');

describe('osa', function () {

  it('runs a function and returns its result', function (done) {
    function callback(err, result, messages) {
      expect(err).to.not.exist;
      expect(result).to.equal(2);
      expect(messages).to.be.null;
      done();
    }
    osa(function (x) {return x + 1}, 1, callback);
  });

  it('returns an error if one is thrown', function (done) {
    function callback(err, result) {
      expect(err).to.exist;
      // expect(err.message).to.contain('myError');
      done();
    }
    osa(function () {throw new Error('myError')}, callback);
  });

  it('interacts with the osa globals', function (done) {
    function callback(err, result) {
      expect(err).to.not.exist;
      expect(result).to.equal('/tmp/not/a/real/file.txt');
      done();
    }

    function osaFunction() {
      return Path('/tmp/not/a/real/file.txt').toString();
    }

    osa(osaFunction, callback);
  });

  it('throws without a return', function (done) {
    function callback(err, result) {
      expect(err).to.exist;
      done();
    }

    osa(function () {}, callback);
  });

  it('returns things logged in osa', function (done) {
    function callback(err, result, log) {
      expect(err).to.not.exist;
      expect(result).to.equal('test');
      expect(log).to.equal('a message\nanother message');
      done();
    }

    function osaFunction() {
      console.log('a message\nanother message');
      return 'test';
    }

    osa(osaFunction, callback);
  });

});
