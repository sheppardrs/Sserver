import mongoose, { Schema } from 'mongoose';

// create a PostSchema with a title field
const PostSchema = new Schema({
  title: String,
  tags: String,
  cover_url: String,
  content: String,
  location: { type: String, default: 'No Location' },
  request: { type: Boolean, default: 0 },
  likes: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: 'User' },
});

PostSchema.virtual('id').get(function makeid() {
  return this._id;
});

PostSchema.set('toJSON', {
  virtuals: true,
});

PostSchema.index({
  title: 'text',
  content: 'text',
  location: 'text',
  author: 'text',
});

// create a PostModel class from Schema
const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
