const Memorial = require("../models/Memorial");
const FuneralHome = require("../models/FuneralHome");
const { uploadBuffer } = require("../config/cloudinary");

const RELATIONSHIP_OPTIONS = new Set([
  "Spouse",
  "Partner",
  "Child",
  "Parent",
  "Sibling",
  "Grandchild",
  "Grandparent",
  "Relative",
  "Friend",
  "Funeral home representative",
  "Other",
]);
const GOOGLE_MAP_HOSTS = ["google.", "maps.google.", "maps.app.goo.gl", "goo.gl"];

function clean(value) {
  return String(value || "").trim();
}

function hasValue(value) {
  return clean(value).length > 0;
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value));
}

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(clean(value));
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isGoogleMapLink(value) {
  if (!isValidHttpUrl(value)) return false;

  const parsed = new URL(clean(value));
  const host = parsed.hostname.toLowerCase();
  const href = parsed.href.toLowerCase();

  return (
    GOOGLE_MAP_HOSTS.some((allowedHost) => host.includes(allowedHost)) &&
    (href.includes("/maps") || host === "maps.app.goo.gl" || href.includes("goo.gl/maps"))
  );
}

function validateMemorialPayload(body, funeralHomeDetails, funeralNotice, ads) {
  if (!hasValue(body.name)) return "Deceased person's full name is required";
  if (!hasValue(body.deathDate)) return "Date of death is required";

  const deathDate = new Date(body.deathDate);
  if (Number.isNaN(deathDate.getTime())) {
    return "Date of death must be a valid date";
  }

  if (hasValue(body.birthdate)) {
    const birthDate = new Date(body.birthdate);
    if (Number.isNaN(birthDate.getTime())) {
      return "Birth date must be valid when provided";
    }

    if (birthDate >= deathDate) {
      return "Birth date cannot be the same as or newer than death date";
    }
  }

  if (!RELATIONSHIP_OPTIONS.has(clean(body.relationToDeceased))) {
    return "Please select a valid relationship to the deceased";
  }

  if (hasValue(funeralHomeDetails.website) && !isValidHttpUrl(funeralHomeDetails.website)) {
    return "Funeral home website must be a valid link";
  }

  if (hasValue(funeralHomeDetails.email) && !isValidEmail(funeralHomeDetails.email)) {
    return "Funeral home email must be valid";
  }

  if (hasValue(funeralHomeDetails.mapLink) && !isGoogleMapLink(funeralHomeDetails.mapLink)) {
    return "Funeral home map link must be a valid Google Maps link";
  }

  const hasServiceDetails =
    hasValue(funeralNotice.serviceName) ||
    hasValue(funeralNotice.serviceLocation) ||
    hasValue(funeralNotice.serviceMapLink);
  if (hasServiceDetails && hasValue(funeralNotice.serviceMapLink)) {
    if (!isGoogleMapLink(funeralNotice.serviceMapLink)) {
      return "Service map link must be a valid Google Maps link";
    }
  }

  const hasReceptionDetails =
    hasValue(funeralNotice.ReceptionName) ||
    hasValue(funeralNotice.ReceptionLocation) ||
    hasValue(funeralNotice.ReceptionMapLink);
  if (hasReceptionDetails && hasValue(funeralNotice.ReceptionMapLink)) {
    if (!isGoogleMapLink(funeralNotice.ReceptionMapLink)) {
      return "Reception map link must be a valid Google Maps link";
    }
  }

  for (const [index, ad] of ads.entries()) {
    if (hasValue(ad.link) && !isValidHttpUrl(ad.link)) {
      return `Advertisement ${index + 1} link must be a valid link`;
    }
  }

  return null;
}

// Helper to safely upload a file to Cloudinary
async function uploadToCloudinary(file, folder) {
  if (!file) return null;
  const result = await uploadBuffer(file.buffer, { folder });
  return result.secure_url;
}

// ================= Create Memorial =================
exports.createMemorial = async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body;

    // Parse JSON strings from FormData if sent stringified
    const funeralHomeDetails = typeof body.funeralHomeDetails === "string" 
      ? JSON.parse(body.funeralHomeDetails) 
      : body.funeralHomeDetails || {};

    const funeralNotice = typeof body.funeralNotice === "string" 
      ? JSON.parse(body.funeralNotice) 
      : body.funeralNotice || {};

    let funeralHomeAdvertisement = [];
    if (typeof body.funeralHomeAdvertisement === "string") {
      try {
        funeralHomeAdvertisement = JSON.parse(body.funeralHomeAdvertisement);
      } catch (e) {
        funeralHomeAdvertisement = [];
      }
    } else if (Array.isArray(body.funeralHomeAdvertisement)) {
      funeralHomeAdvertisement = body.funeralHomeAdvertisement;
    }

    const validationError = validateMemorialPayload(
      body,
      funeralHomeDetails,
      funeralNotice,
      funeralHomeAdvertisement,
    );
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Process file uploads
    const files = req.files || {};
    
    // 1. Funeral Home Logo
    const funeralHomeLogoFile = files.funeralHomeLogo?.[0];
    let funeralHomeLogo = body.existingFuneralHomeLogo || "";
    if (funeralHomeLogoFile) {
      funeralHomeLogo = await uploadToCloudinary(funeralHomeLogoFile, "obituary/memorials/logos");
    } else if (!funeralHomeLogo) {
      const funeralHome = await FuneralHome.findOne({ userId }).select("logoImageUrl");
      funeralHomeLogo = funeralHome?.logoImageUrl || "";
    }

    // 2. Dead Person Photos
    const deadPersonPhotoFiles = files.deadPersonPhoto || [];
    const expectedPhotoCount = Number(body.deadPersonPhotoCount || 0);

    if (
      Number.isInteger(expectedPhotoCount) &&
      expectedPhotoCount > 0 &&
      deadPersonPhotoFiles.length !== expectedPhotoCount
    ) {
      return res.status(400).json({
        message: `Expected ${expectedPhotoCount} deceased person photo(s), but received ${deadPersonPhotoFiles.length}. Please select the photos again and retry.`,
      });
    }

    const deadPersonPhotoUrls = (
      await Promise.all(
        deadPersonPhotoFiles.map((file) =>
          uploadToCloudinary(file, "obituary/memorials/photos"),
        ),
      )
    ).filter(Boolean);
    // Append any existing photos passed from frontend
    let existingPhotos = [];
    if (body.existingDeadPersonPhotos) {
      existingPhotos = Array.isArray(body.existingDeadPersonPhotos) 
        ? body.existingDeadPersonPhotos 
        : JSON.parse(body.existingDeadPersonPhotos || "[]");
    }
    const finalDeadPersonPhotos = [...existingPhotos, ...deadPersonPhotoUrls].slice(0, 30);

    // 3. Family Tree Diagram
    const familyTreeDiagramFile = files.familyTreeDiagram?.[0];
    let familyTreeDiagram = body.existingFamilyTreeDiagram || "";
    if (familyTreeDiagramFile) {
      familyTreeDiagram = await uploadToCloudinary(familyTreeDiagramFile, "obituary/memorials/family-trees");
    }

    // 4. Advertisements (Max 3)
    const adFiles = files.adImage || [];
    const finalAds = [];
    
    // Merge existing ads and new ad files based on the passed ad data
    for (let i = 0; i < Math.min(funeralHomeAdvertisement.length, 3); i++) {
      const adData = funeralHomeAdvertisement[i];
      let adImage = adData.adImage || "";
      
      // If there's a new file corresponding to this ad (e.g. adImage_0)
      const adFile = files[`adImage_${i}`]?.[0];
      if (adFile) {
        adImage = await uploadToCloudinary(adFile, "obituary/memorials/ads");
      }
      
      if (adImage && adData.link) {
        finalAds.push({ adImage, link: adData.link });
      }
    }

    let derivedCountry = body.country;
    if (!derivedCountry && body.location) {
      const parts = body.location.split(',');
      derivedCountry = parts[parts.length - 1].trim();
    }

    const memorial = new Memorial({
      name: body.name || "",
      deathDate: body.deathDate,
      birthdate: body.birthdate || undefined,
      location: body.location || "",
      memorialDetails: body.memorialDetails || "",
      familyDetails: body.familyDetails || "",
      lifeStory: body.lifeStory || "",
      rememberForEverQuote: body.rememberForEverQuote || "",
      favouriteQuote: body.favouriteQuote || "",
      careerSummery: body.careerSummery || "",
      funeralHomeLogo,
      deadPersonPhoto: finalDeadPersonPhotos,
      relationToDeceased: body.relationToDeceased || "",
      funeralHomeDetails,
      funeralNotice,
      funeralHomeAdvertisement: finalAds,
      familyTreeDiagram,
      country: derivedCountry || "Unknown",
      UserId: userId,
      status: "pending",
    });

    await memorial.save();

    return res.status(201).json({ message: "Memorial submitted successfully", memorial });
  } catch (error) {
    console.error("Create memorial error:", error);
    return res.status(500).json({ message: "Failed to create memorial", error: error.message });
  }
};

// ================= Get Public Memorials =================
exports.getPublicMemorials = async (req, res) => {
  try {
    const memorials = await Memorial.find({ status: "approved" }).sort({ publicationDate: -1, submittedAt: -1 });
    return res.status(200).json({ memorials });
  } catch (error) {
    console.error("Fetch public memorials error:", error);
    return res.status(500).json({ message: "Failed to fetch memorials" });
  }
};

// ================= Get Single Public Memorial =================
exports.getMemorialById = async (req, res) => {
  try {
    const memorial = await Memorial.findOne({
      _id: req.params.id,
      status: "approved",
    });
    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }
    return res.status(200).json({ memorial });
  } catch (error) {
    console.error("Fetch memorial by id error:", error);
    return res.status(500).json({ message: "Failed to fetch memorial" });
  }
};

// ================= Get User Memorials =================
exports.getMemorials = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const memorials = await Memorial.find({ UserId: req.user.id }).sort({ submittedAt: -1 });
    return res.status(200).json({ memorials });
  } catch (error) {
    console.error("Fetch user memorials error:", error);
    return res.status(500).json({ message: "Failed to fetch user memorials" });
  }
};

// ================= Update Memorial =================
exports.updateMemorial = async (req, res) => {
  try {
    const memorial = await Memorial.findOne({ _id: req.params.id, UserId: req.user.id });
    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }

    const body = req.body;
    const files = req.files || {};

    // Keep existing photos if provided
    let keptPhotos = memorial.deadPersonPhoto;
    if (body.existingDeadPersonPhotos) {
       try {
         keptPhotos = JSON.parse(body.existingDeadPersonPhotos);
       } catch (e) {
         if (Array.isArray(body.existingDeadPersonPhotos)) keptPhotos = body.existingDeadPersonPhotos;
       }
    }

    // Appending new photos
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

    // Other string fields
    const fields = [
      "name", "deathDate", "birthdate", "location", "memorialDetails",
      "familyDetails", "lifeStory", "rememberForEverQuote", "favouriteQuote",
      "careerSummery", "relationToDeceased", "country"
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        memorial[field] = body[field];
      }
    });

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
       let ads = typeof body.funeralHomeAdvertisement === "string" ? JSON.parse(body.funeralHomeAdvertisement) : body.funeralHomeAdvertisement;
       for (let i = 0; i < Math.min(ads.length, 3); i++) {
         const adFile = files[`adImage_${i}`]?.[0];
         if (adFile) {
            ads[i].adImage = await uploadToCloudinary(adFile, "obituary/memorials/ads");
         }
       }
       memorial.funeralHomeAdvertisement = ads.filter(ad => ad.adImage && ad.link);
    }
    
    await memorial.save();
    return res.status(200).json({ message: "Memorial updated successfully", memorial });
  } catch (error) {
    console.error("Update memorial error:", error);
    return res.status(500).json({ message: "Failed to update memorial" });
  }
};

// ================= Delete Memorial =================
exports.deleteMemorial = async (req, res) => {
  try {
    const deleteQuery = { _id: req.params.id };

    if (req.user.role !== "admin") {
      deleteQuery.UserId = req.user.id;
    }

    const memorial = await Memorial.findOneAndDelete(deleteQuery);
    if (!memorial) {
      return res.status(404).json({ message: "Memorial not found" });
    }
    return res.status(200).json({ message: "Memorial deleted successfully" });
  } catch (error) {
    console.error("Delete memorial error:", error);
    return res.status(500).json({ message: "Failed to delete memorial" });
  }
};
