const mongoose = require('mongoose');

const leaveApplicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, default: 'pending' }, // Status can be 'pending', 'approved', or 'rejected'
  remarks: { type: String, required: false } // Optional remarks field added
});

leaveApplicationSchema.pre('save', async function(next) {
  try {
    console.log("Preparing to save leave application for user ID:", this.userId);
    next();
  } catch (error) {
    console.error("Error in pre-save middleware for LeaveApplication:", error.message);
    console.error(error.stack);
    next(error);
  }
});

module.exports = mongoose.model('LeaveApplication', leaveApplicationSchema);