;(function () {

  module.exports = ['$timeout', 'Channel', ToggleArrow];

  function ToggleArrow ($timeout, Channel) {
    return {
      restrict: 'C',
      scope: true,
      link: function ($scope, $elem, $attrs) {

        $scope.toggle = false;

        $scope.unused = true;

        $elem.on('click', function () {

          $scope.toggle = ! $scope.toggle;

          if ( $scope.toggle ) {
            $elem
              .removeClass('fa-arrow-circle-down')
              .addClass('fa-arrow-circle-up');
          }
          else {
            $elem
              .removeClass('fa-arrow-circle-up')
              .addClass('fa-arrow-circle-down');
          }

          var target = $elem.closest('.box-wrapper').find('.nested-panels:eq(0)');

          target.collapse('toggle');

          if ( $scope.unused ) {
            Channel.emit($attrs.itemId, 'showing');

            var adjust = $(window).height() / 2;

            $scope.unused = false;
          }
        });
      }
    };
  }

})();
