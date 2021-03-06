'use strict';

const _ = require('lodash');
const GigyaDataservice = require('./dataservices/gigya.dataservice');
const writeFile = require('./helpers/write-file');
const readFile = require('./helpers/read-file');
const jsdiff = require('diff');

const toolkit = async function({ userKey, userSecret, task, settings, partnerId, sourceFile, sourceApiKey,
  destinationApiKeys, newSiteBaseDomain, newSiteDescription, newSiteDataCenter, apiDomain }) {
  // Gigya credentials needed to access API
  if(!userKey || !userSecret) {
    return {
      view: 'prompt',
      params: {
        questions: [
          {
            name: 'userKey',
            type: 'input',
            message: 'GIGYA_USER_KEY',
            default: userKey
          },
          {
            name: 'userSecret',
            type: 'password',
            message: 'GIGYA_USER_SECRET_KEY',
            default: userSecret
          },
          {
            name: 'apiDomain',
            type: 'input',
            message: 'GIGYA_API_DOMAIN',
            default: apiDomain
          }
        ]
      }
    };
  }

  // In cases where user has access to many partners, will not return all partners
  // Most users have a very limited number of sites, and we want to help them
  const allPartnerSites = await GigyaDataservice.fetchUserSites({ userKey, userSecret, apiDomain });

  // Get partner ID
  if(!partnerId) {
    // Only prompt for partner ID if more than one available
    // This prevents users from needing to enter their partner ID in the common use-case where they have only one account linked
    if(allPartnerSites.length === 1) {
      partnerId = allPartnerSites[0].partnerID;
    } else if(allPartnerSites.length <= 10) {
      // User has less than 10 partner IDs linked
      // Choose from list
      return {
        view: 'prompt',
        params: {
          questions: {
            name: 'partnerId',
            type: 'list',
            message: 'GIGYA_PARTNER_ID',
            choices: _.map(allPartnerSites, 'partnerID')
          }
        }
      };
    } else {
      // User has more than 10 partner IDs
      // This usually means the user has (limited) access to more partner IDs than the API will return
      // Force manual entry
      return {
        view: 'prompt',
        params: {
          questions: {
            name: 'partnerId',
            type: 'input',
            message: 'GIGYA_PARTNER_ID'
          }
        }
      };
    }
  }

  // Fetch all partner sites (not all partners + sites)
  // This also validates the partner ID exists
  // We'll first look for it in the array of all partners + sites we already have to save some time
  const findPartner = _.filter(allPartnerSites, { partnerID: partnerId });
  const partnerSites = findPartner.length
    ? findPartner
    : await GigyaDataservice.fetchUserSites({ userKey, userSecret, partnerId, apiDomain });

  // Used to list sites on partner
  const sites = [];
  for(const site of partnerSites[0].sites) {
    //if the DC is russia, we need to explicitly set the ApiDomain, or even metadata fails
      if(site.dataCenter == "ru1"){
	  await GigyaDataservice.setApiDomain({apiKey:site.apiKey,apiDomain:'ru1.gigya.com'});
      }
    // If the site breaks onto a second line it breaks my console, keep line length sane
    sites.push({
      name: `${site.baseDomain}${site.description ? ` "${site.description}"` : ''} ${site.apiKey}`,
      value: site.apiKey
    });
  }
  
  if(!task) {
    return {
      view: 'prompt',
      params: {
        questions: {
          name: 'task',
          type: 'list',
          message: 'TASK',
          choices: [
            { name: 'EXPORT', value: 'export' },
            { name: 'IMPORT', value: 'import' },
            { name: 'COPY', value: 'copy' },
            { name: 'VALIDATE', value: 'validate' }
          ]
        }
      }
    };
  }

  if(!settings) {
    return {
      view: 'prompt',
      params: {
        questions: {
          type: task !== 'import' ? 'checkbox' : 'list', // TODO: Import multiple settings at a time
          name: 'settings',
          message: task !== 'import' ? 'SETTINGS' : 'SETTING',
          choices: [
            { name: 'SITE_CONFIG', value: 'siteConfig' },
            { name: 'SCREENSETS', value: 'screensets' },
            { name: 'SCHEMA', value: 'schema' },
            { name: 'POLICIES', value: 'policies' },
            { name: 'LOYALTY_CONFIG', value: 'loyaltyConfig' }
          ]
        }
      }
    };
  }

  // Looks at current setting and calls something like fetchSchema
  // operation = fetch or update
  function crud(operation, setting, params = {}) {
    const method = `${operation}${setting.charAt(0).toUpperCase()}${setting.slice(1)}`;
    return GigyaDataservice[method](_.merge({ userKey, userSecret, partnerId }, params));
  }

  const settingsData = {};
  if(task === 'export' || task === 'copy' || task === 'validate') {
    // Get API key to export from
    if(!sourceApiKey) {
      return {
        view: 'prompt',
        params: {
          questions: {
            name: 'sourceApiKey',
            type: 'list',
            message: 'SOURCE_GIGYA_SITE',
            choices: sites
          }
        }
      };
    }

    // Fetch settings from selected key
    for(const setting of settings) {
      settingsData[setting] = await crud('fetch', setting, { apiKey: sourceApiKey });
    }
  }
  if(task === 'import') {
    // Get file which we will load settings from
    if(!sourceFile) {
      return {
        view: 'prompt',
        params: {
          questions: {
            name: 'sourceFile',
            type: 'file',
            message: 'LOAD_FILE'
          }
        }
      };
    }
    const sourceFileData = JSON.parse(await readFile({ file: sourceFile }));
    settingsData[settings] = sourceFileData;
  }

  if(task === 'import' || task === 'copy' || task === 'validate') {
    // Get destination API keys
    if(!destinationApiKeys) {
      // Create destination site options
      const choices = _.filter(sites, (site) => site.value !== sourceApiKey);

      // Add new site option to destination API key if importing site config
      if(task !== 'validate' && settings.indexOf('siteConfig') !== -1) {
        choices.unshift({ name: 'NEW_SITE', value: '_new' });
      }

      return {
        view: 'prompt',
        params: {
          questions: {
            name: 'destinationApiKeys',
            type: 'checkbox',
            message: 'DESTINATION_GIGYA_SITES',
            choices
          }
        }
      };
    }

    // Check for new site and grab additional information if needed
    if(destinationApiKeys.indexOf('_new') !== -1) {
      if(!newSiteBaseDomain) {
        return {
          view: 'prompt',
          params: {
            questions: [
              {
                name: 'newSiteBaseDomain',
                type: 'input',
                message: 'NEW_SITE_BASE_DOMAIN',
                default: settingsData['siteConfig'].baseDomain
              }
            ]
          }
        };
      }

      if(!newSiteDescription) {
        return {
          view: 'prompt',
          params: {
            questions: [
              {
                name: 'newSiteDescription',
                type: 'input',
                message: 'NEW_SITE_DESCRIPTION',
                default: settingsData['siteConfig'].description
              }
            ]
          }
        };
      }

      if(!newSiteDataCenter) {
        return {
          view: 'prompt',
          params: {
            questions: [
              {
                name: 'newSiteDataCenter',
                type: 'input',
                message: 'NEW_SITE_DATA_CENTER',
                default: settingsData['siteConfig'].dataCenter
              }
            ]
          }
        };
      }
    }
  }

  if(task === 'export') {
    for(const setting in settingsData) {
      writeFile({
        filePath: `${setting}.${sourceApiKey}.${new Date().getTime()}.json`,
        data: settingsData[setting]
      });
    }

    // Show success message
    return {
      view: 'info',
      params: {
        message: `EXPORT_SUCCESSFUL`
      }
    };
  }

  if(task === 'copy' || task === 'import') {
    // Push settings from source into destination(s)
    for(const destinationApiKey of destinationApiKeys) {
      for(const setting in settingsData) {
        // Put together params and be sure to clone the settingsData
        const params = {
          apiKey: destinationApiKey,
          [setting]: _.assign({}, settingsData[setting])
        };

        // If the destinationApiKey is new, override specific params
        if(destinationApiKey === '_new') {
          params['siteConfig'].baseDomain = newSiteBaseDomain;
          params['siteConfig'].description = newSiteDescription;
          params['siteConfig'].dataCenter = newSiteDataCenter;

          // Default to the provided base domain.
          delete params['siteConfig'].trustedSiteURLs;
        }

        // Update via API call
        await crud('update', setting, params);
      }
    }

    // Show success message
    return {
      view: 'info',
      params: {
        message: `${task.toUpperCase()}_SUCCESSFUL`
      }
    };
  }

  if(task === 'validate') {
    const validations = [];
    const sourceObjs = {};

    for(const setting of settings) {
      sourceObjs[setting] = await crud('fetch', setting, { apiKey: sourceApiKey });
    }

    for(const destinationApiKey of destinationApiKeys) {
      const diffs = [];
      for(const setting of settings) {
        // Fetch objects and run jsdiff
        const sourceObj = sourceObjs[setting];
        const destinationObj = await crud('fetch', setting, { apiKey: destinationApiKey });
        const diff = jsdiff.diffJson(sourceObj, destinationObj);

        // Calculate stats
        let numAdded = 0;
        let numRemoved = 0;
        for(const part of diff) {
          if(part.added) {
            numAdded += part.count;
          } else if(part.removed) {
            numRemoved += part.count;
          }
        }
        let numChanged = Math.min(numAdded, numRemoved);
        numRemoved -= numChanged;
        numAdded -= numChanged;
        const isDifferent = numAdded || numRemoved || numChanged;

        // Abbreviate diff value if necessary, retains original value, creats new abbrValue index
        // Standardize newlines
        for(const part of diff) {
          // Trim newlines at ends so we can ENSURE they exist consistently
          part.value = part.value.replace(/^[\r\n]+|[\r\n]+$/g, '') + "\n";

          // Abbr length varies, show less of unchanged text
          const diffLength = part.added || part.removed ? 1000 : 300;
          const halfDiffLength = (diffLength / 2);

          // We don't want to show the entire value
          // Limit to X chars -> find next newline -> if newline doesn't exist in X additional chars chop off
          if(part.value.length > diffLength) {
            // Halve diff
            let valueFirstHalf = part.value.substr(0, halfDiffLength);
            let valueLastHalf = part.value.substr(part.value.length - halfDiffLength);

            // Look for newline breakpoints
            valueFirstHalf = valueFirstHalf.substr(0, valueFirstHalf.lastIndexOf("\n"));
            valueLastHalf = valueLastHalf.substr(valueLastHalf.indexOf("\n"));

            // Write back to diff
            // Trim newlines at ends so we can ENSURE they exist consistently
            part.abbrValue = valueFirstHalf.replace(/^[\r\n]+|[\r\n]+$/g, '')
              + "\r\n...\r\n"
              + valueLastHalf.replace(/^[\r\n]+|[\r\n]+$/g, '')
              + "\r\n";
          }
        }
  
        // This is what we're returning
        diffs.push({
          setting,
          diff,
          sourceObj,
          destinationObj,
          isDifferent,
          numAdded,
          numRemoved,
          numChanged
        });
      }

      validations.push({ diffs, site: _.find(partnerSites[0].sites, { apiKey: destinationApiKey }) });
    }

    return {
      view: 'validate',
      params: { validations }
    }
  }

  throw new Error('No view rendered.');
}

module.exports = toolkit;