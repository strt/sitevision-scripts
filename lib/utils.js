const path = require('path');
const fs = require('fs-extra');
const paths = require('../config/paths');

async function readJsonFile(filePath) {
  const contents = await fs.readFile(filePath);
  return JSON.parse(contents);
}

async function readManifest() {
  const json = await readJsonFile(path.join(paths.appSrc, 'manifest.json'));
  return json;
}

module.exports = {
  readJsonFile,
  readManifest,
};
