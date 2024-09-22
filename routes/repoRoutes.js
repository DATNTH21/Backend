const express = require('express');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const { saveRepoTreeToFile, fetchDirectoryTreeFull, fetchDirectoryTree } = require('../utils/repoUtils'); // import fetchDirectoryTree
const { getOwnerAndRepo } = require('../utils/urlUtils');
const { generateResponse } = require('../utils/generateResponse'); 

const router = express.Router();

// Display the user's repositories
router.get("/list", async (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");

  try {
    const response = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${req.user.accessToken}`,
      },
    });
    const repos = await response.json();

    let repoList = `<h1>Select a GitHub Repository</h1><form action="/repo/select" method="POST">
                        <label for="repos">Choose a repository:</label>
                        <select id="repos" name="selectedRepo">
                        <option value="" disabled selected>Select your repository</option>`;
    repos.forEach((repo) => {
      repoList += `<option value="${repo.html_url}">${repo.name}</option>`;
    });
    repoList += `</select><button type="submit">Submit</button></form>`;
    res.send(repoList);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.redirect("/");
  }
});



// Handle repo selection 
router.post('/select', async (req, res) => {
    const selectedRepo = req.body.selectedRepo;
    const { owner, repo } = getOwnerAndRepo(selectedRepo);

    try {
        const DirectoryTreeFull = await fetchDirectoryTreeFull(owner, repo, '', req.user.accessToken); // Use the server-side utility
        await saveRepoTreeToFile(DirectoryTreeFull, repo);
        const directoryTree = await fetchDirectoryTree(owner, repo, '', req.user.accessToken);
        const query = `The order for creating unit tests in this directory tree: ${JSON.stringify(DirectoryTreeFull)} without explain.`;
        const generatedResponse = await generateResponse(query);

        const treeHtml = `
                            <h1>Repository Tree for ${repo}</h1>
                            <div id="tree-container"></div>
                            <button id="back-button" style="display:none;">Back to Parent Folder</button>
                            <div class="container">
                                <pre id="file-content" class="file-content"></pre>
                                <pre id="test-cases" class="test-cases"></pre>
                            </div>
                            <button id="generate-button" style="display:none;">Generate Test Case</button>
                            <p><a href="/">Go back</a></p>
                            <h1>Generated Test Case Order</h1>
                            <pre>${generatedResponse}</pre>
                            <style>
                                .folder { cursor: pointer; color: green; text-decoration: underline; }
                                .file { cursor: pointer; color: blue; text-decoration: underline; }
                                .folder:hover, .file:hover { color: darkblue; }
                                .container {
                                    display: flex;
                                    justify-content: space-between;
                                    gap: 20px;
                                }
                                .file-content {
                                    width: 45%;
                                    padding: 10px;
                                    background-color: #f9f9f9;
                                    border: 1px solid #ddd;
                                }
                                .test-cases {
                                    width: 45%;
                                    padding: 10px;
                                    background-color: #f9f9f9;
                                    border: 1px solid #ddd;
                                }
                            </style>
                            '



                            <script src="utils/generateResponse.js" defer></script>
                            <script defer>
                                function createTestCase(query) {
                                    return generateResponse(query);
                                }

                                const owner = '${owner}';
                                const repo = '${repo}';
                                const accessToken = '${req.user.accessToken}';
                                const tree = ${JSON.stringify(directoryTree)}; // Server-side tree data sent to the client
                                const treeContainer = document.getElementById('tree-container');
                                const backButton = document.getElementById('back-button');
                                const genButton = document.getElementById('generate-button');
                                const fileContent = document.getElementById('file-content');
                                const testCaseContent = document.getElementById('test-cases');

                                let currentPath = '';

                                function renderTree(tree, container) {
                                    container.innerHTML = ''; // Clear container
                                    tree.forEach(item => {
                                        const itemElement = document.createElement('div');
                                        itemElement.innerText = item.path;
                                        itemElement.className = item.type === 'dir' ? 'folder' : 'file';

                                        if (item.type === 'dir') {
                                            itemElement.onclick = async () => {
                                                currentPath = item.path; // Update current path
                                                const subTree = await fetchDirectoryTree(owner, repo, item.path);
                                                renderTree(subTree, container); // Render sub-directory
                                                backButton.style.display = 'block'; // Show back button
                                                genButton.style.display = 'none'; // Hide Generate button
                                                fileContent.style.display = 'none';
                                                testCaseContent.style.display = 'none';
                                            };
                                        } else {
                                            itemElement.onclick = async () => {
                                                fileContent.style.display = 'block';
                                                testCaseContent.style.display = 'block';
                                                const content = await fetchFileContent(item.path);
                                                fileContent.innerText = content; // Show file content
                                                backButton.style.display = 'block';
                                                res.redirect('/file/gen');
                                            };
                                        }

                                        container.appendChild(itemElement);
                                    });
                                }

                                async function fetchDirectoryTree(owner, repo, path) {
                                    const response = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path, {
                                        headers: { 'Authorization': 'token ' + accessToken }
                                    });
                                    return await response.json();
                                }

                                async function fetchFileContent(filePath) {
                                    const response = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + filePath, {
                                        headers: { 'Authorization': 'token ' + accessToken }
                                    });
                                    const fileData = await response.json();
                                    if (fileData.content) {
                                        return atob(fileData.content); // Return decoded content
                                    } else {
                                        return 'File not found or empty.';
                                    }
                                }
                                
                                backButton.onclick = async () => {
                                    const parentPath = currentPath.split('/').slice(0, -1).join('/');
                                    const parentTree = await fetchDirectoryTree(owner, repo, parentPath);
                                    renderTree(parentTree, treeContainer);
                                    currentPath = parentPath; // Update current path
                                    backButton.style.display = currentPath ? 'block' : 'none'; // Show/hide back button
                                    fileContent.style.display = 'none';
                                    testCaseContent.style.display = 'none';
                                    genButton.style.display = 'none'; // Hide Generate button
                                };

                                renderTree(tree, treeContainer);
                            </script>
                        `;

        res.send(`<div>${treeHtml}</div>`);

    } catch (error) {
        console.error('Error fetching repository contents:', error);
        res.send(`<h1>Error fetching repository contents: ${error.message}</h1>`);
    }
});

module.exports.repoRoutes = router;
