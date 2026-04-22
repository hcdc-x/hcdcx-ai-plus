const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Test configuration
cloudinary.api.ping()
  .then(() => logger.info('✅ Cloudinary configured'))
  .catch((err) => logger.error(`❌ Cloudinary configuration failed: ${err.message}`));

/**
 * Upload image to Cloudinary
 * @param {string} imageBase64 - Base64 encoded image or file path
 * @param {object} options - Upload options
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadImage = async (imageBase64, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(imageBase64, {
      folder: 'hcdcx-codes',
      resource_type: 'image',
      ...options,
    });
    return result;
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`);
    throw error;
  }
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<object>} Deletion result
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`);
    throw error;
  }
};

module.exports = { cloudinary, uploadImage, deleteImage };
