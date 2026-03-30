const express = require("express");
const router = express.Router();
const multer = require("multer");
const { signUp, signIn, fetchData, AdminfetchData, UpdateDoctorProfile, adminsignIn, doctorListAssigned, updatedoctorstatus,fetchupdateddoctors, updateavailability, fetchavailableslots, confirmslot, getnames, linkgiven, uploadpres, confirmstatus, UpdatePatientProfile, fetchDoctors, fetchpharmacymedicines, updateorderedmedicines, updatecartquantity, addmedicinetodb, decreaseupdatecartquantity, deletemedicine, finalitems, finaladdress, finalpayment, deletecartItems, doctorchatbotfetchdata, uploadPrescriptionFile, createStoreApprovalRequest, getStoreApprovalRequests, reviewStoreApprovalRequest, getAllStores, updateStoreStatus,addStore } = require("../controllers/auth");

// Configure multer for prescription uploads
const prescriptionStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const prescriptionUpload = multer({ 
  storage: prescriptionStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const storeRequestStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-store-' + file.originalname);
  }
});

const storeRequestUpload = multer({
  storage: storeRequestStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Define routes for authentication
router.post("/login", signIn);
router.post("/signup", signUp);
router.post("/profile", UpdateDoctorProfile);
router.post("/patientprofile", UpdatePatientProfile);
router.post("/updateslots", updateavailability);
router.post("/admin", adminsignIn);
router.get("/fetchdata", fetchData);
router.post("/fetchslots", fetchavailableslots);
router.get("/doctors", doctorListAssigned)
router.get("/alldoctors", fetchupdateddoctors);
router.get("/adminfetchdata", AdminfetchData);
router.put("/acceptdoctor", updatedoctorstatus);
router.post("/confirmslots", confirmslot);
router.post("/getnames", getnames);
router.post("/linkgiven", linkgiven);
router.post("/confirmstatus", confirmstatus);
router.post("/uploadpres", prescriptionUpload.single('prescription'), uploadpres);
router.post("/fetchdoctors", fetchDoctors);
router.post("/updateorderedmedicines", updateorderedmedicines);
router.post("/updatecartquantity", updatecartquantity);
router.post("/addmedicine", addmedicinetodb);
router.post("/decreaseupdatecartquantity", decreaseupdatecartquantity);
router.post("/deletemedicine", deletemedicine);
router.get("/allmedicines", fetchpharmacymedicines);
router.post("/additemstocart", finalitems);
router.post("/addaddress", finaladdress);
router.post("/addpayment", finalpayment);
router.post("/deletefullcart", deletecartItems)
router.post("/doctorchatbotfetchdata", doctorchatbotfetchdata)
router.post("/store-requests", storeRequestUpload.single('storeLicenceFile'), createStoreApprovalRequest);
router.get("/store-requests", getStoreApprovalRequests);
router.patch("/store-requests/:id/review", reviewStoreApprovalRequest);
router.patch("/stores/:id/status", updateStoreStatus);
router.get("/allstores", getAllStores);
router.post("/addstores", addStore);
module.exports = router;
