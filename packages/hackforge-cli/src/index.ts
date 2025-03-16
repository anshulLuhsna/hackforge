#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { copyCommand } from './commands/copy';
import { loginCommand } from './commands/login';
import { tokenCommand } from './commands/token';

// Get package version from package.json
const packageJson = require('../package.json');
const version = packageJson.version || '0.0.0';

// Create commander program
const program = new Command();

// Configure program metadata
program
  .name('hackforge')
  .description('Hackforge CLI - A tool for bootstrapping projects from templates')
  .version(version, '-v, --version', 'Output the current version');

// Add the "copy" subcommand
program
  .command('copy <project-id> <destination>')
  .description('Download and set up a project scaffold from the Hackforge server')
  .action(copyCommand);

// Add the "auth:login" command
program
  .command('auth:login')
  .description('Authenticate with the Hackforge server')
  .option('-t, --token <token>', 'Provide an authentication token directly')
  .option('-w, --web', 'Open web browser to get a token (default method)')
  .option('-d, --dev', 'Development mode: bypass authentication (for testing only)')
  .action(loginCommand);

// Add the "auth:token" command
program
  .command('auth:token <token>')
  .description('Save an authentication token directly')
  .action(tokenCommand);

// Add help text
program.addHelpText('after', `
Examples:
  $ hackforge auth:login --web           # Authenticate via web browser
  $ hackforge copy my-project-id ./dest  # Copy a project to the ./dest folder
  $ hackforge auth:token <token>         # Save an authentication token directly

Documentation:
  https://docs.hackforge.example.com
`);

// Parse command line arguments and execute
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.outputHelp();
} 