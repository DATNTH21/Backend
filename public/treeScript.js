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
                const subTree = await fetchDirectoryTree(owner, repo, item.path); // Fetch sub-directory contents
                renderTree(subTree, container); // Recursively render the sub-directory
                backButton.style.display = 'block'; // Show the back button for navigation
                genButton.style.display = 'none'; // Hide the Generate button initially
                fileContent.style.display = 'none'; // Hide file content area
                testCaseContent.style.display = 'none'; // Hide test case content
            };
        } else {
            itemElement.onclick = async () => {
                fileContent.style.display = 'block'; // Display file content area
                testCaseContent.style.display = 'block'; // Display test case area
                const content = await fetchFileContent(item.path); // Fetch file content
                fileContent.innerText = content; // Display fetched file content

                backButton.style.display = 'block'; // Ensure back button remains visible
                genButton.style.display = 'block'; // Show Generate button for test case generation
                genButton.onclick = async () => {
                    const testQuery = `Generate unit tests for the following code: ${content}`; // Prepare query
                    const generatedTestCase = await generateResponse(testQuery); // Fetch AI-generated test cases
                    testCaseContent.innerText = generatedTestCase; // Display generated test cases
                };
            };
        }

        container.appendChild(itemElement); // Append each item (file or folder) to the container
    });
}


async function fetchDirectoryTree(owner, repo, path = '', accessToken) {
    const response = await fetch('https://api.github.com/repos/' + owner + '/' + repo + '/contents/' + path, {
        headers: { 'Authorization': 'token ' + accessToken }
    });
    const jsonResponse = await response.json();
    return jsonResponse;
}


const fetchFileContent = async (filePath) => {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`, {
        headers: { 'Authorization': `token ${accessToken}` }
    });
    const fileData = await response.json();
    if (fileData.content) {
        const content = atob(fileData.content); // Giải mã base64
        document.getElementById('file-content').innerText = content;

        // Gọi hàm để tạo unit test cho file
        const testQuery = 'Generate unit tests for the following code: ' + content;
        const generatedTestCase = await generateResponse(testQuery);
        document.getElementById('test-case-content').innerText = generatedTestCase;
    } else {
        document.getElementById('file-content').innerText = 'File not found or empty.';
    }
};

// Hàm quay lại folder cha
backButton.onclick = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    fetchDirectoryTree(owner, repo, parentPath).then(renderTree);
    backButton.style.display = 'none'; // Ẩn nút quay lại
};

// Khởi động cây thư mục
renderTree(tree, treeContainer);
