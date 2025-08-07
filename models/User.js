import mongoose from 'mongoose';
import Notification from './Notification.js';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  }
});

// ✅ Case 1: userDocument.deleteOne()
userSchema.pre('deleteOne', { document: true, query: false }, async function (next) {
  try {
    await Notification.deleteMany({ user: this._id });
    console.log(`🗑 Deleted notifications for user: ${this.username}`);
    next();
  } catch (err) {
    console.error('❌ Error deleting notifications:', err);
    next(err);
  }
});

// ✅ Case 2: User.findOneAndDelete(), User.findByIdAndDelete()
userSchema.pre('findOneAndDelete', async function (next) {
  try {
    const user = await this.model.findOne(this.getQuery());
    if (user) {
      await Notification.deleteMany({ user: user._id });
      console.log(`🗑 Deleted notifications for user: ${user.username}`);
    }
    next();
  } catch (err) {
    console.error('❌ Error deleting notifications:', err);
    next(err);
  }
});

// ✅ Case 3: User.deleteMany({ ... })
userSchema.pre('deleteMany', async function (next) {
  try {
    const users = await this.model.find(this.getFilter());

    const ids = users.map(u => u._id);
    await Notification.deleteMany({ user: { $in: ids } });

    console.log(`🗑 Deleted notifications for ${ids.length} users`);
    next();
  } catch (err) {
    console.error('❌ Error in deleteMany middleware:', err);
    next(err);
  }
});

export default mongoose.model('User', userSchema);