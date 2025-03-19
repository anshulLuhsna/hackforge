import chalk from 'chalk';
import { saveToken, getUserFromToken } from '../utils/auth';

/**
 * Save an authentication token directly
 * @param token The authentication token to save
 */
export function tokenCommand(token: string): void {
  try {
    if (!token) {
      console.error(chalk.red('Error: Token is required'));
      console.log(`\nTo get a token, run: ${chalk.cyan('hackforge login')}`);
      process.exit(1);
    }

    // Check token format (basic validation)
    if (token.length < 20 || !token.includes('.')) {
      console.warn(chalk.yellow('\n⚠️ Warning: The token format looks incorrect.'));
      console.log('A valid token should be a long string with multiple segments separated by dots.');
      
      const { confirm } = require('inquirer').prompt([{
        type: 'confirm',
        name: 'confirm',
        message: 'Continue anyway?',
        default: false
      }]);
      
      if (!confirm) {
        console.log(chalk.yellow('Token save cancelled.'));
        console.log(`To get a valid token, run: ${chalk.cyan('hackforge login')}`);
        return;
      }
    }

    // Save the token
    saveToken(token);
    
    // Try to extract and display user info
    const user = getUserFromToken();
    
    console.log(chalk.green('\n✅ Authentication token saved successfully!\n'));
    
    if (user && user.email) {
      console.log(`Logged in as: ${chalk.cyan(user.email)}`);
    } else {
      console.log('Authentication token saved, but could not extract user information.');
    }
    
    console.log(chalk.cyan('\nYou can now use the hackforge CLI commands:'));
    console.log(`- ${chalk.bold('hackforge projects')} to list your projects`);
    console.log(`- ${chalk.bold('hackforge projects --all')} to download all your projects`);
    console.log(`- ${chalk.bold('hackforge projects --download <id>')} to download a specific project\n`);
  } catch (error) {
    console.error(chalk.red('Error saving token:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} 