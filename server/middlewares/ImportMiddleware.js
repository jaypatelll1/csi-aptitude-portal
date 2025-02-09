const express = require("express");
const multer = require("multer");
const fs = require("fs").promises; // Use promises API for async FS operations
const path = require("path");

const UPLOADS_DIR = path.resolve("./uploads");

// Create directory asynchronously
async function createUploadsDir() {
    try {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log("Directory created successfully");
    } catch (error) {
        console.error("Error creating directory:", error);
    }
}

// Call the async function
createUploadsDir();

// Multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage: storage });

module.exports = { upload };
