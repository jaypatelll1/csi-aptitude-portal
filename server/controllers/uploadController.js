const { Upload } = require("@aws-sdk/lib-storage");
const {DeleteObjectCommand,} = require("@aws-sdk/client-s3");
const s3 = require("../config/s3Config");

const bucket = process.env.AWS_BUCKET_NAME;

const uploadImage = async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file uploaded" });

  const key = `images/${Date.now()}-${file.originalname}`;

  try {
    const upload = new Upload({
      client: s3,
      params: {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
    });

    const result = await upload.done();

    res.status(200).json({
      success: true,
      imageUrl: `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Upload failed", details: err.message });
  }
};

const deleteImage = async (req, res) => {
  const { key } = req.params; // e.g. "filename.jpg"

  if (!key) return res.status(400).json({ error: "Image key required" });

  const s3Key = `images/${key}`; // 💡 prepend path if not included

  try {
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: s3Key,
    });

    await s3.send(command);

    res.status(200).json({ success: true, message: "Image deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ error: "Delete failed", details: err.message });
  }
};

module.exports = { uploadImage, deleteImage };
