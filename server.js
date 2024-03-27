// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const authRoutes = require("./routes/authRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const managerRoutes = require("./routes/managerRoutes");

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    // Enhanced error handling for more specific diagnostics
    switch (err.name) {
      case 'MongoNetworkError':
        console.error('Network error while attempting to connect to MongoDB. Check if MongoDB is running and accessible.');
        break;
      case 'MongooseServerSelectionError':
        console.error('Could not connect to any servers in your MongoDB cluster. Check network ACLs or firewall settings.');
        break;
      case 'MongoParseError':
        console.error('There is an issue with the MongoDB connection string. Please check the DATABASE_URL in your .env file.');
        break;
      case 'MongoTimeoutError':
        console.error('Connection attempt timed out. Check your network connectivity and the status of your MongoDB server.');
        break;
      case 'MongooseError':
        console.error('General Mongoose error. Check Mongoose documentation for more information.');
        break;
      default:
        console.error('An undefined error occurred when connecting to MongoDB. Check the error stack for more details.');
        console.error(err.stack);
        break;
    }
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Leave Application Routes
app.use(leaveRoutes);

// Manager Routes
app.use(managerRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Check MongoDB connection status and attempt to reconnect if disconnected
setInterval(() => {
  const { connection } = mongoose;
  if (connection.readyState === 0) { // 0 = disconnected
    console.log("Attempting to reconnect to MongoDB...");
    mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
      .then(() => console.log("Reconnected to MongoDB successfully."))
      .catch((err) => {
        console.error("MongoDB reconnection attempt failed:", err.message);
        console.error(err.stack);
      });
  }
}, 30000); // check every 30 seconds

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});