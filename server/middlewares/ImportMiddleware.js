const express = require("express");
const multer = require("multer");
const fs = require("fs")

const path = require("path");

// to check if directory upload exist or not 
const UPLOADS_DIR = path.resolve("./uploads");

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR);
    console.log('directory created successfully ');
    
} else {
    console.log('error creating directory');
    
}


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




module.exports ={upload}