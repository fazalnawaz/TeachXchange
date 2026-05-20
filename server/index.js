const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parsing for incoming requests
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
  res.json({ message: "Hello from the Node.js backend!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
