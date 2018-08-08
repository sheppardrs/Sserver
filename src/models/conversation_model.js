import mongoose, { Schema } from 'mongoose';

// verfication process is from https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb

// create a MessageSchema with a title field
const ConversationSchema = new Schema({
  participantIDs: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [String],
  title: String, // could become reference to post or post title
  createdAt: {
    type: Date, required: true, default: Date.now,
  },
});


// create a UserModel class from Schema
const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
