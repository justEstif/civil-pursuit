(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("c4ZstC"))
},{"c4ZstC":2}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
FileAPI = {
  debug: true,
  //forceLoad: true, html5: false //to debug flash in HTML5 browsers
  //wrapInsideDiv: true, //experimental for fixing css issues
  //only one of jsPath or jsUrl.
    //jsPath: '/js/FileAPI.min.js/folder/', 
    //jsUrl: 'yourcdn.com/js/FileAPI.min.js',

    //only one of staticPath or flashUrl.
    //staticPath: '/flash/FileAPI.flash.swf/folder/'
    //flashUrl: 'yourcdn.com/js/FileAPI.flash.swf'
};

var uploadUrl = '/tools/upload';
window.uploadUrl = window.uploadUrl || 'upload';

var MyCtrl = [ '$scope', '$http', '$timeout', '$upload', function($scope, $http, $timeout, $upload) {

  $scope.howToSend = 1;

	$scope.usingFlash = FileAPI && FileAPI.upload != null;
	
  $scope.fileReaderSupported = window.FileReader != null && (window.FileAPI == null || FileAPI.html5 != false);
	
  $scope.uploadRightAway = true;
	
  $scope.hasUploader = function(index) {
		return $scope.upload[index] != null;
	};
	
  $scope.abort = function(index) {
		$scope.upload[index].abort(); 
		$scope.upload[index] = null;
	};
	
  $scope.onFileSelect = function($files) {

		$scope.selectedFiles = [];
		
    $scope.progress = [];
		
    if ($scope.upload && $scope.upload.length > 0) {
			for (var i = 0; i < $scope.upload.length; i++) {
				if ($scope.upload[i] != null) {
					$scope.upload[i].abort();
				}
			}
		}
		
    $scope.upload = [];
		
    $scope.uploadResult = [];
		
    $scope.selectedFiles = $files;
		
    $scope.dataUrls = [];
		
    for ( var i = 0; i < $files.length; i++) {
			var $file = $files[i];
			
      if ($scope.fileReaderSupported && $file.type.indexOf('image') > -1) {
				var fileReader = new FileReader();
				fileReader.readAsDataURL($files[i]);
				
        var loadFile = function(fileReader, index) {
					fileReader.onload = function(e) {
						$timeout(function() {
							$scope.dataUrls[index] = e.target.result;
						});
					}
				}(fileReader, i);
			}
			
      $scope.progress[i] = -1;
			
      if ($scope.uploadRightAway) {
				$scope.start(i);
			}
		}
	};
	
	$scope.start = function(index) {
    console.log($scope.selectedFiles);
		$scope.progress[index] = 0;
		$scope.errorMsg = null;
		if ($scope.howToSend == 1) {
			$scope.upload[index] = $upload.upload({
				url: uploadUrl,
				method: $scope.httpMethod,
				headers: {'my-header': 'my-header-value'},
				data : {
					myModel : $scope.myModel
				},
				/* formDataAppender: function(fd, key, val) {
					if (angular.isArray(val)) {
                        angular.forEach(val, function(v) {
                          fd.append(key, v);
                        });
                      } else {
                        fd.append(key, val);
                      }
				}, */
				/* transformRequest: [function(val, h) {
					console.log(val, h('my-header')); return val + '-modified';
				}], */
				file: $scope.selectedFiles[index],
				fileFormDataName: 'myFile'
			});
			$scope.upload[index].then(function(response) {
				$timeout(function() {
					$scope.uploadResult.push(response.data);
				});
			}, function(response) {
				if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
			}, function(evt) {
				// Math.min is to fix IE which reports 200% sometimes
				$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
			});
			$scope.upload[index].xhr(function(xhr){
//				xhr.upload.addEventListener('abort', function() {console.log('abort complete')}, false);
			});
		} else {
			var fileReader = new FileReader();
            fileReader.onload = function(e) {
		        $scope.upload[index] = $upload.http({
		        	url: uploadUrl,
					headers: {'Content-Type': $scope.selectedFiles[index].type},
					data: e.target.result
		        }).then(function(response) {
					$scope.uploadResult.push(response.data);
				}, function(response) {
					if (response.status > 0) $scope.errorMsg = response.status + ': ' + response.data;
				}, function(evt) {
					// Math.min is to fix IE which reports 200% sometimes
					$scope.progress[index] = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
				});
            }
	        fileReader.readAsArrayBuffer($scope.selectedFiles[index]);
		}
	};
	
	$scope.dragOverClass = function($event) {
		var items = $event.dataTransfer.items;
		var hasFile = false;
		if (items != null) {
			for (var i = 0 ; i < items.length; i++) {
				if (items[i].kind == 'file') {
					hasFile = true;
					break;
				}
			}
		} else {
			hasFile = true;
		}
		return hasFile ? "dragover" : "dragover-err";
	};
} ];

module.exports = MyCtrl;
},{}],4:[function(require,module,exports){
module.exports = function () {
  return {
    restrict: 'C',
    
    link: function ($scope, $elem, $attrs) {
      $scope.raise = function (alert) {

        if ( typeof alert === 'string' ) {
          $scope.warning = alert;
          return;
        }

        if ( alert.error ) {
          // ---- If Error has a declared status code ----------------------------------------  //
          if ( alert.error.statusCode ) {
            // ---- Show specific alerts depending on HTTP status code -----------------------  //
            switch ( alert.error.statusCode ) {
              // ---- on 401 error it meaans wrong password ----------------------------------  //
              case 401:
                $scope.warning = 'Wrong password';
                $scope.create.password = '';
                return;
              // ---- on 404 error it meaans credentias not found ----------------------------  //
              case 404:
                $scope.warning = 'Credentials not found';
                return;
            }
          }
          // ---- Show specific alerts depending on error names ------------------------------  //
          switch ( alert.error.name ) {
            case 'ValidationError':
            case 'AssertionError':
              $scope.warning = 'Invalid credentials';
              break;

            default:
              $scope.warning = 'Something went wrong. Try again in a moment.';
              break;
          }
        }
      };
    }
  };
};
},{}],5:[function(require,module,exports){
module.exports = function (EntryFactory, TopicFactory, SignFactory, EvaluationFactory, $http) {
  return {

    restrict: 'C',

    link: function ($scope, $elem, $attrs) {

      if ( $attrs.entry ) {
        EntryFactory.findById($attrs.entry)
          .success(function (data) {
            $scope.topic = data.found.topic;
            $scope.entry = data.found;
          })
      }

      // Function to clear the form

      $scope.clear = function () {
        $scope.entry.title        = '';
        $scope.entry.subject      = '';
        $scope.entry.description  = '';
        $scope.dataUrls           = [];
        
      }

      // Behavior to fetch URL's title

      $("[ng-model='entry.title']").on('change', function () {

        $scope.entry.url = $(this).val();

        $http.post('/tools/get-title', { url: $(this).val() })
          .error(function (error) {
            console.log(error);
          })
          .success(function (data) {
            console.log(data);
            $scope.entry.title = JSON.parse(data);
          });
      });

      // Function to publish entry

      $scope.create = function () {

        $scope.form_create.submitted = true;

        // Subject should not be empty

        if ( $scope.form_create.subject.$error.required ) {
          console.warn('Missing subject');
          return $scope.alert = 'Please enter a subject';
        }
        
        // Description should not be empty

        if ( $scope.form_create.description.$error.required ) {
          console.warn('Missing description');
          $scope.alert = 'Please enter a description';
          return;
        }

        // Fetch topic id by slug

        console.info('Topic', $scope.topic);

        TopicFactory
          .findBySlug( $scope.topic )
          
          .error(function (error) {
            console.error('No such topic', $scope.topic);
            $scope.alert = 'Sorry, an unexpected error has occurred. Please try again shortly!'
          })
          
          .success(function (data) {

            console.info('Topic found', $scope.topic);

            var topic = data.found;

            // Fetch user id by email

            console.info('User', $scope.email);

            SignFactory
              .findByEmail( $scope.email )

              .error(function (error) {
                console.error('User not found', $scope.email);
              })

              .success(function (data) {

                console.info('User found', $scope.email);

                var user = data.found;

                var path = require('path');

                // Create new Entry

                var entry  = {
                  subject:      $scope.form_create.subject.$modelValue,
                  description:  $scope.form_create.description.$modelValue,
                  user:         user._id,
                  topic:        topic._id,
                  image:        Array.isArray($scope.uploadResult) && $scope.uploadResult.length ?
                                  path.basename($scope.uploadResult[0].path) : null,
                  title:        $scope.form_create.title.$modelValue,
                  url:          $scope.form_create.url.$modelValue
                };

                console.info('New entry', entry);

                EntryFactory.publish(entry)

                  .error(function (error) {
                    console.error('Could not create entry', entry);
                  })

                  .success(function (data) {

                    console.info('Entry created', entry);

                    // Create new Evaluation

                    var evaluation = {
                      topic:  topic._id,
                      user:   user._id,
                      entry:  data.created._id
                    };

                    console.info('New evaluation');

                    EvaluationFactory.create(evaluation)

                      .error(function (error) {
                        console.error('Could not create evaluation', evaluation, error);
                      })
                      
                      .success(function (data) {

                        // Take user to new Evaluation

                        location.href = '/evaluate/' + data.created._id;
                      });
                  });
              });
          })
      };
    }
  };
};

},{"path":1}],6:[function(require,module,exports){
// ----- Angular directive $('.synapp-sign') ---------------------------------------------------  //
/*
 *  @abstract Angular directive for all elements with class name "synapp-sign"
 *  @return   Object directive
 *  @param    Object TopicFactory
 */
// ---------------------------------------------------------------------------------------------  //
module.exports = function (EvaluationFactory, CriteriaFactory) { // ----- uses factory/Sign.js ------------------------  //
  return {
    // ---- Restrict directive to class --------------------------------------------------------  //
    restrict: 'C',
    // ---- Link function ----------------------------------------------------------------------  //
    link: function ($scope, $elem, $attrs) {

      $scope.evaluate = {};

      $scope.evaluationDone = false;

      $scope.comparing = [];

      $scope.comparable = [0, 1, 2, 3, 4, 5];

      // Get criterias

      CriteriaFactory.find()

        .error(function (error) {

        })

        .success(function (data) {
          $scope.criterias = data.found;

          console.log($scope.criterias);
        });

      // Get Evaluation

      EvaluationFactory.findById($attrs.id)

        .error(function (error) {

        })

        .success(function (data) {
          
          data.found.entries  = data.found.entries
            .map(function (entry) {
              return entry._id;
            });
            
          $scope.evaluate     = data.found;

          $scope.left         = data.found.entries[0];
          $scope.right        = data.found.entries[1];

          $scope.comparing    = [0, 1];

        });

      //
      $scope.doIt = function ($last) {
        if ( $last ) {
          $("input.slider").slider({
            formatter: function(value) {
              return 'Current value: ' + value;
            }
          });
        }
      };

      // Promote

      $scope.promote = function (entry, position) {
        EvaluationFactory.promote($scope.evaluate._id, entry)
          .success(function (data) {

            var newEntryPosition;

            if ( position === 'left' ) {
              $scope.comparable.splice($scope.comparable.indexOf($scope.comparing[1]), 1);

              newEntryPosition = Math.min.apply(null, 
                $scope.comparable.filter(function (x) {
                  return x !== $scope.comparing[0];
                }));

              if ( newEntryPosition === Number.POSITIVE_INFINITY ) {
                $scope.evaluationDone = true;
                return;
              }

              $scope.comparing[1] = newEntryPosition;

              $scope.right = $scope.evaluate.entries[newEntryPosition];
            }

            else if ( position === 'right' ) {
              $scope.comparable.splice($scope.comparable.indexOf($scope.comparing[0]), 1);

              newEntryPosition = Math.min.apply(null, 
                $scope.comparable.filter(function (x) {
                  return x !== $scope.comparing[1];
                }));

              if ( newEntryPosition === Number.POSITIVE_INFINITY ) {
                $scope.evaluationDone = true;
                return;
              }

              $scope.comparing[0] = newEntryPosition;

              $scope.left = $scope.evaluate.entries[newEntryPosition];
            }
            
          });
      };

      // Continue

      $scope.continue = function () {
        $scope.comparable = $scope.comparable.filter(function (num) {
          return num > Math.max.apply(null, $scope.comparing);
        });

        if ( ! $scope.comparable.length ) {
          $scope.evaluationDone = true;
          return console.warn('end');
        }

        $scope.comparing  = [$scope.comparable[0], $scope.comparable[1]];

        $scope.left       = $scope.evaluate.entries[$scope.comparing[0]];
        $scope.right      = $scope.evaluate.entries[$scope.comparing[1]];
      };

      // Edit and go again

      $scope.editAndGoAgain = function () {
        location.href='/edit/' + $scope.evaluate.entry;
      };
    }
  };
};
},{}],7:[function(require,module,exports){
// ----- Angular directive $('.synapp-sign') ---------------------------------------------------  //
/*
 *  @abstract Angular directive for all elements with class name "synapp-sign"
 *  @return   Object directive
 *  @param    Object SignFactory
 */
// ---------------------------------------------------------------------------------------------  //
module.exports = function (SignFactory) { // ----- uses factory/Sign.js ------------------------  //
  return {
    // ---- Restrict directive to class --------------------------------------------------------  //
    restrict: 'C',
    // ---- Link function ----------------------------------------------------------------------  //
    link: function ($scope) {
      // ---- The `sign` object ----------------------------------------------------------------  //
      $scope.sign = {
        // ---- The alert function -------------------------------------------------------------  //
        /*
         *  @abstract   Displays an alert on UI
         *  @return     Null
         *  @param      String ^ Error alert
         */
        // -------------------------------------------------------------------------------------  //
        alert: function (alert) {
          // ---- If alert is a string, displays it such as ------------------------------------  //
          if ( typeof alert === 'string' ) {
            $scope.sign.error = alert;
            return;
          }
          // ---- If alert is an object with the property "error" ------------------------------  //
          if ( alert.error ) {
            // ---- If Error has a declared status code ----------------------------------------  //
            if ( alert.error.statusCode ) {
              // ---- Show specific alerts depending on HTTP status code -----------------------  //
              switch ( alert.error.statusCode ) {
                // ---- on 401 error it meaans wrong password ----------------------------------  //
                case 401:
                  $scope.sign.error = 'Wrong password';
                  $scope.sign.password = '';
                  return;
                // ---- on 404 error it meaans credentias not found ----------------------------  //
                case 404:
                  $scope.sign.error = 'Credentials not found';
                  return;
              }
            }
            // ---- Show specific alerts depending on error names ------------------------------  //
            switch ( alert.error.name ) {
              case 'ValidationError':
              case 'AssertionError':
                $scope.sign.error = 'Invalid credentials';
                break;

              default:
                $scope.sign.error = 'Something went wrong. Try again in a moment.';
                break;
            }
          }
        },
        // ---- The sign in function -----------------------------------------------------------  //
        /*
         *  @abstract   Displays an alert on UI
         *  @return     Null
         *  @param      String ^ Error alert
         */
        // -------------------------------------------------------------------------------------  //
        in: function () {
          // ----- Displays an alert on empty email --------------------------------------------  //
          if ( ! $scope.sign.email ) {
            $scope.sign.alert('Please enter a valid email');
            return;
          }
          // ----- Displays an alert on empty password -----------------------------------------  //
          if ( ! $scope.sign.password ) {
            $scope.sign.alert('Please enter a password');
            return;
          }
          // ----- On empty password confirmation, assume U wants to sign-in -------------------  //
          if ( ! $scope.sign.password_confirm ) {
            SignFactory.in(
              {
                email: $scope.sign.email,
                password: $scope.sign.password
              })

              .error(function (error) {
                if ( error.error && error.error.statusCode && error.error.statusCode === 404 ) {
                  return $scope.sign._up = true;
                }
                $scope.sign.alert(error);
              })

              .success(function (data) {
                $scope.isSignedIn = true;
                location.reload();
              });

            return;
          }
          // ----- On password confirm not empty but not matching ------------------------------  //
          if ( $scope.sign.password !== $scope.sign.password_confirm ) {
            return $scope.sign.alert("Passwords don't match");
          }
          // ----- Still here? Assuming by deduction U wants to sign up ------------------------  //
          // ----- Calling the method up() of factory/Sign -------------------------------------  //
          return SignFactory.up(
            // ----- Credentials ---------------------------------------------------------------  //
            {
              email:    $scope.sign.email,
              password: $scope.sign.password
            })
            // ----- On factory error ----------------------------------------------------------  //
            .error(function (error) {
              $scope.sign.alert(error);
            })
            // ----- On factory sucess ---------------------------------------------------------  //
            .success(function (data) {
              // ----- Letting the UI knowns user is signed in ---------------------------------  //
              $scope.isSignedIn = true;
              location.reload();
            });
        }
      };
    }
  };
};
},{}],8:[function(require,module,exports){
module.exports = function (EntryFactory) {
  return {
    restrict: 'C',
    link: function ($scope, $elem, $attrs) {

      var entry = $attrs.entry;

      EntryFactory.findById(entry)

        .success(function (data) {
          $scope.entry = data.found;
        });
    }
  };
};
},{}],9:[function(require,module,exports){
// ----- Angular directive $('.synapp-sign') ---------------------------------------------------  //
/*
 *  @abstract Angular directive for all elements with class name "synapp-sign"
 *  @return   Object directive
 *  @param    Object TopicFactory
 */
// ---------------------------------------------------------------------------------------------  //
module.exports = function (TopicFactory, EvaluationFactory, SignFactory) { // ----- uses factory/Sign.js ------------------------  //
  return {
    // ---- Restrict directive to class --------------------------------------------------------  //
    restrict: 'C',
    // ---- Link function ----------------------------------------------------------------------  //
    link: function ($scope) {
      $scope.selectedTopic =  'none';

      $scope.selectMeAsTopic = function (id) {
        $scope.selectedTopic = id;
      };

      $scope.evaluate = function (topicSlug) {
        TopicFactory.findBySlug(topicSlug)

          .success(function (topic) {

            SignFactory.findByEmail($scope.email)

              .success(function (user) {
                EvaluationFactory.create({
                  topic:    topic.found._id,
                  user:     user.found._id
                })

                  .success(function (data) {
                    location.href = '/evaluate/' + data.created._id;
                  });
              });
          });
      };

      TopicFactory.find()
        .error(function (error) {
          console.error(error);
        })
        .success(function (data) {
          $scope.topics = data.found;
        });
    }
  };
};
},{}],10:[function(require,module,exports){
module.exports = function ($http) {
  return {
    find: function () {
      return $http.get('/json/Criteria');
    }
  };
};
},{}],11:[function(require,module,exports){
module.exports = function ($http) {
  return {
    find: function () {
      return $http.get('/json/Entry');
    },

    findById: function (id) {
      return $http.get('/json/Entry/findById/' + id);
    },

    evaluate: function (topic) {
      return $http.get('/json/Entry/statics/evaluate/' + topic);
    },

    publish: function (entry) {
      return $http.post('/json/Entry', entry);
    }
  };
};
},{}],12:[function(require,module,exports){
module.exports = function ($http) {
  return {
    create: function (evaluation) {
      return $http.post('/json/Evaluation', evaluation);
    },

    findById: function (id) {
      return $http.get('/json/Evaluation/findById/' + id + '?$populate=topic entries._id');
    },

    promote: function (id, entry) {
      return $http.get('/json/Evaluation/statics/promote/' + id + '/' + entry);
    }
  };
};
},{}],13:[function(require,module,exports){
module.exports = function ($http) {
  return {
    in: function (creds) {
      return $http.post('/sign/in', creds);
    },

    up: function (creds) {
      return $http.post('/sign/up', creds);
    },

    findByEmail: function (email) {
      return $http.get('/json/User/findOne?email=' + email);
    }
  };
};
},{}],14:[function(require,module,exports){
module.exports = function ($http) {
  return {
    find: function () {
      return $http.get('/json/Topic');
    },

    findBySlug: function (slug) {
      return $http.get('/json/Topic/findOne?slug=' + slug);
    }
  };
};
},{}],15:[function(require,module,exports){
;(function () {
  
  // DEPENDENCIES

  var deps = [];

  if ( typeof createPage === 'boolean' ) {
    deps.push('angularFileUpload', 'autoGrow');
  }

  // MODULE

  angular.module('synapp', deps)

  // FACTORIES

    .factory({
      'SignFactory':          require('./factory/Sign'),
      'TopicFactory':         require('./factory/Topic'),
      'EntryFactory':         require('./factory/Entry'),
      'EvaluationFactory':    require('./factory/Evaluation'),
      'CriteriaFactory':      require('./factory/Criteria')
    })

  // CONTROLLERS

    .controller({
      'UploadCtrl':           require('./controller/upload')
    })

  // DIRECTIVES

    .directive({
      'synappSign':           require('./directive/sign'),
      'synappTopics':         require('./directive/topics'),
      'synappCreate':         require('./directive/create'),
      'synappEvaluate':       require('./directive/evaluate'),
      'synappAlert':          require('./directive/alert'),
      'synappSummary':        require('./directive/summary')
    });
  
})();

},{"./controller/upload":3,"./directive/alert":4,"./directive/create":5,"./directive/evaluate":6,"./directive/sign":7,"./directive/summary":8,"./directive/topics":9,"./factory/Criteria":10,"./factory/Entry":11,"./factory/Evaluation":12,"./factory/Sign":13,"./factory/Topic":14}]},{},[15])