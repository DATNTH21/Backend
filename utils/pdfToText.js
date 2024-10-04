const fs = require("fs");
const pdf = require("pdf-parse");

module.exports = async (source, dest) => {
  const dataBuffer = fs.readFileSync(source);

  const data = await pdf(dataBuffer);
  fs.writeFileSync(dest, data.text);
};
