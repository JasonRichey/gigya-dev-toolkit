'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _ = require('lodash');
var GigyaDataservice = require('./dataservices/gigya.dataservice');
var writeFile = require('./helpers/write-file');
var readFile = require('./helpers/read-file');
var jsdiff = require('diff');

var toolkit = function _callee(_ref) {
  var userKey = _ref.userKey;
  var userSecret = _ref.userSecret;
  var task = _ref.task;
  var settings = _ref.settings;
  var partnerId = _ref.partnerId;
  var sourceFile = _ref.sourceFile;
  var sourceApiKey = _ref.sourceApiKey;
  var destinationApiKeys = _ref.destinationApiKeys;
  var newSiteBaseDomain = _ref.newSiteBaseDomain;
  var newSiteDescription = _ref.newSiteDescription;
  var newSiteDataCenter = _ref.newSiteDataCenter;
  var apiDomain = _ref.apiDomain;

  var allPartnerSites, findPartner, partnerSites, sites, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, site, crud, settingsData, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, setting, sourceFileData, choices, _setting, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, destinationApiKey, _setting2, params, validations, sourceObjs, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, _setting3, _iteratorNormalCompletion5, _didIteratorError5, _iteratorError5, _iterator5, _step5, _destinationApiKey, diffs, _iteratorNormalCompletion6, _didIteratorError6, _iteratorError6, _iterator6, _step6, _setting4, sourceObj, destinationObj, diff, numAdded, numRemoved, _iteratorNormalCompletion7, _didIteratorError7, _iteratorError7, _iterator7, _step7, part, numChanged, isDifferent, _iteratorNormalCompletion8, _didIteratorError8, _iteratorError8, _iterator8, _step8, _part, diffLength, halfDiffLength, valueFirstHalf, valueLastHalf;

  return _regenerator2.default.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          crud = function crud(operation, setting) {
            var params = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

            var method = '' + operation + setting.charAt(0).toUpperCase() + setting.slice(1);
            return GigyaDataservice[method](_.merge({ userKey: userKey, userSecret: userSecret, partnerId: partnerId }, params));
          };

          if (!(!userKey || !userSecret)) {
            _context.next = 3;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'userKey',
                type: 'input',
                message: 'GIGYA_USER_KEY',
                default: userKey
              }, {
                name: 'userSecret',
                type: 'password',
                message: 'GIGYA_USER_SECRET_KEY',
                default: userSecret
              }, {
                name: 'apiDomain',
                type: 'input',
                message: 'GIGYA_API_DOMAIN',
                default: apiDomain
              }]
            }
          });

        case 3:
          _context.next = 5;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret, apiDomain: apiDomain }));

        case 5:
          allPartnerSites = _context.sent;

          if (partnerId) {
            _context.next = 16;
            break;
          }

          if (!(allPartnerSites.length === 1)) {
            _context.next = 11;
            break;
          }

          partnerId = allPartnerSites[0].partnerID;
          _context.next = 16;
          break;

        case 11:
          if (!(allPartnerSites.length <= 10)) {
            _context.next = 15;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerId',
                type: 'list',
                message: 'GIGYA_PARTNER_ID',
                choices: _.map(allPartnerSites, 'partnerID')
              }
            }
          });

        case 15:
          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'partnerId',
                type: 'input',
                message: 'GIGYA_PARTNER_ID'
              }
            }
          });

        case 16:

          // Fetch all partner sites (not all partners + sites)
          // This also validates the partner ID exists
          // We'll first look for it in the array of all partners + sites we already have to save some time
          findPartner = _.filter(allPartnerSites, { partnerID: partnerId });

          if (!findPartner.length) {
            _context.next = 21;
            break;
          }

          _context.t0 = findPartner;
          _context.next = 24;
          break;

        case 21:
          _context.next = 23;
          return _regenerator2.default.awrap(GigyaDataservice.fetchUserSites({ userKey: userKey, userSecret: userSecret, partnerId: partnerId, apiDomain: apiDomain }));

        case 23:
          _context.t0 = _context.sent;

        case 24:
          partnerSites = _context.t0;


          // Used to list sites on partner
          sites = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          _context.prev = 29;
          _iterator = (0, _getIterator3.default)(partnerSites[0].sites);

        case 31:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            _context.next = 40;
            break;
          }

          site = _step.value;

          if (!(site.dataCenter == "ru1")) {
            _context.next = 36;
            break;
          }

          _context.next = 36;
          return _regenerator2.default.awrap(GigyaDataservice.setApiDomain({ apiKey: site.apiKey, apiDomain: 'ru1.gigya.com' }));

        case 36:
          // If the site breaks onto a second line it breaks my console, keep line length sane
          sites.push({
            name: '' + site.baseDomain + (site.description ? ' "' + site.description + '"' : '') + ' ' + site.apiKey,
            value: site.apiKey
          });

        case 37:
          _iteratorNormalCompletion = true;
          _context.next = 31;
          break;

        case 40:
          _context.next = 46;
          break;

        case 42:
          _context.prev = 42;
          _context.t1 = _context['catch'](29);
          _didIteratorError = true;
          _iteratorError = _context.t1;

        case 46:
          _context.prev = 46;
          _context.prev = 47;

          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }

        case 49:
          _context.prev = 49;

          if (!_didIteratorError) {
            _context.next = 52;
            break;
          }

          throw _iteratorError;

        case 52:
          return _context.finish(49);

        case 53:
          return _context.finish(46);

        case 54:
          if (task) {
            _context.next = 56;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'task',
                type: 'list',
                message: 'TASK',
                choices: [{ name: 'EXPORT', value: 'export' }, { name: 'IMPORT', value: 'import' }, { name: 'COPY', value: 'copy' }, { name: 'VALIDATE', value: 'validate' }]
              }
            }
          });

        case 56:
          if (settings) {
            _context.next = 58;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                type: task !== 'import' ? 'checkbox' : 'list', // TODO: Import multiple settings at a time
                name: 'settings',
                message: task !== 'import' ? 'SETTINGS' : 'SETTING',
                choices: [{ name: 'SITE_CONFIG', value: 'siteConfig' }, { name: 'SCREENSETS', value: 'screensets' }, { name: 'SCHEMA', value: 'schema' }, { name: 'POLICIES', value: 'policies' }, { name: 'LOYALTY_CONFIG', value: 'loyaltyConfig' }]
              }
            }
          });

        case 58:
          settingsData = {};

          if (!(task === 'export' || task === 'copy' || task === 'validate')) {
            _context.next = 89;
            break;
          }

          if (sourceApiKey) {
            _context.next = 62;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'sourceApiKey',
                type: 'list',
                message: 'SOURCE_GIGYA_SITE',
                choices: sites
              }
            }
          });

        case 62:

          // Fetch settings from selected key
          _iteratorNormalCompletion2 = true;
          _didIteratorError2 = false;
          _iteratorError2 = undefined;
          _context.prev = 65;
          _iterator2 = (0, _getIterator3.default)(settings);

        case 67:
          if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
            _context.next = 75;
            break;
          }

          setting = _step2.value;
          _context.next = 71;
          return _regenerator2.default.awrap(crud('fetch', setting, { apiKey: sourceApiKey }));

        case 71:
          settingsData[setting] = _context.sent;

        case 72:
          _iteratorNormalCompletion2 = true;
          _context.next = 67;
          break;

        case 75:
          _context.next = 81;
          break;

        case 77:
          _context.prev = 77;
          _context.t2 = _context['catch'](65);
          _didIteratorError2 = true;
          _iteratorError2 = _context.t2;

        case 81:
          _context.prev = 81;
          _context.prev = 82;

          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }

        case 84:
          _context.prev = 84;

          if (!_didIteratorError2) {
            _context.next = 87;
            break;
          }

          throw _iteratorError2;

        case 87:
          return _context.finish(84);

        case 88:
          return _context.finish(81);

        case 89:
          if (!(task === 'import')) {
            _context.next = 98;
            break;
          }

          if (sourceFile) {
            _context.next = 92;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'sourceFile',
                type: 'file',
                message: 'LOAD_FILE'
              }
            }
          });

        case 92:
          _context.t3 = JSON;
          _context.next = 95;
          return _regenerator2.default.awrap(readFile({ file: sourceFile }));

        case 95:
          _context.t4 = _context.sent;
          sourceFileData = _context.t3.parse.call(_context.t3, _context.t4);

          settingsData[settings] = sourceFileData;

        case 98:
          if (!(task === 'import' || task === 'copy' || task === 'validate')) {
            _context.next = 110;
            break;
          }

          if (destinationApiKeys) {
            _context.next = 103;
            break;
          }

          // Create destination site options
          choices = _.filter(sites, function (site) {
            return site.value !== sourceApiKey;
          });

          // Add new site option to destination API key if importing site config

          if (task !== 'validate' && settings.indexOf('siteConfig') !== -1) {
            choices.unshift({ name: 'NEW_SITE', value: '_new' });
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: {
                name: 'destinationApiKeys',
                type: 'checkbox',
                message: 'DESTINATION_GIGYA_SITES',
                choices: choices
              }
            }
          });

        case 103:
          if (!(destinationApiKeys.indexOf('_new') !== -1)) {
            _context.next = 110;
            break;
          }

          if (newSiteBaseDomain) {
            _context.next = 106;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteBaseDomain',
                type: 'input',
                message: 'NEW_SITE_BASE_DOMAIN',
                default: settingsData['siteConfig'].baseDomain
              }]
            }
          });

        case 106:
          if (newSiteDescription) {
            _context.next = 108;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDescription',
                type: 'input',
                message: 'NEW_SITE_DESCRIPTION',
                default: settingsData['siteConfig'].description
              }]
            }
          });

        case 108:
          if (newSiteDataCenter) {
            _context.next = 110;
            break;
          }

          return _context.abrupt('return', {
            view: 'prompt',
            params: {
              questions: [{
                name: 'newSiteDataCenter',
                type: 'input',
                message: 'NEW_SITE_DATA_CENTER',
                default: settingsData['siteConfig'].dataCenter
              }]
            }
          });

        case 110:
          if (!(task === 'export')) {
            _context.next = 113;
            break;
          }

          for (_setting in settingsData) {
            writeFile({
              filePath: _setting + '.' + sourceApiKey + '.' + new Date().getTime() + '.json',
              data: settingsData[_setting]
            });
          }

          // Show success message
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: 'EXPORT_SUCCESSFUL'
            }
          });

        case 113:
          if (!(task === 'copy' || task === 'import')) {
            _context.next = 148;
            break;
          }

          // Push settings from source into destination(s)
          _iteratorNormalCompletion3 = true;
          _didIteratorError3 = false;
          _iteratorError3 = undefined;
          _context.prev = 117;
          _iterator3 = (0, _getIterator3.default)(destinationApiKeys);

        case 119:
          if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
            _context.next = 133;
            break;
          }

          destinationApiKey = _step3.value;
          _context.t5 = _regenerator2.default.keys(settingsData);

        case 122:
          if ((_context.t6 = _context.t5()).done) {
            _context.next = 130;
            break;
          }

          _setting2 = _context.t6.value;

          // Put together params and be sure to clone the settingsData
          params = (0, _defineProperty3.default)({
            apiKey: destinationApiKey
          }, _setting2, _.assign({}, settingsData[_setting2]));

          // If the destinationApiKey is new, override specific params

          if (destinationApiKey === '_new') {
            params['siteConfig'].baseDomain = newSiteBaseDomain;
            params['siteConfig'].description = newSiteDescription;
            params['siteConfig'].dataCenter = newSiteDataCenter;

            // Default to the provided base domain.
            delete params['siteConfig'].trustedSiteURLs;
          }

          // Update via API call
          _context.next = 128;
          return _regenerator2.default.awrap(crud('update', _setting2, params));

        case 128:
          _context.next = 122;
          break;

        case 130:
          _iteratorNormalCompletion3 = true;
          _context.next = 119;
          break;

        case 133:
          _context.next = 139;
          break;

        case 135:
          _context.prev = 135;
          _context.t7 = _context['catch'](117);
          _didIteratorError3 = true;
          _iteratorError3 = _context.t7;

        case 139:
          _context.prev = 139;
          _context.prev = 140;

          if (!_iteratorNormalCompletion3 && _iterator3.return) {
            _iterator3.return();
          }

        case 142:
          _context.prev = 142;

          if (!_didIteratorError3) {
            _context.next = 145;
            break;
          }

          throw _iteratorError3;

        case 145:
          return _context.finish(142);

        case 146:
          return _context.finish(139);

        case 147:
          return _context.abrupt('return', {
            view: 'info',
            params: {
              message: task.toUpperCase() + '_SUCCESSFUL'
            }
          });

        case 148:
          if (!(task === 'validate')) {
            _context.next = 279;
            break;
          }

          validations = [];
          sourceObjs = {};
          _iteratorNormalCompletion4 = true;
          _didIteratorError4 = false;
          _iteratorError4 = undefined;
          _context.prev = 154;
          _iterator4 = (0, _getIterator3.default)(settings);

        case 156:
          if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
            _context.next = 164;
            break;
          }

          _setting3 = _step4.value;
          _context.next = 160;
          return _regenerator2.default.awrap(crud('fetch', _setting3, { apiKey: sourceApiKey }));

        case 160:
          sourceObjs[_setting3] = _context.sent;

        case 161:
          _iteratorNormalCompletion4 = true;
          _context.next = 156;
          break;

        case 164:
          _context.next = 170;
          break;

        case 166:
          _context.prev = 166;
          _context.t8 = _context['catch'](154);
          _didIteratorError4 = true;
          _iteratorError4 = _context.t8;

        case 170:
          _context.prev = 170;
          _context.prev = 171;

          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }

        case 173:
          _context.prev = 173;

          if (!_didIteratorError4) {
            _context.next = 176;
            break;
          }

          throw _iteratorError4;

        case 176:
          return _context.finish(173);

        case 177:
          return _context.finish(170);

        case 178:
          _iteratorNormalCompletion5 = true;
          _didIteratorError5 = false;
          _iteratorError5 = undefined;
          _context.prev = 181;
          _iterator5 = (0, _getIterator3.default)(destinationApiKeys);

        case 183:
          if (_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done) {
            _context.next = 264;
            break;
          }

          _destinationApiKey = _step5.value;
          diffs = [];
          _iteratorNormalCompletion6 = true;
          _didIteratorError6 = false;
          _iteratorError6 = undefined;
          _context.prev = 189;
          _iterator6 = (0, _getIterator3.default)(settings);

        case 191:
          if (_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done) {
            _context.next = 246;
            break;
          }

          _setting4 = _step6.value;

          // Fetch objects and run jsdiff
          sourceObj = sourceObjs[_setting4];
          _context.next = 196;
          return _regenerator2.default.awrap(crud('fetch', _setting4, { apiKey: _destinationApiKey }));

        case 196:
          destinationObj = _context.sent;
          diff = jsdiff.diffJson(sourceObj, destinationObj);

          // Calculate stats

          numAdded = 0;
          numRemoved = 0;
          _iteratorNormalCompletion7 = true;
          _didIteratorError7 = false;
          _iteratorError7 = undefined;
          _context.prev = 203;

          for (_iterator7 = (0, _getIterator3.default)(diff); !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            part = _step7.value;

            if (part.added) {
              numAdded += part.count;
            } else if (part.removed) {
              numRemoved += part.count;
            }
          }
          _context.next = 211;
          break;

        case 207:
          _context.prev = 207;
          _context.t9 = _context['catch'](203);
          _didIteratorError7 = true;
          _iteratorError7 = _context.t9;

        case 211:
          _context.prev = 211;
          _context.prev = 212;

          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }

        case 214:
          _context.prev = 214;

          if (!_didIteratorError7) {
            _context.next = 217;
            break;
          }

          throw _iteratorError7;

        case 217:
          return _context.finish(214);

        case 218:
          return _context.finish(211);

        case 219:
          numChanged = Math.min(numAdded, numRemoved);

          numRemoved -= numChanged;
          numAdded -= numChanged;
          isDifferent = numAdded || numRemoved || numChanged;

          // Abbreviate diff value if necessary, retains original value, creats new abbrValue index
          // Standardize newlines

          _iteratorNormalCompletion8 = true;
          _didIteratorError8 = false;
          _iteratorError8 = undefined;
          _context.prev = 226;
          for (_iterator8 = (0, _getIterator3.default)(diff); !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            _part = _step8.value;

            // Trim newlines at ends so we can ENSURE they exist consistently
            _part.value = _part.value.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\n";

            // Abbr length varies, show less of unchanged text
            diffLength = _part.added || _part.removed ? 1000 : 300;
            halfDiffLength = diffLength / 2;

            // We don't want to show the entire value
            // Limit to X chars -> find next newline -> if newline doesn't exist in X additional chars chop off

            if (_part.value.length > diffLength) {
              // Halve diff
              valueFirstHalf = _part.value.substr(0, halfDiffLength);
              valueLastHalf = _part.value.substr(_part.value.length - halfDiffLength);

              // Look for newline breakpoints

              valueFirstHalf = valueFirstHalf.substr(0, valueFirstHalf.lastIndexOf("\n"));
              valueLastHalf = valueLastHalf.substr(valueLastHalf.indexOf("\n"));

              // Write back to diff
              // Trim newlines at ends so we can ENSURE they exist consistently
              _part.abbrValue = valueFirstHalf.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\r\n...\r\n" + valueLastHalf.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\r\n";
            }
          }

          // This is what we're returning
          _context.next = 234;
          break;

        case 230:
          _context.prev = 230;
          _context.t10 = _context['catch'](226);
          _didIteratorError8 = true;
          _iteratorError8 = _context.t10;

        case 234:
          _context.prev = 234;
          _context.prev = 235;

          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }

        case 237:
          _context.prev = 237;

          if (!_didIteratorError8) {
            _context.next = 240;
            break;
          }

          throw _iteratorError8;

        case 240:
          return _context.finish(237);

        case 241:
          return _context.finish(234);

        case 242:
          diffs.push({
            setting: _setting4,
            diff: diff,
            sourceObj: sourceObj,
            destinationObj: destinationObj,
            isDifferent: isDifferent,
            numAdded: numAdded,
            numRemoved: numRemoved,
            numChanged: numChanged
          });

        case 243:
          _iteratorNormalCompletion6 = true;
          _context.next = 191;
          break;

        case 246:
          _context.next = 252;
          break;

        case 248:
          _context.prev = 248;
          _context.t11 = _context['catch'](189);
          _didIteratorError6 = true;
          _iteratorError6 = _context.t11;

        case 252:
          _context.prev = 252;
          _context.prev = 253;

          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }

        case 255:
          _context.prev = 255;

          if (!_didIteratorError6) {
            _context.next = 258;
            break;
          }

          throw _iteratorError6;

        case 258:
          return _context.finish(255);

        case 259:
          return _context.finish(252);

        case 260:

          validations.push({ diffs: diffs, site: _.find(partnerSites[0].sites, { apiKey: _destinationApiKey }) });

        case 261:
          _iteratorNormalCompletion5 = true;
          _context.next = 183;
          break;

        case 264:
          _context.next = 270;
          break;

        case 266:
          _context.prev = 266;
          _context.t12 = _context['catch'](181);
          _didIteratorError5 = true;
          _iteratorError5 = _context.t12;

        case 270:
          _context.prev = 270;
          _context.prev = 271;

          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }

        case 273:
          _context.prev = 273;

          if (!_didIteratorError5) {
            _context.next = 276;
            break;
          }

          throw _iteratorError5;

        case 276:
          return _context.finish(273);

        case 277:
          return _context.finish(270);

        case 278:
          return _context.abrupt('return', {
            view: 'validate',
            params: { validations: validations }
          });

        case 279:
          throw new Error('No view rendered.');

        case 280:
        case 'end':
          return _context.stop();
      }
    }
  }, null, this, [[29, 42, 46, 54], [47,, 49, 53], [65, 77, 81, 89], [82,, 84, 88], [117, 135, 139, 147], [140,, 142, 146], [154, 166, 170, 178], [171,, 173, 177], [181, 266, 270, 278], [189, 248, 252, 260], [203, 207, 211, 219], [212,, 214, 218], [226, 230, 234, 242], [235,, 237, 241], [253,, 255, 259], [271,, 273, 277]]);
};

module.exports = toolkit;