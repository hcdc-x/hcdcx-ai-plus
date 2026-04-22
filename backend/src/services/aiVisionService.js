const axios = require('axios');
const sharp = require('sharp');
const logger = require('../utils/logger');

const HF_SPACE_URL = process.env.HF_SPACE_URL || null;

/**
 * Enhance image for better scanning
 * @param {Buffer} imageBuffer - Raw image buffer
 * @returns {Promise<Buffer>} Enhanced image buffer
 */
async function enhanceImage(imageBuffer) {
  try {
    // First try local enhancement with sharp
    const enhanced = await localEnhance(imageBuffer);

    // If Hugging Face Space is configured, also try AI enhancement
    if (HF_SPACE_URL) {
      try {
        const aiEnhanced = await aiEnhance(imageBuffer);
        return aiEnhanced;
      } catch (aiError) {
        logger.warn(`AI enhancement failed, using local: ${aiError.message}`);
      }
    }

    return enhanced;
  } catch (error) {
    logger.error(`Image enhancement failed: ${error.message}`);
    return imageBuffer; // Return original on failure
  }
}

/**
 * Local image enhancement using sharp
 */
async function localEnhance(imageBuffer) {
  const image = sharp(imageBuffer);
  const metadata = await image.metadata();

  // Apply enhancements
  return await image
    .normalize() // Stretch contrast
    .modulate({
      brightness: 1.1,
      saturation: 1.2,
    })
    .sharpen({
      sigma: 1.5,
      m1: 1,
      m2: 2,
    })
    .median(1) // Reduce noise
    .toBuffer();
}

/**
 * AI-based enhancement via Hugging Face Space
 */
async function aiEnhance(imageBuffer) {
  if (!HF_SPACE_URL) {
    throw new Error('Hugging Face Space URL not configured');
  }

  const base64Image = imageBuffer.toString('base64');

  const response = await axios.post(
    `${HF_SPACE_URL}/api/predict`,
    {
      data: [base64Image],
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    }
  );

  if (response.data && response.data.data) {
    return Buffer.from(response.data.data[0], 'base64');
  }

  throw new Error('Invalid response from AI service');
}

/**
 * Detect and decode barcode/QR from image
 * @param {Buffer} imageBuffer - Image buffer
 * @returns {Promise<{text: string, format: string} | null>}
 */
async function detectAndDecode(imageBuffer) {
  // This would normally use a library like @zxing/library
  // For now, return null and let client-side handle decoding
  return null;
}

/**
 * Correct perspective and crop to code region
 */
async function preprocessForScanning(imageBuffer) {
  try {
    const image = sharp(imageBuffer);

    // Convert to grayscale and increase contrast
    return await image
      .grayscale()
      .normalize()
      .threshold(128)
      .toBuffer();
  } catch (error) {
    logger.error(`Preprocessing failed: ${error.message}`);
    return imageBuffer;
  }
}

/**
 * Adaptive lighting correction
 */
async function correctLighting(imageBuffer) {
  try {
    // Apply CLAHE-like enhancement
    return await sharp(imageBuffer)
      .clahe({
        width: 8,
        height: 8,
        maxSlope: 3,
      })
      .toBuffer();
  } catch (error) {
    return imageBuffer;
  }
}

module.exports = {
  enhanceImage,
  localEnhance,
  aiEnhance,
  detectAndDecode,
  preprocessForScanning,
  correctLighting,
};
