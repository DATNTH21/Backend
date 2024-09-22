const express = require("express");
const session = require("express-session");
const passport = require("passport");
const bodyParser = require("body-parser");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const {
  saveRepoTreeToFile,
  fetchDirectoryTree,
} = require("../utils/repoUtils");
const { getOwnerAndRepo } = require("../utils/urlUtils");

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

// Handle repo selection and save the folder tree
router.post("/select", async (req, res) => {
  const selectedRepo = req.body.selectedRepo;
  const { owner, repo } = getOwnerAndRepo(selectedRepo);

  try {
    const directoryTree = await fetchDirectoryTree(
      owner,
      repo,
      "",
      req.user.accessToken
    );
    saveRepoTreeToFile(directoryTree, repo);
    res.send(
      `<h1>Repository Tree for ${repo} saved successfully!</h1><p><a href="/">Go back</a></p>`
    );
  } catch (error) {
    console.error("Error fetching repository contents:", error);
    res.send(`<h1>Error fetching repository contents: ${error.message}</h1>`);
  }
});

module.exports = router;
