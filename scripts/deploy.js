const fs = require('fs-extra');
const got = require('got');
const path = require('path');
const arg = require('arg');
const execa = require('execa');
const FormData = require('form-data');
const paths = require('../config/paths');

(async () => {
  if (
    !process.env.SITE_NAME ||
    !process.env.SITE_URL ||
    !process.env.USERNAME ||
    !process.env.PASSWORD
  ) {
    console.log(
      'You must configure your env variables with the "setup" script before deploying.'
    );
    process.exit(0);
  }

  const args = arg({
    // Types
    '--help': Boolean,
    '--force': Boolean,
    '--production': Boolean,

    // Aliases
    '-h': '--help',
    '-f': '--force',
    '-p': '--production',
  });

  if (args['--help']) {
    console.log(`
Description
  Deploy addon to a SiteVision server

Usage
  $ sitevision-scripts deploy

Options
  --force, -f         Force deploy (overwrites existing addon)
  --production, -p    Deploys signed addon (production)
  --help, -h          Displays this message
    `);
    process.exit(0);
  }

  // Build addon
  await execa('node', [path.resolve(__dirname, './build.js')], {
    stdio: 'inherit',
  });

  // Sign addon if production
  if (args['--production']) {
    await execa('node', [path.resolve(__dirname, './sign.js')], {
      stdio: 'inherit',
    });
  }

  const { id, type } = await fs.readJson(paths.appManifest);

  let url = `${paths.baseUrl}/${id}`;
  if (type === 'WebApp') {
    url += '/webAppImport';
  } else {
    url += '/restAppImport';
  }

  const query = new URLSearchParams();
  if (args['--force']) {
    query.append('force', true);
  }

  const formData = new FormData();
  const bundleFilePath = args['--production']
    ? paths.getSignedBundle(id)
    : paths.getBundle(id);
  formData.append('file', fs.createReadStream(bundleFilePath));

  try {
    await got.post(url, {
      query,
      body: formData,
      auth: `${process.env.USERNAME}:${process.env.PASSWORD}`,
    });

    console.log(`Addon "${id}" was successfully deployed`);
  } catch (error) {
    if (error.response && error.response.body) {
      console.log(error.response.body);
    } else {
      console.log(error);
    }
  }
})();
