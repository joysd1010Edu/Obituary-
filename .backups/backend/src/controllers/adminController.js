const User = require("../models/User");
const Memorial = require("../models/Memorial");
const { uploadBuffer } = require("../config/cloudinary");

async function uploadToCloudinary(file, folder) {
  if (!file) return null;
  const result = await uploadBuffer(file.buffer, { folder });
  return result.secure_url;
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .select("-passwordHash -refreshToken")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Delete associated memorials
    await Memorial.deleteMany({ UserId: req.params.id });
    res.status(200).json({
      success: true,
      message: "User and their memorials deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting user",
      error: error.message,
    });
  }
};

exports.approveCoupon = async (req, res) => {
  try {
    const crypto = require("crypto");
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    user.tokenApproveStatus = true;
    user.token = `TOKEN-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    await user.save();
    res.status(200).json({ success: true, message: "Coupon approved", token: user.token });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error approving coupon", error: error.message });
  }
};

exports.getAllMemorials = async (req, res) => {
  try {
    const memorials = await Memorial.find({})
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, memorials });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching memorials",
      error: error.message,
    });
  }
};

// ================= Admin Update Memorial (no ownership check) =================
exports.updateMemorial = async (req, res) => {
  try {
    const memorial = await Memorial.findById(req.params.id);
    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    const body = req.body;
    const files = req.files || {};

    // ---- Images ----

    // Deceased person photos
    let keptPhotos = memorial.deadPersonPhoto || [];
    if (body.existingDeadPersonPhotos) {
      try {
        keptPhotos = JSON.parse(body.existingDeadPersonPhotos);
      } catch (e) {
        if (Array.isArray(body.existingDeadPersonPhotos)) keptPhotos = body.existingDeadPersonPhotos;
      }
    }
    const newPhotos = [];
    const deadPersonPhotoFiles = files.deadPersonPhoto || [];
    for (const file of deadPersonPhotoFiles) {
      if (keptPhotos.length + newPhotos.length < 30) {
        const url = await uploadToCloudinary(file, "obituary/memorials/photos");
        if (url) newPhotos.push(url);
      }
    }
    memorial.deadPersonPhoto = [...keptPhotos, ...newPhotos].slice(0, 30);

    // Funeral Home Logo
    if (files.funeralHomeLogo?.[0]) {
      const newLogo = await uploadToCloudinary(files.funeralHomeLogo[0], "obituary/memorials/logos");
      if (newLogo) memorial.funeralHomeLogo = newLogo;
    } else if (body.existingFuneralHomeLogo) {
      memorial.funeralHomeLogo = body.existingFuneralHomeLogo;
    }

    // Family Tree Diagram
    if (files.familyTreeDiagram?.[0]) {
      const newTree = await uploadToCloudinary(files.familyTreeDiagram[0], "obituary/memorials/family-trees");
      if (newTree) memorial.familyTreeDiagram = newTree;
    } else if (body.existingFamilyTreeDiagram) {
      memorial.familyTreeDiagram = body.existingFamilyTreeDiagram;
    }

    // ---- Text Fields ----
    const textFields = [
      "name", "deathDate", "birthdate", "location", "memorialDetails",
      "familyDetails", "lifeStory", "rememberForEverQuote", "favouriteQuote",
      "careerSummery", "relationToDeceased", "country", "status", "rejectedReason",
    ];
    textFields.forEach(field => {
      if (body[field] !== undefined) {
        memorial[field] = body[field];
      }
    });
    if (body.rejectionReason !== undefined) {
      memorial.rejectedReason = body.rejectionReason;
    }

    // ---- Visibility Flags ----
    const boolFields = [
      "memorialDetailVisibilityStatus",
      "familyDetailVisibilityStatus",
      "lifeStoryVisibilityStatus",
      "rememberForEverQuoteVisibilityStatus",
      "favouriteQuoteVisibilityStatus",
      "careerSummeryVisibilityStatus",
      "donationsEnabled",
      "showInLivesRememberedForever",
    ];
    boolFields.forEach(field => {
      if (body[field] !== undefined) {
        memorial[field] = body[field] === "true" || body[field] === true;
      }
    });

    // ---- Nested Objects ----
    if (body.funeralHomeDetails) {
      memorial.funeralHomeDetails = typeof body.funeralHomeDetails === "string"
        ? JSON.parse(body.funeralHomeDetails)
        : body.funeralHomeDetails;
    }

    if (body.funeralNotice) {
      memorial.funeralNotice = typeof body.funeralNotice === "string"
        ? JSON.parse(body.funeralNotice)
        : body.funeralNotice;
    }

    // Ads
    if (body.funeralHomeAdvertisement) {
      let ads = typeof body.funeralHomeAdvertisement === "string"
        ? JSON.parse(body.funeralHomeAdvertisement)
        : body.funeralHomeAdvertisement;
      for (let i = 0; i < Math.min(ads.length, 3); i++) {
        const adFile = files[`adImage_${i}`]?.[0];
        if (adFile) {
          ads[i].adImage = await uploadToCloudinary(adFile, "obituary/memorials/ads");
        }
      }
      memorial.funeralHomeAdvertisement = ads.filter(ad => ad.adImage && ad.link);
    }

    // Publication date when approving
    if (body.status === "approved" && !memorial.publicationDate) {
      memorial.publicationDate = new Date();
    }

    await memorial.save();
    return res.status(200).json({ message: "Memorial updated successfully", memorial });
  } catch (error) {
    console.error("Admin update memorial error:", error);
    return res.status(500).json({ message: "Failed to update memorial", error: error.message });
  }
};
