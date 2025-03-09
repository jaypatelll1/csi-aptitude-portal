const crypto = require("crypto");

const secretKey = Buffer.from(process.env.KEY.slice(0, 32), "utf8"); // 32 bytes
const iv = Buffer.from(process.env.IV.slice(0, 16), "utf8"); // 16 bytes

const decryptPassword = async (encryptedPassword) => {
    const encryptedBuffer = Buffer.from(encryptedPassword, "base64");

    const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString("utf8");
};

module.exports = decryptPassword;