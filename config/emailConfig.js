const nodemailer = require('nodemailer');
const sgTransport = require('@sendgrid/mail');
require('dotenv').config();

sgTransport.setApiKey(process.env.SENDGRID_API_KEY);

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: 'apikey', // This value is overridden by SendGrid, but it's necessary for nodemailer
    pass: process.env.SENDGRID_API_KEY,
  },
});

module.exports = transporter;