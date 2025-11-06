// routes/contactRoutes.js
const express = require('express');
const router = express.Router();
const Contact = require('../models/ContactModel');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Create contact message
    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    });

    await contact.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon!',
      data: contact
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting message',
      error: error.message 
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private/Admin
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, page, limit } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status;

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip);

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      count: contacts.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: contacts
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contact messages',
      error: error.message 
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message (admin only)
// @access  Private/Admin
router.get('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    // Mark as read if status is 'new'
    if (contact.status === 'new') {
      contact.status = 'read';
      await contact.save();
    }

    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contact message',
      error: error.message 
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status/notes (admin only)
// @access  Private/Admin
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    // Update fields
    if (status) {
      contact.status = status;
      if (status === 'replied') {
        contact.repliedAt = new Date();
      }
    }
    if (adminNotes !== undefined) {
      contact.adminNotes = adminNotes;
    }

    await contact.save();

    res.json({
      success: true,
      message: 'Contact message updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating contact message',
      error: error.message 
    });
  }
});

// @route   DELETE /api/contact/:id
// @desc    Delete contact message (admin only)
// @access  Private/Admin
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
      return res.status(404).json({ 
        success: false, 
        message: 'Contact message not found' 
      });
    }

    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting contact message',
      error: error.message 
    });
  }
});

// @route   GET /api/contact/stats/summary
// @desc    Get contact statistics (admin only)
// @access  Private/Admin
router.get('/stats/summary', authenticateToken, isAdmin, async (req, res) => {
  try {
    const totalMessages = await Contact.countDocuments();
    const newMessages = await Contact.countDocuments({ status: 'new' });
    const readMessages = await Contact.countDocuments({ status: 'read' });
    const repliedMessages = await Contact.countDocuments({ status: 'replied' });
    const archivedMessages = await Contact.countDocuments({ status: 'archived' });

    res.json({
      success: true,
      data: {
        total: totalMessages,
        new: newMessages,
        read: readMessages,
        replied: repliedMessages,
        archived: archivedMessages
      }
    });
  } catch (error) {
    console.error('Get contact stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching contact statistics',
      error: error.message 
    });
  }
});

module.exports = router;