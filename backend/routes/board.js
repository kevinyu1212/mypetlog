const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const optionalAuth = require('../middleware/optionalAuth');
const upload = require('../middleware/upload');

const { getCategories } = require('../controllers/categoriesController');
const {
  getPosts,
  createPost,
  getPostById,
  updatePost,
  deletePost,
} = require('../controllers/postsController');
const {
  listComments,
  createComment,
  updateComment,
  deleteComment,
} = require('../controllers/commentsController');
const { likePost, unlikePost } = require('../controllers/likesController');
const { getHashtags } = require('../controllers/hashtagsController');

// 1) Categories
router.get('/categories', getCategories);

const handleUpload = (req, res, next) => {
  upload.array('images', 10)(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// 2) Posts (list/create/detail/update/delete)
router.get('/posts', getPosts);
router.post('/posts', auth, handleUpload, createPost);
router.get('/posts/:postId', optionalAuth, getPostById);
router.patch('/posts/:postId', auth, handleUpload, updatePost);
router.delete('/posts/:postId', auth, deletePost);

// 3) Comments (CRUD)
router.get('/posts/:postId/comments', listComments);
router.post('/posts/:postId/comments', auth, createComment);
router.patch('/posts/:postId/comments/:commentId', auth, updateComment);
router.delete('/posts/:postId/comments/:commentId', auth, deleteComment);

// 4) Likes
router.post('/posts/:postId/like', auth, likePost);
router.delete('/posts/:postId/like', auth, unlikePost);

// 5) Hashtags
router.get('/hashtags', getHashtags);

module.exports = router;


