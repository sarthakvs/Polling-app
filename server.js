const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

mongoose.connect('mongodb://0.0.0.0/polling-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(()=>{console.log("Connected to Mongoose")})
.catch(error=>{console.log("Error connecting to Mongoose")});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


const Poll = require('./models/Poll');

app.get('/', (req, res) => {
  res.redirect('/create.html');
});

app.post('/api/polls', async (req, res) => {
  try {
    const { question, options } = req.body;
    const poll = await Poll.create({ question, options });
    res.status(201).json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Could not create poll.' });
  }
});
const Vote = require('./models/Vote');
const { error } = require('console');

app.post('/api/vote/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const { name, option } = req.body;
    
    const existingVote = await Vote.findOne({ pollId, name });
    if (existingVote) {
      return res.status(400).json({ error: 'You have already voted on this poll.' });
    }
    
    const vote = await Vote.create({ pollId, name, option });
    res.status(201).json(vote);
  } catch (error) {
    res.status(500).json({ error: 'Could not submit vote.' });
  }
});
app.get('/api/polls', async (req, res) => {
    try {
      const polls = await Poll.find();
      const pollsWithVoteCounts = await Promise.all(
        polls.map(async poll => {
          const results = await Vote.aggregate([
            { $match: { pollId: poll._id } },
            { $group: { _id: '$option', count: { $sum: 1 } } },
          ]);
          
          const voteCounts = results.reduce((counts, option) => {
            counts.push(option.count);
            return counts;
          }, []);
          
          const totalVotes = voteCounts.reduce((total, count) => total + count, 0);
          
          return { ...poll.toObject(), voteCounts, totalVotes };
        })
      );
      res.status(200).json(pollsWithVoteCounts);
    } catch (error) {
      res.status(500).json({ error: 'Could not fetch polls.' });
    }
  });
  // Define a new API route for clearing poll statistics
app.put('/api/clear/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;

    // Find the poll by its ID
    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }

    // Clear associated votes for the poll
    await Vote.deleteMany({ pollId });

    res.status(200).json({ message: 'Poll statistics cleared successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Could not clear poll statistics.' });
  }
});

  app.get('/api/polls/:pollId', async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId);
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found.' });
    }
    res.status(200).json(poll);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch poll details.' });
  }
});
// Inside the /api/polls/:pollId route
app.delete('/api/polls/:pollId', async (req, res) => {
    try {
      const { pollId } = req.params;
      const poll = await Poll.findByIdAndDelete(pollId);
      if (!poll) {
        return res.status(404).json({ error: 'Poll not found.' });
      }
      // Delete associated votes for the poll
      await Vote.deleteMany({ pollId });
  
      res.status(200).json({ message: 'Poll deleted successfully.' });
    } catch (error) {
      res.status(500).json({ error: 'Could not delete poll.' });
    }
  });
  
  

