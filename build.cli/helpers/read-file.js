'use strict';

// TODO: We can separate this functionality into separate files for node/browser
// TODO: Use async/await with mz/fs

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var base64url = require('base64url');

function readFile(_ref) {
  var file = _ref.file;

  // Write to file, return promise
  return new _promise2.default(function (resolve, reject) {
    if (file.startsWith('data:')) {
      var data = base64url.decode(file.substr(file.indexOf(',')));
      resolve(data);
    } else if (fs && fs.readFile) {
      // Use node FS to read
      fs.readFile(file, function (err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    } else {
      reject('Cannot read file');
    }
  });
}

module.exports = readFile;