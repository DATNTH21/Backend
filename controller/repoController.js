const fetch = (...args) => import('node-fetch').then(module => module.default(...args));
const { getOwnerAndRepo } = require('../utils/githubHelper');

// Controller to fetch and display user's repositories
exports.listRepositories = async (req, res) => {
    if (!req.isAuthenticated()) return res.redirect('/');
    
    try {
        const response = await fetch('https://api.github.com/user/repos', {
            headers: { 'Authorization': `token ${req.user.accessToken}` }
          });
          const repos = await response.json();
          res.render('repoList.ejs', { repos });
          
    } catch (error) {
        console.error('Error fetching repositories:', error);
        res.redirect('/');
    }
};

// Controller to fetch and display the directory tree of the selected repository
exports.selectRepository = async (req, res) => {
    const selectedRepo = req.body.selectedRepo;
    const { owner, repo } = getOwnerAndRepo(selectedRepo);

    if (!owner || !repo) {
        return res.status(400).send('Invalid repository URL');
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents`, {
            headers: { 'Authorization': `token ${req.user.accessToken}` }
        });
        const directoryTree = await response.json();
        res.render('repoTree.ejs', {
            owner: owner,
            repo: repo,
            req: req,
            directoryTree: directoryTree, // Đảm bảo gửi dưới dạng chuỗi JSON
        });        
    } catch (error) {
        console.error('Error fetching repository contents:', error);
        res.redirect('/repos/list');
    }
};
