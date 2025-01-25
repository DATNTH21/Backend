const retries = 10,
  delayMs = 2000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry logic for async functions
module.exports = (fn) => {
  return async (...args) => {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`Attempt ${attempt} failed: ${error.message}`);
        if (attempt < retries) {
          console.log(`Retrying in ${delayMs}ms...`);
          await delay(delayMs);
        } else {
          throw error; // Re-throw the error after exhausting retries
        }
      }
    }
  };
};
