import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const optimizeImage = async (inputPath, outputPath, options = {}) => {
  try {
    const {
      width = 1200,
      height = null,
      fit = 'inside',
      quality = 85,
      withoutEnlargement = true
    } = options;

    await sharp(inputPath)
      .resize(width, height, {
        withoutEnlargement,
        fit
      })
      .webp({ quality })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw new Error('Failed to optimize image');
  }
};

export const generateThumbnail = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .resize(300, null, {
        withoutEnlargement: true,
        fit: 'inside'
      })
      .webp({ quality: 80 })
      .toFile(outputPath);

    return outputPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    throw new Error('Failed to generate thumbnail');
  }
};

export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
