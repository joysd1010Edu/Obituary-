const multer = require("multer");

const storage = multer.memoryStorage();

/**
 * Multer instance for in-memory image uploads.
 */
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 26,
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }

    cb(null, true);
  },
});

upload.handleUpload = (middleware) => (req, res, next) => {
  middleware(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "One of the uploaded images is larger than 10MB."
          : error.message;

      res.status(status).json({ message });
      return;
    }

    res.status(400).json({ message: error.message || "Invalid upload." });
  });
};

module.exports = upload;
