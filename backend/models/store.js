const mongoose = require('mongoose');

const ExistingStoreSchema = new mongoose.Schema(
  {
    storeName: { type: String, required: true },
    ownerName: { type: String, required: true },
    countryCode: { type: String, default: '+91' },
    mobile: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }, 
    licenceNumber: { type: String, required: true },
    gstNumber: { type: String, default: '' },
    city: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    licenceDocument: {
      fileName: { type: String },
      filePath: { type: String},
      mimeType: { type: String },
    },
    status: { type: String, required: true },
    reviewNotes: { type: String, default: '' },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Store', ExistingStoreSchema);
