// ---------------------------------------------------------------------------------------------- \\
var should = require('should');
// ---------------------------------------------------------------------------------------------- \\
var Log = require('String-alert')({ prefix: 'synapp ' + 'sign'.grey });
// ---------------------------------------------------------------------------------------------- \\
module.exports = function (req, res, next) {
    /******************************************************************************** SMOKE-TEST **/
    // ------------------------------------------------------------------------------------------ \\
    req                               .should.be.an.Object;
    // ------------------------------------------------------------------------------------------ \\
    req.constructor.name              .should.equal('IncomingMessage');
    // ------------------------------------------------------------------------------------------ \\
    res                               .should.be.an.Object;
    // ------------------------------------------------------------------------------------------ \\
    res.constructor.name              .should.equal('ServerResponse');
    // ------------------------------------------------------------------------------------------ \\
    next                              .should.be.a.Function;
    // ------------------------------------------------------------------------------------------ \\
  /********************************************************************************   DOMAIN     **/
  // -------------------------------------------------------------------------------------------- \\
  var domain = require('domain').create();
  // -------------------------------------------------------------------------------------------- \\
  domain.on('error', function (error) {
    return next(error);
  });
  // -------------------------------------------------------------------------------------------- \\
  domain.run(function () {
    Log.INFO('Attempt to get title from %s'.format(req.body.url));
    // ------------------------------------------------------------------------------------------ \\
    require('request')(req.body.url, domain.intercept(function (response, body) {
      if ( response.statusCode === 200 ) {
        body.replace(/<title>(.+)<\/title>/, function (matched, title) {
          res.json(title);
        });
      }
    }));
    // ------------------------------------------------------------------------------------------ \\
  });
  // -------------------------------------------------------------------------------------------- \\
};