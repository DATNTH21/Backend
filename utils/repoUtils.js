const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));


// Fetch directory tree recursively
const fetchDirectoryTreeFull = async (owner, repo, dirPath = '', accessToken) => {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${dirPath}`;
    const response = await fetch(apiUrl, {
        headers: {
            'Authorization': `token ${accessToken}`
        }
    });
    const contents = await response.json();
    
    if (!Array.isArray(contents)) throw new Error(contents.message);

    const tree = await Promise.all(contents.map(async item => {
        if (item.type === 'dir') {
            return {
                name: item.name,
                type: 'directory',
                path: item.path,
                contents: await fetchDirectoryTreeFull(owner, repo, item.path, accessToken)
            };
        } else {
            return { name: item.name, type: 'file', path: item.path };
        }
    }));
    
    return tree;
};

async function fetchDirectoryTree(owner, repo, path = '', accessToken) {
    const response = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path, {
        headers: { 'Authorization': 'token ' + accessToken }
    });
    const jsonResponse = await response.json();
    return jsonResponse;
}

// Save folder tree to a JSON file
const saveRepoTreeToFile = (tree, repoName) => {
    const dirPath = path.join(__dirname, '../repository_trees');
    const filePath = path.join(dirPath, `${repoName}_folder_tree.json`);

    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    fs.writeFileSync(filePath, JSON.stringify(tree, null, 2));
};

module.exports = { fetchDirectoryTreeFull, fetchDirectoryTree, saveRepoTreeToFile };
