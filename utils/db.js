import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');

async function readJSON(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return null;
    }
    throw error;
  }
}

async function writeJSON(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function getUsers() {
  const users = await readJSON(USERS_FILE);
  return users || [];
}

export async function saveUsers(users) {
  await ensureDataDir();
  await writeJSON(USERS_FILE, users);
}

export async function getPhotos() {
  const photos = await readJSON(PHOTOS_FILE);
  return photos || [];
}

export async function savePhotos(photos) {
  await ensureDataDir();
  await writeJSON(PHOTOS_FILE, photos);
}

export async function addUser(user) {
  const users = await getUsers();
  users.push(user);
  await saveUsers(users);
  return user;
}

export async function addPhoto(photo) {
  const photos = await getPhotos();
  photos.push(photo);
  await savePhotos(photos);
  return photo;
}

export async function findUserByEmail(email) {
  const users = await getUsers();
  return users.find(user => user.email === email);
}

export async function findUserByUsername(username) {
  const users = await getUsers();
  return users.find(user => user.username === username);
}

export async function findUserById(id) {
  const users = await getUsers();
  return users.find(user => user.id === id);
}

export async function getUserPhotos(userId) {
  const photos = await getPhotos();
  return photos.filter(photo => photo.userId === userId);
}

export async function getDefaultPhotos() {
  const photos = await getPhotos();
  return photos.filter(photo => photo.isDefault === true);
}

export async function deletePhoto(photoId) {
  const photos = await getPhotos();
  const filteredPhotos = photos.filter(photo => photo.id !== photoId);
  await savePhotos(filteredPhotos);
  return filteredPhotos.length < photos.length;
}

export async function findPhotoById(photoId) {
  const photos = await getPhotos();
  return photos.find(photo => photo.id === photoId);
}

// Like-related functions
export async function getLikes() {
  const likes = await readJSON(LIKES_FILE);
  return likes || [];
}

export async function saveLikes(likes) {
  await ensureDataDir();
  await writeJSON(LIKES_FILE, likes);
}

export async function addLike(userId, photoId) {
  const likes = await getLikes();
  const existingLike = likes.find(
    like => like.userId === userId && like.photoId === photoId
  );

  if (existingLike) {
    return null;
  }

  const newLike = {
    userId,
    photoId,
    createdAt: new Date().toISOString()
  };

  likes.push(newLike);
  await saveLikes(likes);
  return newLike;
}

export async function removeLike(userId, photoId) {
  const likes = await getLikes();
  const filteredLikes = likes.filter(
    like => !(like.userId === userId && like.photoId === photoId)
  );

  if (filteredLikes.length === likes.length) {
    return false;
  }

  await saveLikes(filteredLikes);
  return true;
}

export async function getPhotoLikeCount(photoId) {
  const likes = await getLikes();
  return likes.filter(like => like.photoId === photoId).length;
}

export async function getUserLikes(userId) {
  const likes = await getLikes();
  return likes.filter(like => like.userId === userId);
}

export async function isPhotoLikedByUser(photoId, userId) {
  const likes = await getLikes();
  return likes.some(like => like.photoId === photoId && like.userId === userId);
}

export async function updatePhoto(photoId, updates) {
  const photos = await getPhotos();
  const photoIndex = photos.findIndex(photo => photo.id === photoId);

  if (photoIndex === -1) {
    return null;
  }

  photos[photoIndex] = {
    ...photos[photoIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await savePhotos(photos);
  return photos[photoIndex];
}
