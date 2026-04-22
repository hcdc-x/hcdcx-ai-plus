const QRCode = require('qrcode');
const JsBarcode = require('jsbarcode');
const { createCanvas } = require('canvas');
const sharp = require('sharp');
const logger = require('../utils/logger');

/**
 * Generate hybrid code combining QR, Barcode, and RGB color layers
 * @param {Object} options - Encoding options
 * @param {string} options.data - Data to encode
 * @param {string} options.mode - 'qr' | 'barcode' | 'hybrid' | 'adaptive'
 * @param {number} options.colorDepth - 1-3 color layers
 * @param {boolean} options.dynamic - Enable dynamic timestamp
 * @param {number} options.expiresIn - Validity in seconds
 * @param {Object} options.adaptiveParams - Adaptive encoding parameters
 * @returns {Promise<{imageBuffer: Buffer, metadata: Object}>}
 */
async function generateHybridCode(options) {
  const {
    data,
    mode = 'hybrid',
    colorDepth = 2,
    dynamic = false,
    expiresIn = 30,
    adaptiveParams = {},
  } = options;

  const metadata = {
    mode,
    colorDepth,
    dynamic,
    expiresIn,
    timestamp: new Date().toISOString(),
    adaptiveParams,
  };

  try {
    // Prepare data with timestamp if dynamic
    let encodedData = data;
    if (dynamic) {
      const timestamp = Date.now();
      const expiry = timestamp + expiresIn * 1000;
      encodedData = JSON.stringify({
        d: data,
        ts: timestamp,
        exp: expiry,
      });
      metadata.expiresAt = new Date(expiry).toISOString();
    }

    let finalImageBuffer;

    switch (mode) {
      case 'qr':
        finalImageBuffer = await generateQRCode(encodedData, { colorDepth });
        break;
      case 'barcode':
        finalImageBuffer = await generateBarcode(encodedData);
        break;
      case 'hybrid':
      case 'adaptive':
        finalImageBuffer = await generateHybridLayeredCode(encodedData, {
          colorDepth,
          adaptive: mode === 'adaptive',
          adaptiveParams,
        });
        break;
      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }

    return {
      imageBuffer: finalImageBuffer,
      metadata: {
        ...metadata,
        dataSize: encodedData.length,
        encoding: mode,
      },
    };
  } catch (error) {
    logger.error(`Hybrid encoding failed: ${error.message}`);
    throw error;
  }
}

/**
 * Generate QR code with optional color layers
 */
async function generateQRCode(data, options = {}) {
  const { colorDepth = 1 } = options;

  // Generate base QR code
  const qrDataURL = await QRCode.toDataURL(data, {
    errorCorrectionLevel: colorDepth > 1 ? 'H' : 'M',
    margin: 2,
    width: 400,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
  });

  const baseImage = Buffer.from(qrDataURL.split(',')[1], 'base64');

  if (colorDepth === 1) {
    return baseImage;
  }

  // Add color layers
  return await addColorLayers(baseImage, data, colorDepth);
}

/**
 * Generate barcode
 */
async function generateBarcode(data) {
  const canvas = createCanvas(400, 200);
  JsBarcode(canvas, data, {
    format: 'CODE128',
    width: 2,
    height: 100,
    displayValue: true,
    fontSize: 14,
    margin: 10,
  });

  return canvas.toBuffer('image/png');
}

/**
 * Generate hybrid layered code (QR + Barcode + RGB channels)
 */
async function generateHybridLayeredCode(data, options = {}) {
  const { colorDepth = 2, adaptive = false, adaptiveParams = {} } = options;

  // Determine how to split data across layers
  const dataChunks = splitDataForLayers(data, colorDepth);

  // Generate base QR with core data
  const coreQR = await QRCode.toDataURL(dataChunks[0], {
    errorCorrectionLevel: 'H',
    margin: 1,
    width: 400,
    color: { dark: '#000000', light: '#ffffff' },
  });

  const baseBuffer = Buffer.from(coreQR.split(',')[1], 'base64');

  if (colorDepth === 1) {
    return baseBuffer;
  }

  // Generate additional QR codes for color channels
  const colorLayers = [];
  const colors = [
    { r: 255, g: 0, b: 0 },     // Red channel
    { r: 0, g: 255, b: 0 },     // Green channel
    { r: 0, g: 0, b: 255 },     // Blue channel
  ];

  for (let i = 1; i < colorDepth; i++) {
    if (dataChunks[i]) {
      const layerQR = await QRCode.toDataURL(dataChunks[i], {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 400,
        color: { dark: '#000000', light: '#ffffff' },
      });
      colorLayers.push({
        buffer: Buffer.from(layerQR.split(',')[1], 'base64'),
        color: colors[i - 1],
      });
    }
  }

  // Merge layers using sharp
  let composite = sharp(baseBuffer);

  for (const layer of colorLayers) {
    // Create tinted version of the layer
    const tinted = await sharp(layer.buffer)
      .modulate({
        brightness: 1,
        saturation: 0,
      })
      .tint(layer.color)
      .toBuffer();

    composite = composite.composite([{ input: tinted, blend: 'screen' }]);
  }

  // Add barcode at the bottom for hybrid mode
  if (adaptive) {
    const barcodeCanvas = createCanvas(400, 60);
    JsBarcode(barcodeCanvas, dataChunks[0].substring(0, 20), {
      format: 'CODE128',
      width: 1.5,
      height: 40,
      displayValue: false,
      margin: 5,
    });
    const barcodeBuffer = barcodeCanvas.toBuffer('image/png');

    // Append barcode below the hybrid code
    const finalImage = await sharp({
      create: {
        width: 400,
        height: 460,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: await composite.toBuffer(), top: 0, left: 0 },
        { input: barcodeBuffer, top: 400, left: 0 },
      ])
      .png()
      .toBuffer();

    return finalImage;
  }

  return await composite.png().toBuffer();
}

/**
 * Add RGB color layers to existing QR code
 */
async function addColorLayers(baseImage, data, depth) {
  const layers = [];
  const colors = [
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
  ];

  // Generate additional data for color channels
  const extendedData = generateExtendedData(data, depth - 1);

  for (let i = 0; i < depth - 1; i++) {
    const layerQR = await QRCode.toDataURL(extendedData[i] || data, {
      errorCorrectionLevel: 'L',
      margin: 1,
      width: 400,
    });
    const layerBuffer = Buffer.from(layerQR.split(',')[1], 'base64');

    // Tint the layer
    const tinted = await sharp(layerBuffer)
      .modulate({ brightness: 1, saturation: 0 })
      .tint(colors[i])
      .toBuffer();

    layers.push(tinted);
  }

  // Composite all layers
  let composite = sharp(baseImage);
  for (const layer of layers) {
    composite = composite.composite([{ input: layer, blend: 'screen' }]);
  }

  return await composite.png().toBuffer();
}

/**
 * Split data intelligently across layers
 */
function splitDataForLayers(data, depth) {
  const chunks = [];
  const base64Data = Buffer.from(data).toString('base64');

  if (depth === 1) {
    return [data];
  }

  // Core data (40%)
  const coreSize = Math.floor(base64Data.length * 0.4);
  chunks.push(base64Data.substring(0, coreSize));

  // Extended data distributed across color channels
  const remaining = base64Data.substring(coreSize);
  const chunkSize = Math.ceil(remaining.length / (depth - 1));

  for (let i = 0; i < depth - 1; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, remaining.length);
    if (start < remaining.length) {
      chunks.push(remaining.substring(start, end));
    }
  }

  // Decode back to original format
  return chunks.map(chunk => {
    try {
      return Buffer.from(chunk, 'base64').toString();
    } catch {
      return chunk;
    }
  });
}

/**
 * Generate extended data for color channels
 */
function generateExtendedData(originalData, count) {
  const extended = [];
  const timestamp = Date.now().toString(36);
  const checksum = calculateChecksum(originalData).toString(36);

  for (let i = 0; i < count; i++) {
    extended.push(JSON.stringify({
      ts: timestamp,
      cs: checksum,
      idx: i,
      meta: `hcdcx-layer-${i}`,
    }));
  }

  return extended;
}

/**
 * Simple checksum for anti-counterfeit
 */
function calculateChecksum(data) {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

module.exports = {
  generateHybridCode,
  generateQRCode,
  generateBarcode,
  addColorLayers,
};
