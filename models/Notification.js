import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: String,
  title: String,
  text: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
});


notificationSchema.index({
  user: 1,
  package: 1,
  timestamp: -1
});

export default mongoose.model('Notification', notificationSchema);
