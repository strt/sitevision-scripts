const got = require('got');
const arg = require('arg');
const readManifest = require('../lib/read-manifest');
const { baseUrl } = require('../config/paths');

(async () => {
  const args = arg({
    // Types
    '--help': Boolean,

    // Aliases
    '-h': '--help',
  });

  if (args['--help']) {
    console.log(`
Description
  Creates the addon in SiteVision 

Usage
  $ sitevision-scripts create-addon

Options
  --help, -h    Displays this message
    `);
    process.exit(0);
  }

  try {
    const { id, name, type } = await readManifest();
    const isWebApp = type === 'WebApp';

    let url = baseUrl;
    if (isWebApp) {
      url += '/custommodule';
    } else {
      url += '/headlesscustommodule';
    }

    const response = await got.post(url, {
      json: true,
      body: {
        name: isWebApp ? name : id,
        category: isWebApp ? 'Other' : undefined,
      },
      auth: `${process.env.USERNAME}:${process.env.PASSWORD}`,
    });

    console.log(`Addon "${response.body.name}" created.`);
  } catch (error) {
    if (error.response && error.response.body && error.response.body.message) {
      console.log(error.response.body.message);
    } else {
      console.log(error);
    }
  }
})();
