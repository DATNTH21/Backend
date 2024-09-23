const express = require('express');
const router = express.Router();
const genController = require('../controller/genController');

// Route to list repositories
router.get('/file', genController.listRepositories);

// Route to handle repository selection and fetch directory tree
router.post('/file/tech', genController.selectRepository);

module.exports.genRoutes = router;