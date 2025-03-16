import chalk from 'chalk';
import { saveToken } from '../utils/auth';

/**
 * Implements the auth:token command to save a token directly
 * @param token The authentication token to save
 */
export async function tokenCommand(token: string): Promise<void> {
  try {
    if (!token) {
      console.error(chalk.red('Error: Token is required'));
      console.log(chalk.yellow('Usage: hackforge auth:token YOUR_TOKEN_HERE'));
      process.exit(1);
    }
    
    // Save the token
    saveToken(token);
    
    console.log(chalk.green('\n✅ Authentication token saved successfully'));
    console.log(chalk.cyan('You can now use the Hackforge CLI.'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Failed to save token:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} 