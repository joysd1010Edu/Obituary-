const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const memorialController = require("../controllers/memorialController");
const { getAllDonations, deleteDonation } = require("../controllers/donationController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// Admin guard middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ success: false, message: "Access denied. Admin only." });
  }
};

const uploadFields = upload.handleUpload(upload.fields([
  { name: "funeralHomeLogo", maxCount: 1 },
  { name: "familyTreeDiagram", maxCount: 1 },
  { name: "deadPersonPhoto", maxCount: 30 },
  { name: "adImage_0", maxCount: 1 },
  { name: "adImage_1", maxCount: 1 },
  { name: "adImage_2", maxCount: 1 },
]));

router.use(authMiddleware, adminOnly);

// User management
router.get("/users", adminController.getAllUsers);
router.delete("/users/:id", adminController.deleteUser);
router.post("/users/:id/approve-coupon", adminController.approveCoupon);

// Memorial management
router.get("/memorials", adminController.getAllMemorials);
router.put("/memorials/:id", uploadFields, adminController.updateMemorial);
router.delete("/memorials/:id", memorialController.deleteMemorial);

// Donations (read-only for admin dashboard)
router.get("/donations", getAllDonations);
router.delete("/donations/:id", deleteDonation);

module.exports = router;
