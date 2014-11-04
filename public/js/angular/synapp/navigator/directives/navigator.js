;(function () {

  function NavigatorComponent ($rootScope, $timeout, $compile, DataFactory) {

    var on, emit, broadcast;

    return {
      restrict:       'C',
      scope:          {
        type: '@',
        from: '@',
        autoload: '@'
      },
      templateUrl:    '/templates/navigator',
      controller:     function ($scope) {

        $scope.state = 0;

        console.info('NAVIGATOR', {
          type: $scope.type,
          from: $scope.from,
          autoload: $scope.autoload,
          id: $scope.$id,
          parent: $scope.$parent.$id
        });

        on = function (event, callback) {
          $rootScope.$on($scope.$id + ' ' + event, callback)
        }

        emit = function (event, message) {
          console.info('EMIT', $scope.$id, event, message);
          $scope.$emit($scope.$id + ' ' + event, message);
        }

        broadcast = function (event, message) {
          console.info('BROADCAST', $scope.$id, event, message);
          $scope.$broadcast($scope.$id + ' '  + event, message);
        }

        $scope.getItems = function (cb) {
          // GET TOPICS

          DataFactory[$scope.type].get($scope.from)
            .success(function (items) {

              $scope.items = items;

              if ( items.length ) {
                emit('got items of type ' + items[0].type, items);
              }

              if ( cb ) {
                cb();
              }
            });
        }

        // UPDATE ITEMS

        on('created item', function (event, item) {
          $scope.items.push(item);
        });
      },
      
      link: function ($scope, $elem, $attr) {

        if ( $scope.autoload ) {
          $scope.getItems();
        }

        // Plus icon behavior to toggle editor's visibility

        function toggle_editor_view () {
          $elem.find('.fa-plus').on('click', function () {
            $(this).closest('.panel').find('.synapp-editor').collapse('toggle');
          });
        }

        toggle_editor_view();        

        // Compile nested panels directive

        function compileDirective (type, item) {
          var tpl = '<div data-type="' + type + '" data-from=":from:" class="synapp-navigator"></div>';
          return $compile(tpl.replace(/:from:/, item._id))($scope);
        }

        on('got items of type ' + $scope.type, function (event, items) {
          console.info('RECEIVED', $scope.$id, 'got items of type ' + $scope.type);
          $timeout(function () {

            var has = synapp['item relation'][$scope.type];

            if ( has ) {
              items.forEach(function (item, i) {

                var target = $elem.find('.nested-panels:eq(' + i + ')');
                var row = $('<div class="row"></div>');

                target.empty();

                if ( Array.isArray( has ) ) {
                  has.forEach(function (type) {

                    if ( Array.isArray( type ) ) {
                      
                      var col1 = $('<div class="col-xs-6"></div>');
                      col1.append(compileDirective(type[0], item));
                      
                      var col2 = $('<div class="col-xs-6"></div>');
                      col2.append(compileDirective(type[1], item));
                      
                      row.append(col1, col2);
                      target.append(row);
                    }
                    else {
                      target.append(compileDirective(type, item));
                    }
                  });
                }

                else {
                  target.append(compileDirective(has, item));
                }
              });
            }
          });
        });

        on('expand items', function (event, parent) {
          console.info('RECEIVED expand items', $scope.id, parent);
          if ( ! $scope.state ) {
            $scope.state = 1;
            $scope.getItems();
          }
        });

        // Function to toggle show/hide elements

        $scope.toggle = function (what, $event) {
          
          $($event.target).closest('.box-wrapper').find('.synapp-' + what + ':eq(0)').collapse('toggle');
        }

        function onExpand ($event) {
          console.info('EXPANDING',{ state: $scope.state, 
            autoload: $scope.autoload });

          $('.collapse.in')

            .each(function () {
              if ( ! $(this).has($event.target).length ) {
                $(this).collapse('hide');
              }
            });

          emit('expand items', $scope.$id);
        }

        function onExpanded ($event) {
          console.log('Hey! I have expend');
        }

        function onCollapse ($event) {
          console.log('Hey! I am collapsing');
        }

        function onCollapsed ($event) {
          console.log('Hey! I have collapsed');
        }

        $elem
          .on('show.bs.collapse',   onExpand)
          .on('shown.bs.collapse',  onExpanded)
          .on('hide.bs.collapse',   onCollapse)
          .on('hidden.bs.collapse', onCollapsed);

        $rootScope.$on('go to', function (event, route) {
          console.log('got go to', route);
        });
      }
    };
  }

  module.exports = ['$rootScope', '$timeout', '$compile', 'DataFactory', NavigatorComponent];

})();
