import axios from 'axios';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import ora from 'ora';
import inquirer from 'inquirer';
import AdmZip from 'adm-zip';
import { getToken, isAuthenticated } from '../utils/auth';
import { API_BASE_URL } from '../config';

/**
 * Implements the copy command to download and set up a project from Hackforge server
 * @param projectId - The ID of the project to download
 * @param destination - The local directory to save the project
 */
export async function copyCommand(projectId: string, destination: string): Promise<void> {
  try {
    // Handle destination path
    const destPath = path.resolve(process.cwd(), destination);
    
    // Display initial message
    console.log(chalk.bold('\n📦 Hackforge Project Copy Tool\n'));
    console.log(`Preparing to copy project ${chalk.cyan(projectId)} to ${chalk.cyan(destPath)}\n`);
    
    // Check if destination exists
    if (fs.existsSync(destPath)) {
      const stats = fs.statSync(destPath);
      if (!stats.isDirectory()) {
        console.error(chalk.red(`Error: Destination '${destPath}' exists but is not a directory.`));
        process.exit(1);
      }
      
      // Check if directory is empty
      const files = fs.readdirSync(destPath);
      if (files.length > 0) {
        const { proceed } = await inquirer.prompt([{
          type: 'confirm',
          name: 'proceed',
          message: `Destination directory is not empty. Files may be overwritten. Proceed?`,
          default: false
        }]);
        
        if (!proceed) {
          console.log(chalk.yellow('Operation cancelled.'));
          process.exit(0);
        }
      }
    } else {
      // Create the directory
      fs.mkdirSync(destPath, { recursive: true });
    }
    
    // Check authentication
    if (!isAuthenticated()) {
      console.log(chalk.yellow('You are not authenticated. Please run:'));
      console.log(chalk.cyan('  hackforge auth:login'));
      process.exit(1);
    }
    
    // Get auth token
    const token = getToken();
    
    // Download the project
    const spinner = ora('Downloading project from Hackforge...').start();
    
    try {
      // Fetch project data from API
      const response = await axios.get(`${API_BASE_URL}/api/projects/${projectId}/download`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: 'arraybuffer'
      });
      
      spinner.text = 'Extracting project files...';
      
      // Save the zip file temporarily
      const tempZipPath = path.join(destPath, '.hackforge-temp.zip');
      fs.writeFileSync(tempZipPath, response.data);
      
      // Extract the zip file
      const zip = new AdmZip(tempZipPath);
      zip.extractAllTo(destPath, true);
      
      // Clean up the temporary zip file
      fs.unlinkSync(tempZipPath);
      
      // Show success message
      spinner.succeed('Project copied successfully!');
      
      // Check for readme and show helpful information
      const readmePath = path.join(destPath, 'README.md');
      if (fs.existsSync(readmePath)) {
        console.log(chalk.cyan('\nProject includes a README.md file with instructions. Check it out!'));
      }
      
      console.log(chalk.green('\n✅ Project is ready to use!'));
      console.log(chalk.cyan(`   cd ${destination}`));
      
      // Check for package.json and suggest npm install
      const packageJsonPath = path.join(destPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log(chalk.cyan('   npm install'));
      }
      
    } catch (error) {
      spinner.fail('Failed to download project');
      
      // Check for common errors
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          console.error(chalk.red('Authentication token expired or invalid.'));
          console.log('Please authenticate again with: ' + chalk.cyan('hackforge auth:login'));
        } else if (error.response?.status === 404) {
          console.error(chalk.red(`Project with ID '${projectId}' not found.`));
          console.log('Please check the project ID and try again.');
        } else {
          console.error(chalk.red('Server error:'), error.message);
        }
      } else {
        console.error(chalk.red('Unexpected error:'), error instanceof Error ? error.message : String(error));
      }
      
      process.exit(1);
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
} 