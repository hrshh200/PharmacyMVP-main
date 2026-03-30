
const express = require("express");
require("dotenv").config();
const app = express();
const connectDB = require("./config/config"); //connecting to the database
const authRouter = require("./routes/auth");

const cors = require("cors");
const multer = require("multer");

const allowedOrigins = [
  "https://pharmacy-mvp-jade.vercel.app", // Your Vercel frontend
  "http://localhost:3000",
  "https://pharmacy-8dhdlkq0h-harsh-sharmas-projects-32241233.vercel.app" // For vercel
];
// const corsOptions = {
//     origin: 'https://medvision-1.onrender.com', // Frontend URL
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     credentials: true, // Include cookies in requests if needed
//   };

// Middleware to parse JSON bodiescls
app.use(cors({
  origin: true,
  credentials: true
}));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// app.use(cors(corsOptions));
app.use("/api", authRouter);


const start = async () => {
  try {
    const dbconnectstatus = await connectDB(process.env.MONGO_URL);
    if (dbconnectstatus) {
      console.log("Database Connected");
    }
    else {
      console.log("Error connecting to database");
    }
    app.listen(process.env.PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.log("error =>", err);
  }
};

app.use('/', (req, res) => {
  res.send('Not Found!');
});
start();