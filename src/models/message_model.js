import mongoose, { Schema } from 'mongoose';

// create a MessageSchema with a title field
const MessageSchema = new Schema({
  // from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  // to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  from: String,
  // to: String,
  to: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  content: { type: String, default: '' },
  createdAt: {
    type: Date, required: true, default: Date.now,
  },
});


// create a UserModel class from Schema
const Message = mongoose.model('Message', MessageSchema);

export default Message;
