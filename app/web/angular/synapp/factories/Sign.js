/**
 * `UserFactory` User Factory (legacy from SignCtrl)
 * 
 * @module synapp
 * @submodule factories
 * @method factory::user
 * @return {AngularFactory}
 * @author francoisrvespa@gmail.com
*/

;(function () {
  module.exports = ['$http', SignFactory];

  function SignFactory ($http) {
    return {
      signIn: function (creds) {
        return $http.post('/sign/in', creds);
      },

      signUp: function (creds) {
        return $http.post('/sign/up', creds);
      }
    };
  };
})();
