const fs = require('fs-extra');
const path = require('path');

const { SITE_URL: url, SITE_NAME: name } = process.env;
const appDirectory = fs.realpathSync(process.cwd());

const baseUrl = `${url}/rest-api/1/0/${encodeURIComponent(
  name
)}/Addon%20Repository`;

function resolvePath(relativePath) {
  return path.resolve(appDirectory, relativePath);
}

function getBundle(id) {
  return resolvePath(`dist/${id}.zip`);
}

function getSignedBundle(id) {
  return resolvePath(`dist/${id}.signed.zip`);
}

module.exports = {
  appPath: resolvePath('.'),
  appDist: resolvePath('dist'),
  appBuild: resolvePath('dist/build'),
  appManifest: resolvePath('dist/build/manifest.json'),
  appSrc: resolvePath('src'),
  baseUrl,
  resolvePath,
  getBundle,
  getSignedBundle,
};
