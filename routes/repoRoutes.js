const express = require('express');
const router = express.Router();
const repoController = require('../controller/repoController');

// Route to list repositories
router.get('/list', repoController.listRepositories);

// Route to handle repository selection and fetch directory tree
router.post('/select', repoController.selectRepository);

module.exports.repoRoutes = router;
