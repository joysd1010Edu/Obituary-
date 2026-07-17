const express = require("express");
const router = express.Router();
const memorialController = require("../controllers/memorialController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

// We need to parse adImage_0, adImage_1, adImage_2 dynamically or explicitly
const uploadFields = upload.handleUpload(upload.fields([
  { name: "funeralHomeLogo", maxCount: 1 },
  { name: "familyTreeDiagram", maxCount: 1 },
  { name: "deadPersonPhoto", maxCount: 30 },
  { name: "adImage_0", maxCount: 1 },
  { name: "adImage_1", maxCount: 1 },
  { name: "adImage_2", maxCount: 1 },
]));

router.post("/", authMiddleware, uploadFields, memorialController.createMemorial);
router.get("/", memorialController.getPublicMemorials);
router.get("/user", authMiddleware, memorialController.getMemorials);
router.get("/:id", memorialController.getMemorialById);
router.put("/:id", authMiddleware, uploadFields, memorialController.updateMemorial);
router.delete("/:id", authMiddleware, memorialController.deleteMemorial);

module.exports = router;
