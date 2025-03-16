import chalk from 'chalk';
import open from 'open';
import Conf from 'conf';
import inquirer from 'inquirer';
import axios from 'axios';
import ora from 'ora';
import { saveToken } from '../utils/auth';
import { API_BASE_URL } from '../config';

// Create config store for saving auth tokens
const config = new Conf({
  projectName: 'hackforge-cli',
  projectVersion: '1.0.0'
});

interface LoginCommandOptions {
  token?: string;
  web?: boolean;
  dev?: boolean; // Development option for testing
}

/**
 * Implements the auth:login command
 * @param options - Command options
 */
export async function loginCommand(options: LoginCommandOptions): Promise<void> {
  try {
    console.log(chalk.bold('\n🔐 Hackforge Authentication\n'));
    
    // If token is provided, save it directly
    if (options.token) {
      saveToken(options.token);
      console.log(chalk.green('✅ Authentication token saved successfully!'));
      return;
    }
    
    // Development bypass mode (only for testing)
    if (options.dev) {
      console.log(chalk.yellow('⚠️ Using development bypass mode - NOT SECURE'));
      await devBypassLogin();
      return;
    }
    
    // Default to web-based login if no token
    const useWeb = options.web !== false;
    if (useWeb) {
      await webBasedLogin();
    } else {
      console.log(chalk.yellow('Please provide a token with --token option or use --web to open browser login.'));
    }
  } catch (error) {
    console.error(chalk.red('Error during login:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Development bypass login for testing
 * DO NOT USE IN PRODUCTION
 */
async function devBypassLogin(): Promise<void> {
  try {
    const spinner = ora('Generating development token...').start();
    
    const response = await axios.get(`${API_BASE_URL}/api/cli/token?bypass=dev-only-do-not-use-in-production`);
    
    if (!response.data.token) {
      spinner.fail('Failed to get development token');
      throw new Error('Invalid response from server');
    }
    
    // Save the token
    saveToken(response.data.token);
    
    spinner.succeed('Development token generated and saved');
    
    console.log(chalk.yellow('\n⚠️ WARNING: Using a development token. This is not secure for production use.'));
  } catch (error) {
    console.error(chalk.red('Error generating development token:'), error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Performs web-based login by opening browser
 */
async function webBasedLogin(): Promise<void> {
  // Ask for confirmation before opening browser
  const { proceed } = await inquirer.prompt([{
    type: 'confirm',
    name: 'proceed',
    message: 'This will open your web browser to authenticate. Continue?',
    default: true
  }]);
  
  if (!proceed) {
    console.log(chalk.yellow('Login cancelled.'));
    return;
  }
  
  console.log(chalk.cyan('Opening browser for authentication...'));
  
  // URL for the CLI login page
  const loginUrl = `${API_BASE_URL}/cli/login`;
  
  // Display instructions
  console.log(chalk.white('\nInstructions:'));
  console.log('1. Login with your account in the browser');
  console.log('2. Click "Generate CLI Token"');
  console.log('3. Copy the generated token');
  console.log('4. Run the command shown in the browser\n');
  
  console.log(chalk.gray('If the browser does not open automatically, please visit:'));
  console.log(chalk.blue(loginUrl));
  
  // Open browser
  await open(loginUrl);
  
  console.log(chalk.green('\nWaiting for you to complete authentication in the browser...'));
} 