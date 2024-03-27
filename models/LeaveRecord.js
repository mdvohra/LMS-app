const mongoose = require('mongoose');

const leaveRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  totalLeaveDays: { type: Number, required: true },
  remainingLeaveDays: { type: Number, required: true }
});

module.exports = mongoose.model('LeaveRecord', leaveRecordSchema);