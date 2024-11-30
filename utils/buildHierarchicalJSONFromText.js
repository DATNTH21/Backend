const fs = require("fs");
const path = require("path");

// Function to detect headings and subheadings
function detectHeading(line) {
  const headingPattern = /^(\d+(\.\d+)+)[.)]?\s+(.*)/; // Match headings like "4.5.6 Post condition"
  const match = line.match(headingPattern);

  if (match) {
    return {
      level: match[1].split(".").length, // Calculate heading level by counting the dots
      heading: match[1].trim(), // The section number (e.g., "4.5.6")
      text: match[3].trim(), // The heading text (e.g., "Post condition")
    };
  }
  return null;
}

// Parse the document into structured JSON
function parseDocument(documentLines) {
  const structure = [];
  const stack = [];

  documentLines.forEach((line) => {
    const heading = detectHeading(line);

    if (heading) {
      const newNode = {
        heading: heading.text,
        content: [],
      };

      // Remove nodes from the stack until we find the correct level for this heading
      while (
        stack.length > 0 &&
        stack[stack.length - 1].level >= heading.level
      ) {
        stack.pop();
      }

      // If there's a node on the stack, this is a subheading of that node
      if (stack.length > 0) {
        const parent = stack[stack.length - 1].node;
        parent.content.push(newNode);
      } else {
        structure.push(newNode);
      }

      // Push the current node onto the stack
      stack.push({ level: heading.level, node: newNode });
    } else {
      // If it's not a heading or step, add it as normal content
      if (stack.length > 0 && line.trim()) {
        const parent = stack[stack.length - 1].node;
        parent.content.push(line.trim());
      }
    }
  });

  return structure;
}

module.exports = (sourcePath) => {
  const dataBuffer = fs.readFileSync(sourcePath, "utf8");

  const documentLines = dataBuffer.split("\n");
  const parsedStructure = parseDocument(documentLines);
  return parsedStructure;
};
