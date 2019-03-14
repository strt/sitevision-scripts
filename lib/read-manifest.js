const path = require('path');
const fs = require('fs-extra');
const paths = require('../config/paths');

module.exports = async function readManifest() {
  const json = await fs.readJSON(path.join(paths.appSrc, 'manifest.json'));
  return json;
};
