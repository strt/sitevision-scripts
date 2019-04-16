const fs = require('fs-extra');
const got = require('got');
const path = require('path');
const arg = require('arg');
const execa = require('execa');
const FormData = require('form-data');
const paths = require('../config/paths');
const getBranch = require('../lib/git-branch');

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
    '--staging': Boolean,
    '--production': Boolean,

    // Aliases
    '-h': '--help',
    '-f': '--force',
    '-s': '--staging',
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
  --staging, -s       Deploys and suffixes addon name with the current branch
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

  const manifest = await fs.readJson(paths.appManifest);

  let { id } = manifest;
  if (args['--staging']) {
    const branch = await getBranch();

    if (branch !== 'master') {
      id = `${id}-${branch}`;
    }
  }

  let url = `${paths.baseUrl}`;
  if (manifest.type === 'WebApp') {
    url += `/${encodeURIComponent(manifest.name)}/webAppImport`;
  } else {
    url += `/${id}/restAppImport`;
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
