import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import open from 'open';
import { saveToken } from '../utils/auth';
import { API_BASE_URL } from '../config';
import axios from 'axios';

interface LoginCommandOptions {
  token?: string;
  web?: boolean;
  email?: string;
  password?: string;
}

/**
 * Implements the login command for authenticating with the Hackforge server
 * @param options Command options
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
    
    // If email and password are provided, use direct authentication
    if (options.email && options.password) {
      await directAuthentication(options.email, options.password);
      return;
    }
    
    // Ask for authentication method
    const { method } = await inquirer.prompt([{
      type: 'list',
      name: 'method',
      message: 'How would you like to authenticate?',
      choices: [
        { name: 'Web browser login (recommended)', value: 'web' },
        { name: 'Email & password', value: 'credentials' }
      ]
    }]);
    
    if (method === 'credentials') {
      // Ask for email and password
      const credentials = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'Email:',
          validate: (input) => input.includes('@') ? true : 'Please enter a valid email'
        },
        {
          type: 'password',
          name: 'password',
          message: 'Password:',
          mask: '*'
        }
      ]);
      
      await directAuthentication(credentials.email, credentials.password);
    } else {
      // Default to web-based login
      await webBasedLogin();
    }
  } catch (error) {
    console.error(chalk.red('Error during login:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Authenticate directly with email and password
 */
async function directAuthentication(email: string, password: string): Promise<void> {
  const spinner = ora('Authenticating...').start();
  
  try {
    // Make a request to the authentication endpoint
    const response = await axios.post(`${API_BASE_URL}/api/cli/auth`, {
      email,
      password
    });
    
    if (response.data && response.data.token) {
      saveToken(response.data.token);
      spinner.succeed('Authentication successful');
      console.log(chalk.green(`\nLogged in as: ${chalk.cyan(email)}`));
      console.log(chalk.cyan('\nYou can now use the hackforge CLI commands.'));
      console.log('Run ' + chalk.cyan('hackforge projects') + ' to list your projects.');
    } else {
      spinner.fail('Authentication failed');
      console.error(chalk.red('Error: Invalid response from server'));
    }
  } catch (error) {
    spinner.fail('Authentication failed');
    if (axios.isAxiosError(error) && error.response) {
      console.error(chalk.red(`Error: ${error.response.data.error || 'Invalid credentials'}`));
    } else {
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    }
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
    message: 'This will open your web browser to generate a CLI token. Continue?',
    default: true
  }]);
  
  if (!proceed) {
    console.log(chalk.yellow('Login cancelled.'));
    return;
  }
  
  const spinner = ora('Opening browser for token generation...').start();
  
  // URL for the CLI token page
  const tokenUrl = `${API_BASE_URL}/cli/login`;
  
  // Open browser
  await open(tokenUrl);
  spinner.succeed('Browser opened for token generation');
  
  // Display instructions
  console.log(chalk.white('\nInstructions:'));
  console.log('1. Sign in with your account in the browser');
  console.log('2. Click on "Generate CLI Token" button');
  console.log('3. Copy the token displayed on the page');
  console.log('4. Run the following command to save your token:');
  console.log(chalk.cyan('    $ hackforge token <your-token-here>'));
  
  console.log(chalk.gray('\nIf the browser does not open automatically, please visit:'));
  console.log(chalk.blue(tokenUrl));
} 