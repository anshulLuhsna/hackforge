import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import ora from 'ora';
import { isAuthenticated, createAuthenticatedClient, getToken, getUserFromToken } from '../utils/auth';
import { DEFAULT_FORMAT, DEFAULT_OUTPUT_FILE } from '../config';

interface ProjectsCommandOptions {
  download?: string;
  output?: string;
  all?: boolean;
  format?: 'json' | 'markdown';
  debug?: boolean;
}

interface Project {
  _id: string;
  hackathonName: string;
  theme: string;
  duration: string;
  teamSize: string;
  projectIdea: string;
  techStack: string;
  userId: string;
  createdAt: string;
}

/**
 * Implements the projects command for listing and downloading projects
 * @param options Command options
 */
export async function projectsCommand(options: ProjectsCommandOptions): Promise<void> {
  try {
    // Check authentication
    if (!isAuthenticated()) {
      console.error(chalk.red('Error: You must be logged in to use this command.'));
      console.log(`Run ${chalk.cyan('hackforge login')} to authenticate.`);
      process.exit(1);
    }

    // Show debug information if requested
    if (options.debug) {
      const token = getToken();
      const user = getUserFromToken();
      console.log(chalk.yellow('\n--- DEBUG INFO ---'));
      console.log('Token exists:', !!token);
      console.log('Token length:', token?.length);
      if (token) {
        console.log('Token prefix:', token.substring(0, 10) + '...');
      }
      console.log('User info from token:', user ? JSON.stringify(user) : 'None');
      console.log('API URL:', process.env.HACKFORGE_API_URL || 'http://localhost:3000');
      console.log(chalk.yellow('--- END DEBUG ---\n'));
    }

    const spinner = ora('Fetching your projects...').start();
    
    // Create authenticated HTTP client
    const client = createAuthenticatedClient();
    
    try {
      const response = await client.get('/api/projects');
      const projects = response.data as Project[];
      
      spinner.succeed(`Found ${projects.length} projects`);
      
      if (projects.length === 0) {
        console.log(chalk.yellow('\nYou don\'t have any projects yet.'));
        return;
      }
      
      // Handle the different options
      if (options.download) {
        await downloadProject(projects, options.download, options.output, options.format);
      } else if (options.all) {
        await downloadAllProjects(projects, options.output, options.format);
      } else {
        displayProjects(projects);
      }
    } catch (error) {
      spinner.fail('Failed to fetch projects');
      console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
      
      if (options.debug) {
        console.log(chalk.yellow('\n--- ERROR DETAILS ---'));
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosError = error as any;
          console.log('Status:', axiosError.response?.status);
          console.log('Status Text:', axiosError.response?.statusText);
          console.log('Response data:', JSON.stringify(axiosError.response?.data, null, 2));
        }
        console.log(chalk.yellow('--- END ERROR DETAILS ---\n'));
      }
      
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Display a list of projects in the console
 * @param projects Array of projects to display
 */
function displayProjects(projects: Project[]): void {
  console.log(chalk.bold('\n📋 Your Projects:\n'));
  
  projects.forEach((project, index) => {
    console.log(chalk.bold(`${index + 1}. ${project.hackathonName} ${chalk.blue('(ID: ' + project._id + ')')}`));
    console.log(`   Theme: ${project.theme}`);
    console.log(`   Tech Stack: ${project.techStack}`);
    console.log(`   Created: ${new Date(project.createdAt).toLocaleDateString()}`);
    console.log('');
  });
  
  console.log(chalk.cyan(`\nTo download a specific project, run:`));
  console.log(`  hackforge projects --download <project-id> --output <path>\n`);
}

/**
 * Download a specific project
 * @param projects Array of all projects
 * @param projectId ID of the project to download
 * @param outputPath Path to save the project data
 * @param format Output format (json or markdown)
 */
async function downloadProject(
  projects: Project[], 
  projectId: string, 
  outputPath: string = DEFAULT_OUTPUT_FILE, 
  format: string = DEFAULT_FORMAT
): Promise<void> {
  // Find the project with the given ID
  const project = projects.find(p => p._id === projectId);
  
  if (!project) {
    console.error(chalk.red(`Error: Project with ID '${projectId}' not found.`));
    process.exit(1);
  }
  
  const spinner = ora(`Preparing to download project: ${project.hackathonName}`).start();
  
  try {
    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    await fs.ensureDir(outputDir);
    
    // Format the project data
    let outputData: string;
    
    if (format === 'markdown') {
      outputData = formatProjectAsMarkdown(project);
    } else {
      // Default to JSON
      outputData = JSON.stringify(project, null, 2);
    }
    
    // Write to file
    await fs.writeFile(outputPath, outputData);
    
    spinner.succeed(`Project data saved to ${chalk.cyan(outputPath)}`);
  } catch (error) {
    spinner.fail('Failed to save project data');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Download all projects
 * @param projects Array of all projects
 * @param outputPath Path to save the project data
 * @param format Output format (json or markdown)
 */
async function downloadAllProjects(
  projects: Project[], 
  outputPath: string = './hackforge-projects.json', 
  format: string = DEFAULT_FORMAT
): Promise<void> {
  const spinner = ora(`Preparing to download all ${projects.length} projects`).start();
  
  try {
    // Create the output directory if it doesn't exist
    const outputDir = path.dirname(outputPath);
    await fs.ensureDir(outputDir);
    
    // Format the project data
    let outputData: string;
    
    if (format === 'markdown') {
      outputData = projects.map(formatProjectAsMarkdown).join('\n\n---\n\n');
    } else {
      // Default to JSON
      outputData = JSON.stringify(projects, null, 2);
    }
    
    // Write to file
    await fs.writeFile(outputPath, outputData);
    
    spinner.succeed(`All ${projects.length} projects saved to ${chalk.cyan(outputPath)}`);
  } catch (error) {
    spinner.fail('Failed to save projects data');
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Format a project as Markdown
 * @param project Project to format
 * @returns Markdown formatted string
 */
function formatProjectAsMarkdown(project: Project): string {
  return `# ${project.hackathonName}

## Project Details

- **ID**: ${project._id}
- **Theme**: ${project.theme}
- **Duration**: ${project.duration}
- **Team Size**: ${project.teamSize}
- **Created**: ${new Date(project.createdAt).toLocaleDateString()}

## Project Idea

${project.projectIdea}

## Tech Stack

${project.techStack}

`;
} 