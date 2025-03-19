#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { loginCommand } from './commands/login';
import { projectsCommand } from './commands/projects';
import { tokenCommand } from './commands/token';

// Get package version from package.json
const packageJson = require('../package.json');
const version = packageJson.version || '0.1.0';

// Create commander program
const program = new Command();

// Configure program metadata
program
  .name('hackforge')
  .description('Hackforge CLI - A tool for managing Hackforge projects')
  .version(version, '-v, --version', 'Output the current version');

// Add the login command
program
  .command('login')
  .description('Open browser to generate an authentication token')
  .option('-t, --token <token>', 'Provide an authentication token directly (prefer using the "token" command instead)')
  .action(loginCommand);

// Add the "projects" command
program
  .command('projects')
  .description('List and download your projects')
  .option('-d, --download <id>', 'Download a specific project by ID')
  .option('-o, --output <path>', 'Specify output directory/file for downloaded project', './project-details.json')
  .option('-a, --all', 'Download all your projects')
  .option('-f, --format <format>', 'Output format (json or markdown)', 'json')
  .option('--debug', 'Show debug information for troubleshooting')
  .action(projectsCommand);

// Add the "token" command
program
  .command('token <token>')
  .description('Save an authentication token for CLI use')
  .action(tokenCommand);

// Add help text
program.addHelpText('after', `
Examples:
  $ hackforge login               # Open browser to generate a token
  $ hackforge token <your-token>  # Save your authentication token
  $ hackforge projects            # List all your projects
  $ hackforge projects --all      # Download all your projects
  $ hackforge projects --download project-id  # Download a specific project

Documentation:
  For more information, visit https://hackforge.example.com/docs
`);

// Parse command line arguments and execute
program.parse(process.argv);

// If no arguments provided, show help
if (process.argv.length <= 2) {
  program.outputHelp();
} 