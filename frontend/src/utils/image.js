import { SERVER_URL } from '../api/axios';

export const getImageSrc = (img) => {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return `${SERVER_URL}${img}`;
};
