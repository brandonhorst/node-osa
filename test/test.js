var chai = require('chai');
var expect = chai.expect;
var osa = require('../lib/osa');

/* eslint-env mocha */

describe('osa', function () {
  it('runs a function and returns its result', function (done) {
    function callback (err, result, messages) {
      expect(err).to.not.exist;
      expect(result).to.equal(2);
      expect(messages).to.be.null;
      done();
    }
    osa(function (x) {return x + 1;}, 1, callback);
  });

  it('returns an error if one is thrown', function (done) {
    function callback (err, result) {
      expect(err).to.exist;
      // expect(err.message).to.contain('myError')
      done();
    }
    osa(function () {throw new Error('myError')}, callback);
  });

  it('interacts with the osa globals', function (done) {
    function callback (err, result) {
      expect(err).to.not.exist;
      expect(result).to.equal('/tmp/not/a/real/file.txt');
      done();
    }

    function osaFunction () {
      /* global Path */
      return Path('/tmp/not/a/real/file.txt').toString();
    }

    osa(osaFunction, callback);
  });

  it('returns nothing if nothing was returned', function (done) {
    function callback (err, result) {
      expect(err).to.not.exist;
      expect(result).to.be.undefined;
      done();
    }

    osa(function () {}, callback);
  });

  it('throws an error when non-JSON data is returned', function (done) {
    function callback (err, result) {
      expect(err).to.exist;
      done();
    }

    osa(function () {return /test/;}, callback);
  });

  it('returns things logged in osa', function (done) {
    function callback (err, result, log) {
      expect(err).to.not.exist;
      expect(result).to.equal('test');
      expect(log).to.equal('a message\nanother message');
      done();
    }

    function osaFunction () {
      console.log('a message\nanother message');
      return 'test';
    }

    osa(osaFunction, callback);
  });

  it('reports errors by line', function (done) {
    function callback (err, result, log) {
      expect(err).to.exist;
      expect(err.toString()).to.contain('Error on line 3');
      expect(result).to.equal(undefined);
      expect(log).to.equal(undefined);
      done();
    }

    function osaFunction () {                    // line 1, line comments are now supported
      console.log('a message\nanother message'); // line 2
      var a = errorSource.inLine3;               // line 3
      return 'test';                             // line 4
    }

    osa(osaFunction, callback);
  });

  it('works fine with no callback', function (done) {
    function osaFunction () {
      return 'test';
    }

    setTimeout(function () {
      done()
    }, 1000);

    expect(function () {
      osa(osaFunction);
    }).to.not.throw(Error);
  });
});
