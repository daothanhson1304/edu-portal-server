import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    thumbnailUrl: {
      type: String,
      default: '',
    },
    content: {
      type: String, // HTML string from Tiptap
      required: true,
    },
    type: {
      type: String,
      enum: ['news', 'event', 'notice', 'other'],
      default: 'news',
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
    },
    views: {
      type: Number,
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);

export default Post;
