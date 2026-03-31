const express = require("express");
const router = express.Router();
const multer = require("multer");
const { signUp, signIn, fetchData, AdminfetchData, UpdateDoctorProfile, adminsignIn, doctorListAssigned, updatedoctorstatus,fetchupdateddoctors, updateavailability, fetchavailableslots, confirmslot, getnames, linkgiven, uploadpres, confirmstatus, UpdatePatientProfile, fetchDoctors, fetchpharmacymedicines, updateorderedmedicines, updatecartquantity, addmedicinetodb, decreaseupdatecartquantity, deletemedicine, finalitems, finaladdress, finalpayment, deletecartItems, doctorchatbotfetchdata, uploadPrescriptionFile, createStoreApprovalRequest, getStoreApprovalRequests, reviewStoreApprovalRequest, getAllStores, updateStoreStatus,addStore, getUserNotificationPreferences, updateUserNotificationPreferences } = require("../controllers/auth");
const verifyToken  = require("../middleware/authMiddleware");  

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
// router.post("/admin", adminsignIn);
router.get("/fetchdata", verifyToken(["User", "Store", "Doctor"]), fetchData);
router.get("/user-notifications", verifyToken(["User"]), getUserNotificationPreferences);
router.put("/user-notifications", verifyToken(["User"]), updateUserNotificationPreferences);
router.post("/fetchslots", fetchavailableslots);
// router.get("/doctors", doctorListAssigned)
// router.get("/alldoctors", fetchupdateddoctors);
router.get("/adminfetchdata", verifyToken(["admin"]), AdminfetchData);
// router.put("/acceptdoctor", updatedoctorstatus);
// router.post("/confirmslots", confirmslot);
router.post("/getnames", getnames);
router.post("/linkgiven", linkgiven);
router.post("/confirmstatus", confirmstatus);
router.post("/uploadpres", prescriptionUpload.single('prescription'), uploadpres);
// router.post("/fetchdoctors", fetchDoctors);
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
// router.post("/doctorchatbotfetchdata", doctorchatbotfetchdata)
router.post("/store-requests", storeRequestUpload.single('storeLicenceFile'), createStoreApprovalRequest);
router.get("/store-requests", verifyToken(["admin"]), getStoreApprovalRequests);
router.patch("/store-requests/:id/review", verifyToken(["admin"]), reviewStoreApprovalRequest);
router.patch("/stores/:id/status", verifyToken(["admin"]), updateStoreStatus);
router.get("/allstores", verifyToken(["admin"]), getAllStores);
router.post("/stores", verifyToken(["admin"]), addStore);
module.exports = router;
