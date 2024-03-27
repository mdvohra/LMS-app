const express = require('express');
const LeaveApplication = require('../models/LeaveApplication');
const { isAuthenticated } = require('./middleware/authMiddleware');
const transporter = require('../config/emailConfig');
const { body, validationResult } = require('express-validator');
const router = express.Router();

// Log middleware to show the path and method of the request
router.use((req, res, next) => {
  console.log(`LeaveRoutes: Received ${req.method} request for '${req.path}'`);
  next();
});

router.get('/leaveApplication', isAuthenticated, (req, res) => {
  res.render('leaveApplication', { user: req.session.userId });
});

router.post('/apply-for-leave', isAuthenticated, [
  body('leaveType').isIn(['casual', 'sick', 'emergency']).withMessage('Invalid type of leave.'),
  body('reason').isLength({ min: 1 }).withMessage('Reason for leave is required.'),
  body('startDate').isISO8601().withMessage('Invalid start date.'),
  body('endDate').isISO8601().withMessage('Invalid end date.'),
  // Server-side validation for Start Date before End Date
  (req, res, next) => {
    const { startDate, endDate } = req.body;
    if (new Date(startDate) >= new Date(endDate)) {
      console.log('Server-side validation failed: Start Date is not before End Date');
      return res.status(400).render('leaveApplication', {
        errors: [{ msg: 'Start date must be before end date.' }],
        user: req.session.userId,
        formValues: req.body
      });
    }
    next();
  }
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('Validation errors:', errors.array());
    return res.status(400).render('leaveApplication', { errors: errors.array(), user: req.session.userId, formValues: req.body });
  }
  
  try {
    const { leaveType, reason, startDate, endDate } = req.body;
    const newLeaveApplication = await LeaveApplication.create({
      userId: req.session.userId,
      leaveType,
      reason,
      startDate,
      endDate
    });
    console.log('Leave application submitted successfully:', newLeaveApplication);

    // Construct email
    const emailOptions = {
      from: process.env.EMAIL_FROM,
      to: process.env.MANAGEMENT_TEAM_EMAIL,
      subject: `New Leave Application from ${req.session.username}`,
      text: `Leave Type: ${leaveType}\nStart Date: ${startDate}\nEnd Date: ${endDate}\nReason: ${reason}`,
    };

    // Send email
    transporter.sendMail(emailOptions, (error, info) => {
      if (error) {
        console.error('SendMail error:', error);
        console.error(error.stack);
        return res.status(500).send('Failed to send notification email.');
      } else {
        console.log('Email sent: ' + info.response);
        res.redirect('/');
      }
    });
  } catch (error) {
    console.error('Error applying for leave:', error.message);
    console.error(error.stack);
    res.status(500).send('Error applying for leave');
  }
});

router.get('/view-applied-leaves', isAuthenticated, async (req, res) => {
  try {
    const userLeaveApplications = await LeaveApplication.find({ userId: req.session.userId }).lean();
    console.log(`Fetched ${userLeaveApplications.length} leave applications for user ID: ${req.session.userId}`);
    res.render('viewAppliedLeaves', { leaveApplications: userLeaveApplications });
  } catch (error) {
    console.error('Error fetching user leave applications:', error);
    console.error(error.stack);
    res.status(500).send('Error fetching leave applications. Please try again later.');
  }
});

module.exports = router;
