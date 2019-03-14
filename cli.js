#!/usr/bin/env node

require('dotenv').config();
const arg = require('arg');
const fs = require('fs-extra');
const execa = require('execa');

process.on('unhandledRejection', (error) => {
  console.log(error);
  process.exit(0);
});

(async () => {
  const commands = ['build', 'setup', 'deploy', 'create-addon', 'zip', 'sign'];
  const defaultEnv = 'production';

  const args = arg(
    {
      // Types
      '--version': Boolean,
      '--help': Boolean,

      // Aliases
      '-v': '--version',
      '-h': '--help',
    },
    {
      permissive: true,
    }
  );

  const command = args._.find(cmd => commands.includes(cmd));

  if (args['--version']) {
    const { version } = await fs.readJson('package.json');
    console.log(`v${version}`);
    process.exit(0);
  }

  if (!command && args['--help']) {
    console.log(`
Usage
  $ sitevision-scripts <command>

Available commands
  ${commands.join(', ')}

Options
  --version, -v   Version number
  --help, -h      Displays this message

For more information run a command with the --help flag
  $ sitevision-scripts build --help`);
    process.exit(0);
  }

  if (!command || !commands.includes(command)) {
    console.log(`Unknown command "${command}"`);
    process.exit(0);
  }

  const bin = require.resolve(`./scripts/${command}`);
  const forwardedArgs = args._.filter(a => a !== command);

  if (args['--help']) {
    forwardedArgs.push('--help');
  }

  process.env.NODE_ENV = process.env.NODE_ENV || defaultEnv;

  execa('node', [bin, ...forwardedArgs], {
    stdio: 'inherit',
  });
})();
