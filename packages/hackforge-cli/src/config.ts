/**
 * Base URL for the Hackforge API
 */
export const API_BASE_URL = process.env.HACKFORGE_API_URL || 'http://localhost:3000';

/**
 * Default timeout for API requests in milliseconds (30 seconds)
 */
export const API_TIMEOUT = 30000;

/**
 * Default format for project data export
 */
export const DEFAULT_FORMAT = 'json';

/**
 * Default output file for project data
 */
export const DEFAULT_OUTPUT_FILE = './project-details.json'; 