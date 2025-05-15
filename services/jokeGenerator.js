const express = require('express');
const router = express.Router();

router.post('/joke', (req, res) => {
  const jokes = [
    "Why did the AI get kicked out of school? Too many neural detentions.",
    "I told my AI it was a joke — it retrained itself.",
    "How does an AI apologize? It backpropagates its regret."
  ];
  const joke = jokes[Math.floor(Math.random() * jokes.length)];
  res.json({ result: joke });
});

module.exports = router;
