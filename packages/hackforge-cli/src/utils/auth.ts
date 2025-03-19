import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import chalk from 'chalk';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { API_BASE_URL, API_TIMEOUT } from '../config';

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
    console.error(chalk.red('Error reading authentication token:'), error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * @returns True if the user has a saved token, false otherwise
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

/**
 * Delete the saved authentication token
 */
export function deleteToken(): void {
  try {
    if (fs.existsSync(AUTH_FILE_PATH)) {
      fs.unlinkSync(AUTH_FILE_PATH);
    }
  } catch (error) {
    console.error(chalk.red('Error deleting authentication token:'), error);
  }
}

/**
 * Get JWT user information from the token
 * @returns User information from the token or null if not available
 */
export function getUserFromToken(): any | null {
  try {
    const token = getToken();
    if (!token) return null;
    
    // Decode the token (without verification)
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error(chalk.red('Error decoding token:'), error);
    return null;
  }
}

/**
 * Create axios instance with authentication token
 * @returns Configured axios instance
 */
export function createAuthenticatedClient() {
  const token = getToken();
  
  return axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  });
} 