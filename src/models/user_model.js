import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_REPS = 10;

// verfication process is from https://codemoto.io/coding/nodejs/email-verification-node-express-mongodb

// create a PostSchema with a title field
const UserSchema = new Schema({
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  username: { type: String, lowercase: true },
  isVerified: { type: Boolean, default: false },
  favorites: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
});

UserSchema.set('toJSON', {
  virtuals: true,
});

// middleware to hash the password and save the hashed password
// note that this middleware is only invoked on save()
// will not be invoked on update()
UserSchema.pre('save', function beforeUserSave(next) {
  // this is a reference to our models
  // the function runs in some other context so don't bind it
  const user = this;

  // TODO: do stuff here
  // if the password is unchanged, do nothing and move onto next
  if (!user.isModified('password')) return next();

  // if the password has changed then generate a salt and
  // hash the password
  bcrypt.genSalt(SALT_REPS, (err, salt) => {
    if (err) return next(err);

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) return next(err); // check for error

      user.password = hash;
      return next();
    });
  });
});

UserSchema.methods.comparePassword = function comparePassword(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    if (err) return callback(err);
    callback(null, isMatch);
  });
};
// create a UserModel class from Schema
const UserModel = mongoose.model('User', UserSchema);

export default UserModel;
