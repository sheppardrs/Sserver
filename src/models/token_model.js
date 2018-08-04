import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_REPS = 10;

// verfication process is from https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb

// create a PostSchema with a title field
const EmailVerifyTokenSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true },
  isPassword: { type: Boolean, default: false },
  createdAt: {
    type: Date, required: true, default: Date.now, expires: 43200,
  },
});


EmailVerifyTokenSchema.methods.compareToken = function compareToken(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};
// create a UserModel class from Schema
const EmailVerify = mongoose.model('Token', EmailVerifyTokenSchema);

export default EmailVerify;
