require('dotenv').config();
const {generateToken} = require("../utils/token")

let secret = process.env.JWT_SECRET_KEY;
const data = {
      "id" :1,
      "email" : "t@gmail.com",
      "name" : "hsrah",
      "role" :"TPO"
    }

     


console.log(generateToken(data))