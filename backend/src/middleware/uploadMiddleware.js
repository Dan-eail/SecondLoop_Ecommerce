const multer = require('multer');
const path = require('path');
const fs = require('fs');

const isCloudinaryConfigured = () =>
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

const ensureDir = (dirPath) => {
  try {
    fs.mkdirSync(dirPath, { recursive: true });
  } catch (_) {
    // ignore
  }
};

const createStorage = () => {
  if (isCloudinaryConfigured()) return multer.memoryStorage();

  const dest = path.join(process.cwd(), 'uploads', 'products');
  ensureDir(dest);
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
      const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
    },
  });
};
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) cb(null, true);
  else cb(new Error('Only images are allowed (jpeg, jpg, png, webp)'), false);
};
const upload = multer({ storage: createStorage(), limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });
const uploadMultiple = (fieldName, maxCount) => upload.array(fieldName, maxCount);
module.exports = { upload, uploadMultiple };
