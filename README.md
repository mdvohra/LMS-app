# Leave Application Management System

The Leave Application Management System (LAMS) is designed to streamline the process of applying for, managing, and approving or rejecting leave applications within an organization. It automates notifications and updates, facilitating better communication between employees and management.

## Overview

This system leverages a Node.js backend with the Express framework, MongoDB for database management, and EJS for templating. The frontend utilizes Bootstrap for styling and vanilla JavaScript for dynamic content. Email notifications are managed through NodeMailer, with integration options for SendGrid or Mailgun.

## Features

- **User Authentication:** Separate login portals for employees and managers with secure credential storage.
- **Leave Application Form:** Employees can submit leave requests, specifying the type of leave, reason, and dates.
- **Automatic Email Notifications:** Automated emails are sent to relevant parties throughout the application process.
- **Manager's Dashboard:** Enables managers to review, approve, or reject leave applications, with filtering and sorting capabilities.
- **Leave Record Management:** Tracks total and remaining leave days for each employee, updating records upon application approval or rejection.
- **Applied Leave Status Viewing:** Employees can view the status of their applied leaves after logging in.

## Getting Started

### Requirements
- Node.js
- MongoDB
- NPM

### Quickstart
1. Clone the repository.
2. Install dependencies with `npm install`.
3. Configure your `.env` file according to `.env.example`.
4. Start the server with `npm start`. The application should now be running on `http://localhost:3000`.

### License

Copyright (c) 2024.