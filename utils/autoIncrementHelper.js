const Counter = require("../models/counterModel");

async function getNextSequence(name, prefix, session) {
  try {
    const counter = await Counter.findByIdAndUpdate(
      name,
      { $inc: { seq: 1 } },
      {
        new: true,
        upsert: true,
        session,
      }
    );
    return `${prefix}-${counter.seq}`;
  } catch (error) {
    console.error(`Error generating sequence for ${name}:`, error);
    throw error;
  }
}

module.exports = getNextSequence;
