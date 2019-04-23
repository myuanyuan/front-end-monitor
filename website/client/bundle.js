(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var errCatch = {
    // 监控不到图片404 可以用过window.addEventListener('error', fn, true)来实现
    // 如果是promise失败也不能通过onerror,可以通过unhandledrejection来捕获
    // unhandledrejection 即可捕获到未处理的Promise错误：
    init: function init(cb) {
      window.onerror = function (msg, url, lineNo, columnNo, error) {
        console.dir(error);
        var stack = error.stack;
        var matchUrl = stack.match(/http:\/\/[^\n]*/)[0];
        var fileName = matchUrl.match(/http:\/\/(?:\S*)\.js/)[0];

        var _matchUrl$match = matchUrl.match(/:(\d+):(\d+)/),
            _matchUrl$match2 = _slicedToArray(_matchUrl$match, 3),
            row = _matchUrl$match2[1],
            column = _matchUrl$match2[2];

        var info = {
          message: error.message,
          name: error.name,
          matchUrl: matchUrl,
          fileName: fileName,
          row: row,
          column: column
        };
        cb(info);
      };
    }
  };

  // dom解析信息
  errCatch.init(function (data) {
    console.log(data);
  });

}));
