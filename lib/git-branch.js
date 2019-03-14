const fs = require('fs-extra');
const findUp = require('find-up');

function parseBranch(buffer) {
  const match = /ref: refs\/heads\/([^\n]+)/.exec(buffer.toString());

  return match ? match[1] : null;
}

async function gitHeadPath() {
  const filepath = await findUp('.git/HEAD');

  if (!fs.existsSync(filepath)) {
    throw new Error('.git/HEAD does not exist');
  }

  return filepath;
}

module.exports = async function getGitBranch() {
  const filepath = await gitHeadPath();
  const buffer = await fs.readFile(filepath);
  const branch = parseBranch(buffer);

  return branch;
};
