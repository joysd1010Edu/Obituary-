const mongoose = require("mongoose");

const memorialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  deathDate: { type: Date, required: true },
  birthdate: { type: Date },
  location: { type: String },
  memorialDetails: { type: String },
  memorialDetailVisibilityStatus: { type: Boolean, default: true },
  familyDetails: { type: String },
  familyDetailVisibilityStatus: { type: Boolean, default: true },
  lifeStory: { type: String },
  lifeStoryVisibilityStatus: { type: Boolean, default: true },
  rememberForEverQuote: { type: String },
  rememberForEverQuoteVisibilityStatus: { type: Boolean, default: true },
  favouriteQuote: { type: String },
  favouriteQuoteVisibilityStatus: { type: Boolean, default: true },
  careerSummery: { type: String },
  careerSummeryVisibilityStatus: { type: Boolean, default: true },
  donationsEnabled: { type: Boolean, default: true },
  showInLivesRememberedForever: { type: Boolean, default: false },
  funeralHomeLogo: { type: String },
  deadPersonPhoto: {
    type: [String],
    validate: {
      validator: function (photos) {
        return photos.length <= 30;
      },
      message: "deadPersonPhoto cannot have more than 30 items.",
    },
  },
  relationToDeceased: { type: String },
  funeralHomeDetails: {
    name: { type: String },
    website: { type: String },
    phone: { type: String },
    email: { type: String },
    address: { type: String },
    mapLink: { type: String },
  },
  funeralNotice: {
    serviceDate: { type: Date },
    serviceLocation: { type: String },
    serviceName: { type: String },
    serviceMapLink: { type: String },
    ReceptionDate: { type: Date },
    ReceptionLocation: { type: String },
    ReceptionName: { type: String },
    ReceptionMapLink: { type: String },
  },
  funeralHomeAdvertisement: [
    {
      adImage: { type: String },
      link: { type: String },
    },
  ],
  familyTreeDiagram: { type: String },
  country: { type: String },
  UserId: { type: String, required: true },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  submittedAt: { type: Date, default: Date.now },
  publicationDate: { type: Date, default: null },
  rejectedReason: { type: String, default: null },
 
});

module.exports = mongoose.model("memorial", memorialSchema);
