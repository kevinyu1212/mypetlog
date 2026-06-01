const dotenv = require('dotenv');
dotenv.config();

const cloudinary = require('cloudinary').v2;

const hasUrl = !!process.env.CLOUDINARY_URL;
const hasKeys = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const isConfigured = hasUrl || hasKeys;

if (hasKeys && !hasUrl) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}
// CLOUDINARY_URL 이 있으면 SDK가 자동으로 설정함

module.exports = { cloudinary, isConfigured };
