const cloudinary = require('../config/cloudinaryConfig');
const { AppError } = require('./errorHandler');

const uploadFile = async (file, folder) => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder
    });
    return result.secure_url;
  } catch (error) {
    throw new AppError('File upload failed', 500);
  }
};

const deleteFile = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new AppError('File deletion failed', 500);
  }
};

module.exports = { uploadFile, deleteFile };
