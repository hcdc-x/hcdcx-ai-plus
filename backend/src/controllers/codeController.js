const Code = require('../models/Code');
const logger = require('../utils/logger');
const { generateHybridCode } = require('../services/hybridEncoder');
const { uploadImage } = require('../config/cloudinary');
const { v4: uuidv4 } = require('uuid');

// @desc    Get all codes for current user
// @route   GET /api/codes
exports.getAllCodes = async (req, res, next) => {
  try {
    const codes = await Code.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-__v');

    res.json(codes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single code by ID
// @route   GET /api/codes/:id
exports.getCodeById = async (req, res, next) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    res.json(code);
  } catch (error) {
    next(error);
  }
};

// @desc    Generate new hybrid code
// @route   POST /api/codes/generate
exports.generateCode = async (req, res, next) => {
  try {
    const {
      name,
      inputType,
      content,
      mode,
      colorDepth = 2,
      dynamic = false,
      expiresIn,
      adaptiveParams,
    } = req.body;

    if (!name || !content || !mode) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate hybrid code image
    const { imageBuffer, metadata } = await generateHybridCode({
      data: content,
      mode,
      colorDepth,
      dynamic,
      expiresIn,
      adaptiveParams,
    });

    // Upload to Cloudinary
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    const uploadResult = await uploadImage(base64Image, {
      public_id: `hcdcx-${uuidv4()}`,
      tags: [mode, req.user.id],
    });

    // Calculate expiration if dynamic
    let expiresAt = null;
    if (dynamic && expiresIn) {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    // Save to database
    const code = await Code.create({
      userId: req.user.id,
      name,
      type: mode,
      data: {
        inputType,
        content,
        url: inputType === 'url' ? content : null,
        text: inputType === 'text' ? content : null,
      },
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      colorDepth,
      isDynamic: dynamic,
      expiresAt,
      metadata: {
        encodingParams: metadata,
        adaptiveParams,
      },
    });

    logger.info(`Code generated: ${code._id} by user ${req.user.id}`);

    res.status(201).json(code);
  } catch (error) {
    logger.error(`Code generation failed: ${error.message}`);
    next(error);
  }
};

// @desc    Update code
// @route   PATCH /api/codes/:id
exports.updateCode = async (req, res, next) => {
  try {
    const { name, content, expiresIn } = req.body;

    const code = await Code.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    if (name) code.name = name;
    if (content) {
      code.data.content = content;
      // Regenerate image? For simplicity, we skip re-encoding here
    }
    if (expiresIn && code.isDynamic) {
      code.expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    await code.save();

    res.json(code);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete code
// @route   DELETE /api/codes/:id
exports.deleteCode = async (req, res, next) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    // Delete from Cloudinary
    if (code.publicId) {
      const { deleteImage } = require('../config/cloudinary');
      await deleteImage(code.publicId);
    }

    await code.deleteOne();

    logger.info(`Code deleted: ${req.params.id}`);

    res.json({ message: 'Code deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Duplicate code
// @route   POST /api/codes/:id/duplicate
exports.duplicateCode = async (req, res, next) => {
  try {
    const original = await Code.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!original) {
      return res.status(404).json({ message: 'Code not found' });
    }

    // Create new code with same data
    const newCode = await Code.create({
      userId: req.user.id,
      name: `${original.name} (Copy)`,
      type: original.type,
      data: original.data,
      imageUrl: original.imageUrl, // Reuse same image
      publicId: original.publicId,
      colorDepth: original.colorDepth,
      isDynamic: original.isDynamic,
      expiresAt: original.expiresAt,
      metadata: original.metadata,
    });

    res.status(201).json(newCode);
  } catch (error) {
    next(error);
  }
};

// @desc    Regenerate dynamic code
// @route   POST /api/codes/:id/regenerate
exports.regenerateCode = async (req, res, next) => {
  try {
    const code = await Code.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!code) {
      return res.status(404).json({ message: 'Code not found' });
    }

    if (!code.isDynamic) {
      return res.status(400).json({ message: 'Code is not dynamic' });
    }

    // Regenerate with new timestamp
    const { imageBuffer, metadata } = await generateHybridCode({
      data: code.data.content,
      mode: code.type,
      colorDepth: code.colorDepth,
      dynamic: true,
      expiresIn: code.metadata?.encodingParams?.refreshInterval,
    });

    // Upload new image
    const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
    const uploadResult = await uploadImage(base64Image, {
      public_id: code.publicId,
      overwrite: true,
    });

    code.imageUrl = uploadResult.secure_url;
    code.metadata.encodingParams = metadata;
    await code.save();

    res.json(code);
  } catch (error) {
    next(error);
  }
};
