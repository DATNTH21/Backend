const getOwnerAndRepo = (url) => {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
        return { owner: match[1], repo: match[2] };
    }
    throw new Error('Invalid GitHub repository URL');
};

module.exports = { getOwnerAndRepo };
