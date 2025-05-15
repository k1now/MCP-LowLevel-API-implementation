const express = require('express');
const router = express.Router();

router.post('/calculator', (req, res) => {
  const { expression } = req.body;
  try {
    const result = eval(expression);  // In real life, replace this with a safe parser!
    res.json({ result: result.toString() });
  } catch (e) {
    res.status(400).json({ error: 'Invalid expression' });
  }
});

module.exports = router;

  