import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
    passwordHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['pending', 'active', 'disabled'], default: 'pending' },
    isAdmin: { type: Boolean, default: false },
    permissions: {
      type: [{ type: String, enum: ['read_private', 'edit_private', 'publish'] }],
      default: [],
    },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform(_document, result) {
    result.id = result._id.toString();
    delete result._id;
    delete result.__v;
    delete result.passwordHash;
    return result;
  },
});

export default mongoose.model('User', userSchema);
