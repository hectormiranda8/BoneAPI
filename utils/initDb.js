import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { defaultPhotos } from '../seed/defaultPhotos.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function ensureDataDirectory() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    console.log('Data directory created or already exists');
  } catch (error) {
    console.error('Error creating data directory:', error);
    throw error;
  }
}

async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    await ensureDataDirectory();

    const usersExists = await fileExists(USERS_FILE);
    if (!usersExists) {
      await fs.writeFile(USERS_FILE, JSON.stringify([], null, 2), 'utf-8');
      console.log('Created users.json with empty array');
    } else {
      console.log('users.json already exists');
    }

    const photosExists = await fileExists(PHOTOS_FILE);
    if (!photosExists) {
      await fs.writeFile(PHOTOS_FILE, JSON.stringify(defaultPhotos, null, 2), 'utf-8');
      console.log(`Created photos.json with ${defaultPhotos.length} default puppy photos`);
    } else {
      console.log('photos.json already exists');
    }

    console.log('Database initialization complete');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export default initializeDatabase;
