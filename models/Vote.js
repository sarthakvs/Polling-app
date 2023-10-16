const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  pollId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Poll',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  option: {
    type: String,
    required: true,
  },
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
