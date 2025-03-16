import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import open from 'open';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import url from 'url';
import { API_BASE_URL } from '../config';

// Path to store the auth token
const AUTH_FILE_PATH = path.join(os.homedir(), '.hackforge', 'auth.json');

/**
 * Ensure the directory for auth files exists
 */
function ensureAuthDirectory() {
  const authDir = path.dirname(AUTH_FILE_PATH);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }
}

/**
 * Save authentication token to local storage
 * @param token The authentication token to save
 */
export function saveToken(token: string): void {
  try {
    ensureAuthDirectory();
    fs.writeFileSync(AUTH_FILE_PATH, JSON.stringify({ token }));
    console.log(chalk.green('✅ Authentication token saved successfully'));
  } catch (error) {
    console.error(chalk.red('Error saving authentication token:'), error);
    throw new Error('Failed to save authentication token');
  }
}

/**
 * Get the authentication token from local storage
 * @returns The saved authentication token or null if not found
 */
export function getToken(): string | null {
  try {
    if (!fs.existsSync(AUTH_FILE_PATH)) {
      return null;
    }
    const authData = JSON.parse(fs.readFileSync(AUTH_FILE_PATH, 'utf8'));
    return authData.token || null;
  } catch (error) {
    console.error(chalk.yellow('Error reading authentication token:'), error);
    return null;
  }
}

/**
 * Check if user is authenticated
 * @returns Boolean indicating if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getToken() !== null;
}

/**
 * Create a local server to receive OAuth callbacks
 * @returns Promise that resolves with the authentication code
 */
function createLocalServer(): Promise<{ code: string, state: string }> {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      if (!req.url) {
        res.writeHead(400);
        res.end('Invalid request');
        return;
      }

      const parsedUrl = url.parse(req.url, true);
      const { code, state, error } = parsedUrl.query;

      if (error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Failed</h1>
              <p>Error: ${error}</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `);
        reject(new Error(`Authentication error: ${error}`));
        server.close();
        return;
      }

      if (code && state && typeof code === 'string' && typeof state === 'string') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Successful!</h1>
              <p>You can now close this window and return to the CLI.</p>
              <script>window.close();</script>
            </body>
          </html>
        `);
        resolve({ code, state });
        server.close();
      } else {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body>
              <h1>Authentication Failed</h1>
              <p>Missing required parameters.</p>
              <p>Please close this window and try again.</p>
            </body>
          </html>
        `);
        reject(new Error('Missing code or state parameter'));
        server.close();
      }
    });

    // Try to use a specific port, but fall back to a random one if busy
    server.listen(0, () => {
      const address = server.address();
      if (!address || typeof address === 'string') {
        server.close();
        reject(new Error('Failed to start local server'));
        return;
      }
    });

    // Handle server errors
    server.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Perform authentication using OAuth
 * @returns Promise resolving to authentication token
 */
async function performOAuthAuthentication(): Promise<string> {
  console.log(chalk.blue('📲 Opening browser for authentication...'));

  // For the web-based login flow, open the CLI login page in a browser
  const loginUrl = `${API_BASE_URL}/cli/login`;
  
  try {
    await open(loginUrl);
    
    console.log(chalk.yellow('\nComplete the authentication in your browser.'));
    console.log(chalk.yellow('After authenticating, you will receive a token to copy.'));
    
    // Prompt the user to paste the token they received
    const { token } = await inquirer.prompt([
      {
        type: 'password',
        name: 'token',
        message: 'Paste the authentication token:',
        validate: (input) => input.length > 0 ? true : 'Token is required'
      }
    ]);
    
    return token;
  } catch (error) {
    console.error(chalk.red('Error during authentication:'), error);
    throw new Error('Authentication failed');
  }
}

/**
 * Development mode authentication (no actual auth, just generates a token)
 * @returns Promise resolving to a development token
 */
async function performDevAuthentication(): Promise<string> {
  console.log(chalk.yellow('⚠️ Using development authentication mode'));
  console.log(chalk.yellow('This mode bypasses actual authentication and should only be used during development.'));

  try {
    const response = await fetch(`${API_BASE_URL}/api/cli/token?bypass=dev-only-do-not-use-in-production`);
    
    if (!response.ok) {
      throw new Error(`Failed to get development token: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.token;
  } catch (error) {
    console.error(chalk.red('Error getting development token:'), error);
    throw new Error('Failed to get development token');
  }
}

/**
 * Prompt user for authentication method
 * @returns Promise resolving to authentication token
 */
export async function promptForAuth(options: { web?: boolean, dev?: boolean, token?: string } = {}): Promise<string> {
  // If a token is directly provided, use it
  if (options.token) {
    return options.token;
  }
  
  // If web flag is provided, use web authentication
  if (options.web) {
    return performOAuthAuthentication();
  }
  
  // If dev flag is provided, use development authentication
  if (options.dev) {
    return performDevAuthentication();
  }
  
  // Otherwise, prompt the user for authentication method
  const { authMethod } = await inquirer.prompt([
    {
      type: 'list',
      name: 'authMethod',
      message: 'How would you like to authenticate?',
      choices: [
        { name: 'Web Browser (Recommended)', value: 'web' },
        { name: 'Development Mode (No Auth)', value: 'dev' },
        { name: 'Cancel', value: 'cancel' }
      ]
    }
  ]);
  
  if (authMethod === 'cancel') {
    throw new Error('Authentication cancelled');
  }
  
  if (authMethod === 'web') {
    return performOAuthAuthentication();
  }
  
  if (authMethod === 'dev') {
    return performDevAuthentication();
  }
  
  throw new Error('Invalid authentication method');
} 