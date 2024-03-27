const express = require('express');
const LeaveApplication = require('../models/LeaveApplication');
const LeaveRecord = require('../models/LeaveRecord');
const { isAuthenticated, isManager } = require('./middleware/authMiddleware');
const transporter = require('../config/emailConfig');
const { param, validationResult, body } = require('express-validator');
const router = express.Router();

// Function to check for inappropriate content in remarks
const containsInappropriateContent = (text) => {
  // Example: Simple check for forbidden words (in a real scenario, this could be more complex)
  const forbiddenWords = ['exampleBadWord1', 'exampleBadWord2'];
  return forbiddenWords.some(word => text.includes(word));
};

router.get('/manager-dashboard', isAuthenticated, async (req, res) => {
    try {
        const leaveApplications = await LeaveApplication.find()
            .populate('userId', 'username email')
            .lean();
        console.log("Manager Dashboard: Fetched leave applications successfully.");
        res.render('managerDashboard', { leaveApplications });
    } catch (error) {
        console.error('Error fetching leave applications:', error.message, error.stack);
        res.status(500).send('Error fetching leave applications');
    }
});

router.post('/approve-leave/:applicationId', isAuthenticated, isManager, [
  param('applicationId').isMongoId().withMessage('Invalid application ID.'),
  body('remarks').trim().isLength({ max: 500 }).withMessage('Remarks must be less than 500 characters.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).send('Invalid request');
    }
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        if (containsInappropriateContent(remarks)) {
          return res.status(400).send('Remarks contain inappropriate content.');
        }
        const application = await LeaveApplication.findByIdAndUpdate(applicationId, { status: 'approved', remarks }, { new: true }).populate('userId');
        const userEmail = application.userId.email;
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: 'Leave Application Approved',
            text: `Your leave application for ${application.leaveType} from ${application.startDate} to ${application.endDate} has been approved. Remarks: ${remarks}`,
        });
        console.log(`Leave application ${applicationId} approved and email notification sent to ${userEmail}. Remarks: ${remarks}`);

        const leaveDaysApplied = Math.ceil((new Date(application.endDate) - new Date(application.startDate)) / (1000 * 60 * 60 * 24)) + 1;

        let record = await LeaveRecord.findOne({ userId: application.userId._id });
        if (record) {
            record.remainingLeaveDays -= leaveDaysApplied;
            await record.save();
            console.log(`Leave record updated for user ID: ${application.userId._id}`);
        } else {
            console.log('No leave record found for this user, creating a new record.');
            const newRecord = new LeaveRecord({
              userId: application.userId._id,
              totalLeaveDays: leaveDaysApplied, // Assuming an initial total leave days value for simplicity.
              remainingLeaveDays: -leaveDaysApplied // This would be negative since it's a new record and all applied days are consumed.
            });
            await newRecord.save();
            console.log(`Leave record created for user ID: ${application.userId._id}`);
        }

        res.redirect('/manager-dashboard');
    } catch (error) {
        console.error('Error approving leave application:', error.message, error.stack);
        res.status(500).send('Error processing request');
    }
});

router.post('/reject-leave/:applicationId', isAuthenticated, isManager, [
  param('applicationId').isMongoId().withMessage('Invalid application ID.'),
  body('remarks').trim().isLength({ max: 500 }).withMessage('Remarks must be less than 500 characters.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('Validation errors:', errors.array());
      return res.status(400).send('Invalid request');
    }
    try {
        const { applicationId } = req.params;
        const { remarks } = req.body;
        if (containsInappropriateContent(remarks)) {
          return res.status(400).send('Remarks contain inappropriate content.');
        }
        const application = await LeaveApplication.findByIdAndUpdate(applicationId, { status: 'rejected', remarks }, { new: true }).populate('userId');
        const userEmail = application.userId.email;
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: userEmail,
            subject: 'Leave Application Rejected',
            text: `Your leave application for ${application.leaveType} from ${application.startDate} to ${application.endDate} has been rejected. Remarks: ${remarks}`,
        });
        console.log(`Leave application ${applicationId} rejected and email notification sent to ${userEmail}. Remarks: ${remarks}`);
        res.redirect('/manager-dashboard');
    } catch (error) {
        console.error('Error rejecting leave application:', error.message, error.stack);
        res.status(500).send('Error processing request');
    }
});

module.exports = router;