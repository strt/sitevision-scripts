const fs = require('fs-extra');
const got = require('got');
const FormData = require('form-data');
const inquirer = require('inquirer');
const arg = require('arg');
const paths = require('../config/paths');

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
  Sign the addon

Usage
  $ sitevision-scripts sign

Options
  --help, -h    Displays this message
    `);
    process.exit(0);
  }

  const questions = [
    {
      name: 'username',
      default: process.env.USERNAME,
      message: 'Username for developer.sitevision.se',
    },
    {
      name: 'password',
      type: 'password',
      message: 'Password for developer.sitevision.se',
    },
    {
      name: 'certificateName',
      message: 'Certificate name for signing (blank for default)',
    },
  ];

  try {
    const answers = await inquirer.prompt(questions);
    const { id } = await fs.readJson(paths.appManifest);

    const formData = new FormData();
    formData.append('file', fs.createReadStream(paths.getBundle(id)));

    const query = new URLSearchParams();
    if (answers.certificateName) {
      query.append('certificateName', answers.certificateName);
    }

    const response = await got.post(
      'https://developer.sitevision.se/rest-api/appsigner/signapp',
      {
        body: formData,
        query,
        encoding: null,
        decompress: false,
        auth: `${answers.username}:${answers.password}`,
      }
    );

    await fs.writeFile(paths.getSignedBundle(id), response.body);

    console.log(`Addon "${id}" was successfully signed`);
  } catch (error) {
    if (error.response && error.response.body && error.response.body.message) {
      console.log(error.response.body.message);
    } else {
      console.log(error);
    }
  }
})();
