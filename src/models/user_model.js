import mongoose, { Schema } from 'mongoose';

// create a PostSchema with a title field
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
});

UserSchema.set('toJSON', {
  virtuals: true,
});
// create a PostModel class from Schema
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
