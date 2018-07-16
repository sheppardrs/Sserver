import mongoose, { Schema } from 'mongoose';

// create a PostSchema with a title field
const PostSchema = new Schema({
  title: String,
  tags: String,
  cover_url: String,
  content: String,
  author: { type: Schema.Types.ObjectId, ref: 'User' },
});

PostSchema.virtual('id').get(function makeid() {
  return this._id;
});

PostSchema.set('toJSON', {
  virtuals: true,
});
// create a PostModel class from Schema
const PostModel = mongoose.model('Post', PostSchema);

export default PostModel;
