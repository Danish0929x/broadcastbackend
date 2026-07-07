const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tempes-bgg';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Schema
const formSchema = new mongoose.Schema({
  type: String, // 'access_request' or 'contact_form'
  name: String,
  email: String,
  phone: String,
  country: String,
  subject: String,
  createdAt: { type: Date, default: Date.now }
});

const Form = mongoose.model('Form', formSchema);

// Routes

// Admin password check
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const ADMIN_PASSWORD = 'admin123'; // Change this to your password

  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Login successful' });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// Get all submissions
app.get('/api/submissions', async (req, res) => {
  try {
    const submissions = await Form.find().sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get submissions by type
app.get('/api/submissions/:type', async (req, res) => {
  try {
    const submissions = await Form.find({ type: req.params.type }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Form.countDocuments();
    const accessRequests = await Form.countDocuments({ type: 'access_request' });
    const contactForms = await Form.countDocuments({ type: 'contact_form' });

    res.json({ total, accessRequests, contactForms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit access request
app.post('/api/submit/access', async (req, res) => {
  try {
    const { name, email, phone, country } = req.body;

    if (!name || !email || !phone || !country) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const submission = new Form({
      type: 'access_request',
      name,
      email,
      phone,
      country
    });

    await submission.save();
    res.json({ success: true, message: 'Access request submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit contact form
app.post('/api/submit/contact', async (req, res) => {
  try {
    const { name, email, subject } = req.body;

    if (!name || !email || !subject) {
      return res.status(400).json({ error: 'All fields required' });
    }

    const submission = new Form({
      type: 'contact_form',
      name,
      email,
      subject
    });

    await submission.save();
    res.json({ success: true, message: 'Contact form submitted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete submission
app.delete('/api/submissions/:id', async (req, res) => {
  try {
    await Form.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Export data as JSON
app.get('/api/export', async (req, res) => {
  try {
    const submissions = await Form.find();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.json"');
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
