const path = require('path');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const arg = require('arg');

function envCase(str) {
  return str.replace(/([A-Z])/, '_$1').toUpperCase();
}

const questions = [
  {
    name: 'siteUrl',
    message: 'Site URL',
  },
  {
    name: 'siteName',
    message: 'Site name',
  },
  {
    name: 'username',
    message: 'Username',
  },
  {
    name: 'password',
    type: 'password',
    message: 'Password',
  },
];

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
  Setup the addon

Usage
  $ sitevision-scripts setup

Options
  --help, -h    Displays this message
    `);
    process.exit(0);
  }

  const answers = await inquirer.prompt(questions);
  const envString = Object.entries(answers).reduce(
    (acc, [key, value]) => `${acc}${envCase(key)}=${value}\n`,
    ''
  );

  await fs.writeFile(`${path.resolve(process.cwd())}/.env`, envString);

  console.log('Setup completed!');
})();
