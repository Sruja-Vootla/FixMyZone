// // routes/issueRoutes.js
// const express = require('express');
// const router = express.Router();
// const Issue = require('../models/IssueModel');
// const User = require('../models/UserModel');
// const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// // @route   GET /api/issues
// // @desc    Get all issues with filtering
// // @access  Public
// router.get('/', optionalAuth, async (req, res) => {
//   try {
//     const { status, category, sortBy, limit, page } = req.query;
    
//     // Build query
//     const query = {};
//     if (status) query.status = status.toLowerCase();
//     if (category) query.category = category.toLowerCase();

//     // Sorting
//     let sortOptions = {};
//     switch (sortBy) {
//       case 'votes':
//         sortOptions = { upvotes: -1, createdAt: -1 };
//         break;
//       case 'oldest':
//         sortOptions = { createdAt: 1 };
//         break;
//       case 'newest':
//       default:
//         sortOptions = { createdAt: -1 };
//     }

//     // Pagination
//     const pageNum = parseInt(page) || 1;
//     const limitNum = parseInt(limit) || 50;
//     const skip = (pageNum - 1) * limitNum;

//     const issues = await Issue.find(query)
//       .sort(sortOptions)
//       .limit(limitNum)
//       .skip(skip)
//       .populate('reporterId', 'name email');

//     const total = await Issue.countDocuments(query);

//     res.json({
//       success: true,
//       count: issues.length,
//       total,
//       page: pageNum,
//       totalPages: Math.ceil(total / limitNum),
//       data: issues
//     });
//   } catch (error) {
//     console.error('Get issues error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching issues',
//       error: error.message 
//     });
//   }
// });

// // @route   GET /api/issues/:id
// // @desc    Get single issue
// // @access  Public
// router.get('/:id', async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.id)
//       .populate('reporterId', 'name email')
//       .populate('comments.userId', 'name');

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     res.json({
//       success: true,
//       data: issue
//     });
//   } catch (error) {
//     console.error('Get issue error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching issue',
//       error: error.message 
//     });
//   }
// });


// router.post('/', authenticateToken, async (req, res) => {
//   try {
//     const { title, description, category, location, coordinates, images, priority } = req.body;

//     // Validation
//     if (!title || !description || !category || !location || !coordinates) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Please provide all required fields' 
//       });
//     }

//     if (!coordinates.lat || !coordinates.lng) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Invalid coordinates' 
//       });
//     }

//     // Debug logs
//     console.log('Creating issue with user:', req.user);
//     console.log('User ID:', req.user._id);

//     // Ensure req.user exists and has _id
//     if (!req.user || !req.user._id) {
//       return res.status(401).json({ 
//         success: false, 
//         message: 'User authentication failed. Please login again.' 
//       });
//     }

//     // Create issue
//     const issue = new Issue({
//       title: title.trim(),
//       description: description.trim(),
//       category: category.toLowerCase(),
//       location: location.trim(),
//       coordinates: {
//         lat: parseFloat(coordinates.lat),
//         lng: parseFloat(coordinates.lng)
//       },
//       images: images || [],
//       priority: priority || 'medium',
//       reporterId: req.user._id, // MongoDB ObjectId from the authenticated user
//       reporterName: req.user.name,
//       reporterEmail: req.user.email,
//       status: 'open',
//       upvotes: 0,
//       upvotedBy: [],
//       comments: []
//     });

//     await issue.save();

//     // Add issue to user's reportedIssues
//     await User.findByIdAndUpdate(
//       req.user._id,
//       { $push: { reportedIssues: issue._id } }
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Issue created successfully',
//       data: issue
//     });
//   } catch (error) {
//     console.error('Create issue error:', error);
//     console.error('Error stack:', error.stack);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error creating issue',
//       error: error.message,
//       // Include validation errors if they exist
//       ...(error.errors && { validationErrors: error.errors })
//     });
//   }
// });




// // @route   PUT /api/issues/:id
// // @desc    Update issue
// // @access  Private (Owner or Admin)
// router.put('/:id', authenticateToken, async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     // Check if user is owner or admin
//     const isOwner = issue.reporterId.toString() === req.user._id.toString();
//     const isAdmin = req.user.role === 'admin';

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Access denied' 
//       });
//     }

//     // Update fields
//     const allowedUpdates = ['title', 'description', 'category', 'location', 'coordinates', 'images', 'priority'];
//     const adminOnlyUpdates = ['status', 'adminNotes'];

//     const updates = {};
    
//     // Regular updates
//     allowedUpdates.forEach(field => {
//       if (req.body[field] !== undefined) {
//         updates[field] = req.body[field];
//       }
//     });

//     // Admin-only updates
//     if (isAdmin) {
//       adminOnlyUpdates.forEach(field => {
//         if (req.body[field] !== undefined) {
//           updates[field] = req.body[field];
//         }
//       });

//       // Set resolved date if status changed to resolved
//       if (req.body.status === 'resolved' && issue.status !== 'resolved') {
//         updates.resolvedDate = new Date();
//       }
//     }

//     const updatedIssue = await Issue.findByIdAndUpdate(
//       req.params.id,
//       updates,
//       { new: true, runValidators: true }
//     );

//     res.json({
//       success: true,
//       message: 'Issue updated successfully',
//       data: updatedIssue
//     });
//   } catch (error) {
//     console.error('Update issue error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error updating issue',
//       error: error.message 
//     });
//   }
// });

// // @route   DELETE /api/issues/:id
// // @desc    Delete issue
// // @access  Private (Owner or Admin)
// router.delete('/:id', authenticateToken, async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     // Check if user is owner or admin
//     const isOwner = issue.reporterId.toString() === req.user._id.toString();
//     const isAdmin = req.user.role === 'admin';

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Access denied' 
//       });
//     }

//     await Issue.findByIdAndDelete(req.params.id);

//     // Remove from user's reportedIssues
//     await User.findByIdAndUpdate(
//       issue.reporterId,
//       { $pull: { reportedIssues: issue._id } }
//     );

//     res.json({
//       success: true,
//       message: 'Issue deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete issue error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error deleting issue',
//       error: error.message 
//     });
//   }
// });

// // @route   POST /api/issues/:id/upvote
// // @desc    Toggle upvote on issue
// // @access  Private
// router.post('/:id/upvote', authenticateToken, async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     const result = issue.toggleUpvote(req.user._id);
//     await issue.save();

//     // Update user's votedIssues
//     if (result.action === 'upvoted') {
//       await User.findByIdAndUpdate(
//         req.user._id,
//         { $addToSet: { votedIssues: issue._id } }
//       );
//     } else {
//       await User.findByIdAndUpdate(
//         req.user._id,
//         { $pull: { votedIssues: issue._id } }
//       );
//     }

//     res.json({
//       success: true,
//       message: result.action === 'upvoted' ? 'Issue upvoted' : 'Upvote removed',
//       data: {
//         action: result.action,
//         upvotes: result.upvotes
//       }
//     });
//   } catch (error) {
//     console.error('Upvote error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error processing upvote',
//       error: error.message 
//     });
//   }
// });

// // @route   POST /api/issues/:id/comments
// // @desc    Add comment to issue
// // @access  Private
// router.post('/:id/comments', authenticateToken, async (req, res) => {
//   try {
//     const { text } = req.body;

//     if (!text || !text.trim()) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Comment text is required' 
//       });
//     }

//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     const comment = issue.addComment(req.user._id, req.user.name, text.trim());
//     await issue.save();

//     res.status(201).json({
//       success: true,
//       message: 'Comment added successfully',
//       data: comment
//     });
//   } catch (error) {
//     console.error('Add comment error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error adding comment',
//       error: error.message 
//     });
//   }
// });

// // @route   DELETE /api/issues/:id/comments/:commentId
// // @desc    Delete comment from issue
// // @access  Private (Owner or Admin)
// router.delete('/:id/comments/:commentId', authenticateToken, async (req, res) => {
//   try {
//     const issue = await Issue.findById(req.params.id);

//     if (!issue) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Issue not found' 
//       });
//     }

//     const comment = issue.comments.id(req.params.commentId);

//     if (!comment) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Comment not found' 
//       });
//     }

//     // Check if user is comment owner or admin
//     const isOwner = comment.userId.toString() === req.user._id.toString();
//     const isAdmin = req.user.role === 'admin';

//     if (!isOwner && !isAdmin) {
//       return res.status(403).json({ 
//         success: false, 
//         message: 'Access denied' 
//       });
//     }

//     comment.remove();
//     await issue.save();

//     res.json({
//       success: true,
//       message: 'Comment deleted successfully'
//     });
//   } catch (error) {
//     console.error('Delete comment error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error deleting comment',
//       error: error.message 
//     });
//   }
// });

// // @route   GET /api/issues/stats/summary
// // @desc    Get issue statistics
// // @access  Public
// router.get('/stats/summary', async (req, res) => {
//   try {
//     const totalIssues = await Issue.countDocuments();
//     const openIssues = await Issue.countDocuments({ status: 'open' });
//     const inProgressIssues = await Issue.countDocuments({ status: 'in progress' });
//     const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

//     const categoryStats = await Issue.aggregate([
//       {
//         $group: {
//           _id: '$category',
//           count: { $sum: 1 }
//         }
//       }
//     ]);

//     res.json({
//       success: true,
//       data: {
//         total: totalIssues,
//         open: openIssues,
//         inProgress: inProgressIssues,
//         resolved: resolvedIssues,
//         byCategory: categoryStats
//       }
//     });
//   } catch (error) {
//     console.error('Get stats error:', error);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Error fetching statistics',
//       error: error.message 
//     });
//   }
// });

// module.exports = router;

// routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const Issue = require('../models/IssueModel');
const User = require('../models/UserModel');
const { authenticateToken, optionalAuth } = require('../middleware/authMiddleware');

// @route   GET /api/issues
// @desc    Get all issues with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { status, category, sortBy, limit, page } = req.query;
    
    // Build query
    const query = {};
    if (status) query.status = status.toLowerCase();
    if (category) query.category = category.toLowerCase();

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'votes':
        sortOptions = { upvotes: -1, createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const issues = await Issue.find(query)
      .sort(sortOptions)
      .limit(limitNum)
      .skip(skip)
      .populate('reporterId', 'name email');

    const total = await Issue.countDocuments(query);

    res.json({
      success: true,
      count: issues.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: issues
    });
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching issues',
      error: error.message 
    });
  }
});

// @route   GET /api/issues/:id
// @desc    Get single issue
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate('reporterId', 'name email')
      .populate('comments.userId', 'name');

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching issue',
      error: error.message 
    });
  }
});


router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, location, coordinates, images, priority } = req.body;

    // Validation
    if (!title || !description || !category || !location || !coordinates) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    if (!coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid coordinates' 
      });
    }

    // Debug logs
    console.log('Creating issue with user:', req.user);
    console.log('User ID:', req.user._id);

    // Ensure req.user exists and has _id
    if (!req.user || !req.user._id) {
      return res.status(401).json({ 
        success: false, 
        message: 'User authentication failed. Please login again.' 
      });
    }

    // Create issue
    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category: category.toLowerCase(),
      location: location.trim(),
      coordinates: {
        lat: parseFloat(coordinates.lat),
        lng: parseFloat(coordinates.lng)
      },
      images: images || [],
      priority: priority || 'medium',
      reporterId: req.user._id, // MongoDB ObjectId from the authenticated user
      reporterName: req.user.name,
      reporterEmail: req.user.email,
      status: 'open',
      upvotes: 0,
      upvotedBy: [],
      comments: []
    });

    await issue.save();

    // Add issue to user's reportedIssues
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { reportedIssues: issue._id } }
    );

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: issue
    });
  } catch (error) {
    console.error('Create issue error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating issue',
      error: error.message,
      // Include validation errors if they exist
      ...(error.errors && { validationErrors: error.errors })
    });
  }
});




// @route   PUT /api/issues/:id
// @desc    Update issue
// @access  Private (Owner or Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    // Check if user is owner or admin
    const isOwner = issue.reporterId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Update fields
    const allowedUpdates = ['title', 'description', 'category', 'location', 'coordinates', 'images', 'priority'];
    const adminOnlyUpdates = ['status', 'adminNotes'];

    const updates = {};
    
    // Regular updates
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Admin-only updates
    if (isAdmin) {
      adminOnlyUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      // Set resolved date if status changed to resolved
      if (req.body.status === 'resolved' && issue.status !== 'resolved') {
        updates.resolvedDate = new Date();
      }
    }

    const updatedIssue = await Issue.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Update issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating issue',
      error: error.message 
    });
  }
});

// @route   DELETE /api/issues/:id
// @desc    Delete issue
// @access  Private (Owner or Admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    // Check if user is owner or admin
    const isOwner = issue.reporterId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    await Issue.findByIdAndDelete(req.params.id);

    // Remove from user's reportedIssues
    await User.findByIdAndUpdate(
      issue.reporterId,
      { $pull: { reportedIssues: issue._id } }
    );

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Delete issue error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting issue',
      error: error.message 
    });
  }
});

// @route   POST /api/issues/:id/upvote
// @desc    Toggle upvote on issue
// @access  Private
router.post('/:id/upvote', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    const result = issue.toggleUpvote(req.user._id);
    await issue.save();

    // Update user's votedIssues
    if (result.action === 'upvoted') {
      await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: { votedIssues: issue._id } }
      );
    } else {
      await User.findByIdAndUpdate(
        req.user._id,
        { $pull: { votedIssues: issue._id } }
      );
    }

    res.json({
      success: true,
      message: result.action === 'upvoted' ? 'Issue upvoted' : 'Upvote removed',
      data: {
        action: result.action,
        upvotes: result.upvotes
      }
    });
  } catch (error) {
    console.error('Upvote error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing upvote',
      error: error.message 
    });
  }
});

// @route   POST /api/issues/:id/downvote
// @desc    Toggle downvote on issue
// @access  Private
router.post('/:id/downvote', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    const result = issue.toggleDownvote(req.user._id);
    await issue.save();

    res.json({
      success: true,
      message: result.action === 'downvoted' ? 'Issue downvoted' : 'Downvote removed',
      data: {
        action: result.action,
        downvotes: result.downvotes
      }
    });
  } catch (error) {
    console.error('Downvote error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing downvote',
      error: error.message 
    });
  }
});

// @route   POST /api/issues/:id/comments
// @desc    Add comment to issue
// @access  Private
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Comment text is required' 
      });
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    const comment = issue.addComment(req.user._id, req.user.name, text.trim());
    await issue.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: comment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding comment',
      error: error.message 
    });
  }
});

// @route   DELETE /api/issues/:id/comments/:commentId
// @desc    Delete comment from issue
// @access  Private (Owner or Admin)
router.delete('/:id/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ 
        success: false, 
        message: 'Issue not found' 
      });
    }

    const comment = issue.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    // Check if user is comment owner or admin
    const isOwner = comment.userId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    comment.remove();
    await issue.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting comment',
      error: error.message 
    });
  }
});

// @route   GET /api/issues/stats/summary
// @desc    Get issue statistics
// @access  Public
router.get('/stats/summary', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const openIssues = await Issue.countDocuments({ status: 'open' });
    const inProgressIssues = await Issue.countDocuments({ status: 'in progress' });
    const resolvedIssues = await Issue.countDocuments({ status: 'resolved' });

    const categoryStats = await Issue.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalIssues,
        open: openIssues,
        inProgress: inProgressIssues,
        resolved: resolvedIssues,
        byCategory: categoryStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics',
      error: error.message 
    });
  }
});

module.exports = router;