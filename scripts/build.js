const { promisify } = require('util');
const rimraf = promisify(require('rimraf'));
const zipdir = promisify(require('zip-dir'));
const path = require('path');
const arg = require('arg');
const execa = require('execa');
const paths = require('../config/paths');
const readManifest = require('../lib/read-manifest');

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
  Builds the addon

Usage
  $ sitevision-scripts build

Options
  --help, -h    Displays this message
    `);
    process.exit(0);
  }

  // Clear build dir
  await rimraf(`${paths.appDist}`);

  // Build
  const dir = ['--out-dir', paths.appBuild];
  const preset = ['--presets', path.join(__dirname, '../babel.js')];

  await execa('npx', [
    'babel',
    paths.appSrc,
    '--copy-files',
    ...dir,
    ...preset,
  ]);

  // get manifest id
  const { id } = await readManifest();

  // Compress build to a bundle
  await zipdir(paths.appBuild, { saveTo: paths.getBundle(id) });

  console.log('Build successful');
})();
