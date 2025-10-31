// // models/IssueModel.js
// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   userName: {
//     type: String,
//     required: true
//   },
//   text: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: [500, 'Comment cannot exceed 500 characters']
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// const issueSchema = new mongoose.Schema({
//   title: {
//     type: String,
//     required: [true, 'Title is required'],
//     trim: true,
//     minlength: [5, 'Title must be at least 5 characters'],
//     maxlength: [100, 'Title cannot exceed 100 characters']
//   },
//   description: {
//     type: String,
//     required: [true, 'Description is required'],
//     trim: true,
//     minlength: [10, 'Description must be at least 10 characters'],
//     maxlength: [1000, 'Description cannot exceed 1000 characters']
//   },
//   category: {
//     type: String,
//     required: [true, 'Category is required'],
//     enum: ['lighting', 'road', 'waste', 'water', 'traffic', 'safety', 'other'],
//     lowercase: true
//   },
//   location: {
//     type: String,
//     required: [true, 'Location is required'],
//     trim: true
//   },
//   coordinates: {
//     lat: {
//       type: Number,
//       required: true
//     },
//     lng: {
//       type: Number,
//       required: true
//     }
//   },
//   status: {
//     type: String,
//     enum: ['open', 'in progress', 'resolved'],
//     default: 'open',
//     lowercase: true
//   },
//   priority: {
//     type: String,
//     enum: ['low', 'medium', 'high'],
//     default: 'medium',
//     lowercase: true
//   },
//   images: [{
//     type: String,
//     // REMOVED VALIDATOR - accepts any string including blob URLs
//     // If you want validation, use this instead:
//     // validate: {
//     //   validator: function(v) {
//     //     return /^(https?:\/\/|blob:)/.test(v);
//     //   },
//     //   message: 'Invalid image URL'
//     // }
//   }],
//   reporterId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   reporterName: {
//     type: String,
//     required: true
//   },
//   reporterEmail: {
//     type: String,
//     required: true
//   },
//   upvotes: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   upvotedBy: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   downvotes: {
//     type: Number,
//     default: 0,
//     min: 0
//   },
//   downvotedBy: [{
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   }],
//   comments: [commentSchema],
//   reportedDate: {
//     type: Date,
//     default: Date.now
//   },
//   resolvedDate: {
//     type: Date
//   },
//   adminNotes: {
//     type: String,
//     maxlength: [500, 'Admin notes cannot exceed 500 characters']
//   }
// }, {
//   timestamps: true
// });

// // Index for geospatial queries
// issueSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// // Index for common queries
// issueSchema.index({ status: 1, createdAt: -1 });
// issueSchema.index({ reporterId: 1, createdAt: -1 });
// issueSchema.index({ category: 1 });

// // Virtual for age of issue
// issueSchema.virtual('ageInDays').get(function() {
//   const now = new Date();
//   const reported = this.reportedDate || this.createdAt;
//   const diffTime = Math.abs(now - reported);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   return diffDays;
// });

// // Method to toggle upvote
// issueSchema.methods.toggleUpvote = function(userId) {
//   const index = this.upvotedBy.indexOf(userId);
  
//   if (index === -1) {
//     // User hasn't upvoted, add upvote
//     this.upvotedBy.push(userId);
//     this.upvotes += 1;
//     return { action: 'upvoted', upvotes: this.upvotes };
//   } else {
//     // User has upvoted, remove upvote
//     this.upvotedBy.splice(index, 1);
//     this.upvotes = Math.max(0, this.upvotes - 1);
//     return { action: 'removed', upvotes: this.upvotes };
//   }
// };

// // Method to toggle downvote
// issueSchema.methods.toggleDownvote = function(userId) {
//   const index = this.downvotedBy.indexOf(userId);
  
//   if (index === -1) {
//     // User hasn't downvoted, add downvote
//     this.downvotedBy.push(userId);
//     this.downvotes += 1;
//     return { action: 'downvoted', downvotes: this.downvotes };
//   } else {
//     // User has downvoted, remove downvote
//     this.downvotedBy.splice(index, 1);
//     this.downvotes = Math.max(0, this.downvotes - 1);
//     return { action: 'removed', downvotes: this.downvotes };
//   }
// };

// // Method to add comment
// issueSchema.methods.addComment = function(userId, userName, text) {
//   this.comments.push({ userId, userName, text });
//   return this.comments[this.comments.length - 1];
// };

// module.exports = mongoose.model('Issue', issueSchema);


// models/IssueModel.js
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const issueSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['lighting', 'road', 'waste', 'water', 'traffic', 'safety', 'other'],
    lowercase: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['open', 'in progress', 'resolved'],
    default: 'open',
    lowercase: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
    lowercase: true
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\//.test(v);
      },
      message: 'Invalid image URL'
    }
    // REMOVED VALIDATOR - accepts any string including blob URLs
    // If you want validation, use this instead:
    // validate: {
    //   validator: function(v) {
    //     return /^(https?:\/\/|blob:)/.test(v);
    //   },
    //   message: 'Invalid image URL'
    // }
  }],
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  reporterEmail: {
    type: String,
    required: true
  },
  upvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: {
    type: Number,
    default: 0,
    min: 0
  },
  downvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  reportedDate: {
    type: Date,
    default: Date.now
  },
  resolvedDate: {
    type: Date
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

// Index for geospatial queries
issueSchema.index({ 'coordinates.lat': 1, 'coordinates.lng': 1 });

// Index for common queries
issueSchema.index({ status: 1, createdAt: -1 });
issueSchema.index({ reporterId: 1, createdAt: -1 });
issueSchema.index({ category: 1 });

// Virtual for age of issue
issueSchema.virtual('ageInDays').get(function() {
  const now = new Date();
  const reported = this.reportedDate || this.createdAt;
  const diffTime = Math.abs(now - reported);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to toggle upvote
issueSchema.methods.toggleUpvote = function(userId) {
  const upvoteIndex = this.upvotedBy.indexOf(userId);
  const downvoteIndex = this.downvotedBy.indexOf(userId);
  
  // Remove downvote if user has downvoted
  if (downvoteIndex !== -1) {
    this.downvotedBy.splice(downvoteIndex, 1);
    this.downvotes = Math.max(0, this.downvotes - 1);
  }
  
  if (upvoteIndex === -1) {
    // User hasn't upvoted, add upvote
    this.upvotedBy.push(userId);
    this.upvotes += 1;
    return { action: 'upvoted', upvotes: this.upvotes };
  } else {
    // User has upvoted, remove upvote
    this.upvotedBy.splice(upvoteIndex, 1);
    this.upvotes = Math.max(0, this.upvotes - 1);
    return { action: 'removed', upvotes: this.upvotes };
  }
};

// Method to toggle downvote
issueSchema.methods.toggleDownvote = function(userId) {
  const downvoteIndex = this.downvotedBy.indexOf(userId);
  const upvoteIndex = this.upvotedBy.indexOf(userId);
  
  // Remove upvote if user has upvoted
  if (upvoteIndex !== -1) {
    this.upvotedBy.splice(upvoteIndex, 1);
    this.upvotes = Math.max(0, this.upvotes - 1);
  }
  
  if (downvoteIndex === -1) {
    // User hasn't downvoted, add downvote
    this.downvotedBy.push(userId);
    this.downvotes += 1;
    return { action: 'downvoted', downvotes: this.downvotes };
  } else {
    // User has downvoted, remove downvote
    this.downvotedBy.splice(downvoteIndex, 1);
    this.downvotes = Math.max(0, this.downvotes - 1);
    return { action: 'removed', downvotes: this.downvotes };
  }
};

// Method to add comment
issueSchema.methods.addComment = function(userId, userName, text) {
  this.comments.push({ userId, userName, text });
  return this.comments[this.comments.length - 1];
};

module.exports = mongoose.model('Issue', issueSchema);