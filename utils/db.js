import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PHOTOS_FILE = path.join(DATA_DIR, 'photos.json');
const LIKES_FILE = path.join(DATA_DIR, 'likes.json');
const COMMENTS_FILE = path.join(DATA_DIR, 'comments.json');
const TAGS_FILE = path.join(DATA_DIR, 'tags.json');

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

export async function updateUser(userId, updates) {
  const users = await getUsers();
  const userIndex = users.findIndex(user => user.id === userId);

  if (userIndex === -1) {
    return null;
  }

  users[userIndex] = {
    ...users[userIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  await saveUsers(users);
  return users[userIndex];
}

// Comment-related functions
export async function getComments() {
  const comments = await readJSON(COMMENTS_FILE);
  return comments || [];
}

export async function saveComments(comments) {
  await ensureDataDir();
  await writeJSON(COMMENTS_FILE, comments);
}

export async function addComment(comment) {
  const comments = await getComments();
  comments.push(comment);
  await saveComments(comments);
  return comment;
}

export async function getPhotoComments(photoId) {
  const comments = await getComments();
  return comments.filter(comment => comment.photoId === photoId);
}

export async function deleteComment(commentId) {
  const comments = await getComments();
  const filteredComments = comments.filter(comment => comment.id !== commentId);
  await saveComments(filteredComments);
  return filteredComments.length < comments.length;
}

export async function updateComment(commentId, content) {
  const comments = await getComments();
  const commentIndex = comments.findIndex(comment => comment.id === commentId);

  if (commentIndex === -1) {
    return null;
  }

  comments[commentIndex] = {
    ...comments[commentIndex],
    content,
    updatedAt: new Date().toISOString()
  };

  await saveComments(comments);
  return comments[commentIndex];
}

export async function findCommentById(id) {
  const comments = await getComments();
  return comments.find(comment => comment.id === id);
}

export async function getPhotoCommentCount(photoId) {
  const comments = await getComments();
  return comments.filter(comment => comment.photoId === photoId).length;
}

// Tag-related functions
export async function getTags() {
  const tags = await readJSON(TAGS_FILE);
  return tags || [];
}

export async function saveTags(tags) {
  await ensureDataDir();
  await writeJSON(TAGS_FILE, tags);
}

export async function addOrUpdateTag(tagName) {
  const tags = await getTags();
  const existingTag = tags.find(t => t.tag === tagName);

  if (existingTag) {
    existingTag.count += 1;
  } else {
    tags.push({
      tag: tagName,
      count: 1,
      createdAt: new Date().toISOString()
    });
  }

  await saveTags(tags);
}

export async function getPopularTags(limit = 20) {
  const tags = await getTags();
  return tags
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getPhotosByCategory(category) {
  const photos = await getPhotos();
  return photos.filter(photo => photo.category === category && photo.isDefault === true);
}

export async function getPhotosByTag(tag) {
  const photos = await getPhotos();
  return photos.filter(photo =>
    photo.tags &&
    photo.tags.includes(tag) &&
    photo.isDefault === true
  );
}

export async function getPhotosByTags(tags) {
  const photos = await getPhotos();
  return photos.filter(photo =>
    photo.tags &&
    tags.some(tag => photo.tags.includes(tag)) &&
    photo.isDefault === true
  );
}
