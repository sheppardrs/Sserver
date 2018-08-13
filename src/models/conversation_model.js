import mongoose, { Schema } from 'mongoose';

// create a MessageSchema with a title field
const ConversationSchema = new Schema({
  participantIDs: { type: Schema.Types.ObjectId, ref: 'User' },
  participants: [String], // array of usernames
  unseen: String, // username of the person who has not read
  title: String, // could become reference to post or post title
  createdAt: {
    type: Date, required: true, default: Date.now,
  },
});


// create a UserModel class from Schema
const Conversation = mongoose.model('Conversation', ConversationSchema);

export default Conversation;
