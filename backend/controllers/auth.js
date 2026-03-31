const { StatusCodes } = require("http-status-codes");
const User = require("../models/user");
const Doctor = require("../models/doctor");
const Admin = require("../models/admin")
const Pharmacy = require("../models/pharmacy");
const StoreApprovalRequest = require("../models/storeApprovalRequest");
const Store = require("../models/store");
const UserNotification = require("../models/userNotification");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const verifyAdminRequest = (req) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return {
                ok: false,
                status: 401,
                message: "Admin token missing",
            };
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== 'admin') {
            return {
                ok: false,
                status: 403,
                message: "Admin access required",
            };
        }

        return { ok: true, user: decoded };

    } catch (error) {
        return {
            ok: false,
            status: 401,
            message: "Invalid or expired token",
        };
    }
};

const signUp = async (req, res) => {
    const {
        regNo,
        name,
        email,
        password,
        confirmPassword,
        salutation,
        firstName,
        middleName,
        lastName,
        countryCode,
        mobile,
        address,
        city,
        state,
        pincode,
        role,
        storeName,
        ownerName,
        licenceNumber,
        gstNumber,
    } = req.body;

    // Check if required fields are provided
    if (!name || !email || !password) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Please Provide Required Information",
        });
    }

    try {
        // Hash the password
        const hash_password = await bcrypt.hash(password, 10);

        // Check if user already exists
        if (regNo === "") {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User already registered",
                });
            }

            // Create new user data
            const userData = {
                name,
                email,
                salutation,
                firstName,
                middleName,
                lastName,
                countryCode,
                mobile,
                address,
                city,
                state,
                pincode,
                role,
                storeName,
                ownerName,
                licenceNumber,
                gstNumber,
                hash_password,
            };

            // Save the new user
            const newUser = await User.create(userData);
            res.status(StatusCodes.CREATED).json({ message: "User created successfully" });
        }

        else {
            const existingUser = await Doctor.findOne({ email });
            if (existingUser) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: "User already registered",
                });
            }

            // Create new user data
            const doctorData = {
                regNo,
                name,
                email,
                hash_password,
            };

            // Save the new user
            const newUser = await Doctor.create(doctorData);
            res.status(StatusCodes.CREATED).json({ message: "Doctor added successfully" });
        }

    } catch (error) {
        // Catch any other errors
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
};


const signIn = async (req, res) => {
    try {
        const { isDoctor = false, userType = 'patient', email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password",
            });
        }

        let user;
        let role;

        if (userType === 'admin') {
            user = await Admin.findOne({ email });
            role = 'admin';
        }
        else if (userType === 'store') {
            user = await Store.findOne({ email });
            role = 'Store';
        }
        else {
            user = await User.findOne({ email });
            role = 'User';
        }

        if (!user) {
            return res.status(400).json({
                message: "User does not exist..!",
            });
        }

        let isMatch;
        if (userType === 'admin' || userType === 'store') {
            isMatch = password === user.password;
        } else {
            isMatch = await bcrypt.compare(password, user.hash_password);
        }

        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { _id: user._id, role },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        return res.status(200).json({
            token,
            user: { _id: user._id, name: user.name, email: user.email, role },
        });

    } catch (error) {
        console.error("Sign-in error: ", error);
        return res.status(500).json({
            message: "An error occurred during sign-in",
        });
    }
};


const UpdateDoctorProfile = async (req, res) => {
    try {
        const { regNo, address, fees, hospital, specialist, experience, location, assign, status } = req.body;

        // Find and update the doctor's profile based on the registration number
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { regNo },
            { address, fees, hospital, specialist, experience, location, assign, status },
            { new: true, runValidators: true } // Options: return the updated document and run validation
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({
            message: 'Doctor profile updated successfully',
            doctor: updatedDoctor,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating doctor profile', error });
    }
};


const fetchData = async (req, res) => {
    try {
        const decoded = req.user;

        const userModel = decoded.role === 'Doctor' ? Doctor : User;

        const userData = await userModel
            .findById(decoded._id)
            .select('-hash_password');

        if (!userData) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.status(200).json({
            success: true,
            userData,
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching data",
        });
    }
};

const getUserNotificationPreferences = async (req, res) => {
    try {
        const notificationPreferences = await UserNotification.findOneAndUpdate(
            { userId: req.user._id },
            { $setOnInsert: { userId: req.user._id } },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            notificationPreferences,
        });
    } catch (error) {
        console.error("Error fetching notification preferences:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to fetch notification preferences",
        });
    }
};

const updateUserNotificationPreferences = async (req, res) => {
    try {
        const { isEmailNotificationOn, isSmsNotificationOn } = req.body;

        const updatePayload = {};

        if (typeof isEmailNotificationOn === 'boolean') {
            updatePayload.isEmailNotificationOn = isEmailNotificationOn;
        }

        if (typeof isSmsNotificationOn === 'boolean') {
            updatePayload.isSmsNotificationOn = isSmsNotificationOn;
        }

        if (!Object.keys(updatePayload).length) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "No valid notification preferences provided",
            });
        }

        const notificationPreferences = await UserNotification.findOneAndUpdate(
            { userId: req.user._id },
            {
                $set: updatePayload,
                $setOnInsert: { userId: req.user._id },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        return res.status(StatusCodes.OK).json({
            success: true,
            message: "Notification preferences updated successfully",
            notificationPreferences,
        });
    } catch (error) {
        console.error("Error updating notification preferences:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "Failed to update notification preferences",
        });
    }
};
const adminsignIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(req.body);

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "Please enter email and password",
            });
        }

        const user = await Admin.findOne({ email });

        if (!user) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: "User does not exist..!",
            });
        }

        if (user.password !== password) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Invalid email or password",
            });
        }

        // If password matches, generate the JWT token
        const token = jwt.sign(
            { _id: user._id, role: "admin" },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
        );

        const { _id, email: userEmail } = user;

        // Send the token and user info back to the client
        return res.status(StatusCodes.OK).json({
            token,
            user: { _id, email: userEmail },
        });

    } catch (error) {
        console.error("Sign-in error: ", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "An error occurred during sign-in",
            error: error.message,
        });
    }
};

const AdminfetchData = async (req, res) => {

    try {
        // Get token from the Authorization header
        const JWT_SECRET = process.env.JWT_SECRET;
        const token = req.header('Authorization')?.split(' ')[1];
        //  console.log(token);
        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                message: "Access token is missing or invalid",
            });
        }

        // Verify and decode the token
        const decoded = jwt.verify(token, JWT_SECRET);
        // console.log("hhh", decoded);

        // Check if the user is a doctor or not based on their role
        const adminModel = Admin;

        // Find user or doctor by their ID
        const adminData = await adminModel.findById(decoded._id).select('-password'); // Exclude sensitive fields

        if (!adminData) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: "User not found",
            });
        }

        // Respond with user or doctor data
        res.status(StatusCodes.OK).json({
            success: true,
            adminData,
        });

    } catch (error) {
        console.error("Error fetching data:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: "An error occurred while fetching data",
            error: error.message,
        });
    }
};

const doctorListAssigned = async (req, res) => {
    try {
        // Query to find all doctors with assign value as "assign"
        const assignedDoctors = await Doctor.find({ assign: 'true' });
        res.status(200).json({ success: true, doctors: assignedDoctors });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const fetchupdateddoctors = async (req, res) => {
    try {
        // Query to find all doctors with assign value as "assign"
        const acceptedDoctors = await Doctor.find({ assign: 'false' });
        res.status(200).json({ success: true, doctors: acceptedDoctors });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const updatedoctorstatus = async (req, res) => {
    try {
        const { regno, assign, status } = req.body; // Extract data from request body

        const updatedDoctor = await Doctor.findOneAndUpdate(
            { regNo: regno }, // Match doctor by regno
            { assign, status }, // Update these fields
            { new: true } // Return the updated document
        );

        if (!updatedDoctor) {
            return res.status(404).json({ message: "Doctor not found" });
        }

        res.status(200).json({
            message: "Doctor accepted successfully",
            doctor: updatedDoctor
        });
    } catch (error) {
        console.error("Error updating doctor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const updateavailability = async (req, res) => {
    try {
        const { regno, slots } = req.body;

        // Find doctor by regno and update the available field
        const updatedDoctor = await Doctor.findOneAndUpdate(
            { regNo: regno }, // Match the regno
            { $set: { available: slots } }, // Update the available field
            { new: true } // Return the updated document
        );

        if (!updatedDoctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        res.status(200).json({ success: true, doctor: updatedDoctor });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const fetchavailableslots = async (req, res) => {
    try {
        const { regno } = req.body;

        // Find doctor by regno
        const doctor = await Doctor.findOne({ regNo: regno });

        if (!doctor) {
            return res.status(404).json({ success: false, message: 'Doctor not found' });
        }

        // Return the available array
        res.status(200).json({
            success: true,
            available: doctor.available, // Include the available array
        });
    } catch (error) {
        console.error("Error fetching available slots:", error.message);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};

const confirmslot = async (req, res) => {
    const { regNo, name, slot } = req.body;

    try {
        const doctor = await Doctor.findOne({ regNo });
        const user = await User.findOne({ name });


        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });
        if (!user) return res.status(404).json({ success: false, message: "User not found" });


        const slotIndex = doctor.available.indexOf(slot);
        if (slotIndex === -1) {
            return res.status(400).json({ success: false, message: "Slot not available" });
        }

        // Remove the slot from the available slots
        doctor.available.splice(slotIndex, 1);

        doctor.appointments.push({ patientName: name, slot });
        user.appointments.push({ regNo, slot });

        await doctor.save();
        await user.save();

        res.status(200).json({ success: true, message: "Slot confirmed successfully" });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const getnames = async (req, res) => {
    const regNos = req.body.regNos;
    try {
        // Fetch names based on regNo from the database
        console.log(regNos); // Logs regNos to check what is being received
        const doctors = await Doctor.find({ regNo: { $in: regNos } }, 'regNo name');

        // Send the response back to the client
        res.status(200).json(doctors);  // Use res.json to send the data as JSON
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

const linkgiven = async (req, res) => {
    const { regNo, videoLink, patientName } = req.body;

    // Check if the required fields are provided
    if (!videoLink || !patientName || !regNo) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Find the patient by name
        const user = await User.findOne({ name: patientName });

        // Check if the user exists
        if (!user) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Check if the regNo and link are not null/undefined
        if (typeof regNo !== 'number' || typeof videoLink !== 'string') {
            return res.status(400).json({ success: false, message: 'Invalid data type for regNo or videoLink' });
        }

        // Update the `link` field by appending the new video link and regNo
        user.link.push({ link: videoLink, regNo: regNo });

        // Save the updated user
        await user.save();

        // Send a success response
        return res.status(200).json({ success: true, message: 'Video link updated successfully' });
    } catch (error) {
        console.error('Error updating video link:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};


const uploadpres = async (req, res) => {
    const { medicines, regNo, patientName } = req.body;

    // Check if required fields are present
    if (!medicines || !patientName || !regNo) {
        return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    try {
        // Search for the patient in the User Schema
        const user = await User.findOne({ name: patientName });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }

        // Iterate over the medicines array and add regNo to each medicine entry
        const medicinesWithRegNo = medicines.map(medicine => ({
            ...medicine,
            regNo: regNo  // Add regNo to each medicine object
        }));

        // Push the medicines array (with regNo included) to the user.medicines field
        user.medicines.push(...medicinesWithRegNo);

        // Save the updated user
        await user.save();

        return res.status(200).json({
            success: true,
            message: 'Prescription uploaded successfully',
            user
        });
    } catch (error) {
        console.error('Error uploading prescription:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const confirmstatus = async (req, res) => {
    const { regNo, patientName } = req.body;

    // Check if the required fields are provided
    try {
        // Find the patient by name
        const user = await User.findOne({ name: patientName });
        const doctor = await Doctor.findOne({ regNo: regNo });

        // Check if the user exists
        if (!user || !doctor) {
            return res.status(404).json({ success: false, message: 'Patient not found' });
        }


        // Update the `link` field by appending the new video link and regNo
        user.confirm.push({ confirm: true, regNo: regNo });
        doctor.confirm.push({ confirm: true, name: patientName });

        // Save the updated user
        await user.save();
        await doctor.save();

        // Send a success response
        return res.status(200).json({ success: true, message: 'confirm status  updated successfully' });
    } catch (error) {
        console.error('Error updating confirm status:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

const UpdatePatientProfile = async (req, res) => {
    try {
        const { name, address, mobile, weight, dob, height, sex, bloodgroup } = req.body;

        // Find and update the doctor's profile based on the registration number
        const updatedPatient = await User.findOneAndUpdate(
            { name },
            { address, mobile, weight, dob, height, sex, bloodgroup },
            { new: true, runValidators: true } // Options: return the updated document and run validation
        );

        if (!updatedPatient) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        res.status(200).json({
            message: 'Patient profile updated successfully',
            user: updatedPatient,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating patient profile', error });
    }
};

const fetchDoctors = async (req, res) => {
    const { name, location } = req.body;

    try {
        // Query to find a doctor with the given name and location
        console.log(name, location);
        const doctorExists = await Doctor.findOne({ name, address: location });

        if (doctorExists) {
            res.status(200).json({ success: true, message: 'Doctor found', doctor: doctorExists });
        } else {
            res.status(404).json({ success: false, message: 'No doctor found with the given name and location' });
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const fetchpharmacymedicines = async (req, res) => {
    try {
        // Query to find all medicines 
        const medicines = await Pharmacy.find({});
        res.status(200).json({ success: true, pharmacy: medicines });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

const updateorderedmedicines = async (req, res) => {
    try {
        const { name, price, id } = req.body;

        if (!name || !price || !id) {
            return res.status(400).json({ error: 'Name, Price, and User ID are required' });
        }

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the medicine already exists in the user's orderedmedicines array
        const existingMedicine = user.orderedmedicines.find(medicine => medicine.medicine === name);

        if (existingMedicine) {
            // Increment the quantity if the medicine exists
            existingMedicine.quantity += 1;
        } else {
            // Add a new medicine entry if it doesn't exist
            user.orderedmedicines.push({
                medicine: name,
                quantity: 1, // Default quantity
                price: price,
            });
        }

        // Save the user document
        await user.save();

        // console.log(`Updated orderedmedicines for user ${id}`);
        res.status(200).json({
            message: 'Medicine updated successfully',
            orderedmedicines: user.orderedmedicines
        });
    } catch (error) {
        console.error('Error updating orderedmedicines:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const updatecartquantity = async (req, res) => {
    const { name, id } = req.body; // Destructure name from request body

    if (!name) {
        return res.status(400).json({ error: 'Medicine name is required for updating the quantity' });
    }

    try {
        // Find the user and increment the quantity of the specific medicine
        const updatedUser = await User.findOneAndUpdate(
            { _id: id, "orderedmedicines.medicine": name }, // Match user and medicine
            { $inc: { "orderedmedicines.$.quantity": 1 } }, // Increment quantity by 1
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Medicine not found in the cart' });
        }

        return res.status(200).json({
            message: 'Medicine quantity updated successfully',
            orderedmedicines: updatedUser.orderedmedicines
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const decreaseupdatecartquantity = async (req, res) => {
    const { name, id } = req.body; // Destructure name from request body


    if (!name) {
        return res.status(400).json({ error: 'Medicine name is required for updating the quantity' });
    }

    try {
        // Find the user and decrease the quantity of the specific medicine
        const user = await User.findOne({ _id: id });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the medicine in the array
        const medicine = user.orderedmedicines.find(item => item.medicine === name);

        if (!medicine) {
            return res.status(404).json({ error: 'Medicine not found in the cart' });
        }

        // Ensure quantity does not go below 1
        if (medicine.quantity <= 1) {
            return res.status(400).json({ error: 'Quantity cannot be less than 1' });
        }

        // Decrease the quantity
        const updatedUser = await User.findOneAndUpdate(
            { _id: id, "orderedmedicines.medicine": name }, // Match user and medicine
            { $inc: { "orderedmedicines.$.quantity": -1 } }, // Decrement quantity by 1
            { new: true } // Return the updated document
        );

        return res.status(200).json({
            message: 'Medicine quantity decreased successfully',
            orderedmedicines: updatedUser.orderedmedicines
        });
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

const deletemedicine = async (req, res) => {
    const { name, id } = req.body; // `id` here is the userID
    try {
        if (!name || !id) {
            return res.status(400).json({ message: 'Name and userID are required' });
        }

        // Find the user by ID and update the orderedmedicines array
        const updatedUser = await User.findByIdAndUpdate(
            id, // Find the user by their ID
            { $pull: { orderedmedicines: { medicine: name } } }, // Remove the medicine object where 'medicine' matches the 'name'
            { new: true } // Return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found or medicine not found in order' });
        }

        await updatedUser.save();

        res.status(200).json({
            message: `Medicine '${name}' successfully deleted from user's orders`,
            updatedOrders: updatedUser.orderedmedicines,
        });
    } catch (error) {
        console.error('Error deleting medicine:', error);
        res.status(500).json({ message: 'Server error while deleting medicine', error });
    }
};

const addmedicinetodb = async (req, res) => {
    const { name, manufacturer, dosage, type, price, stock } = req.body;

    try {
        // Validate the request body
        if (!name || !manufacturer || !dosage || !type || !price || !stock) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Create a new medicine document
        const newMedicine = new Pharmacy({
            name,
            manufacturer,
            dosage,
            type,
            price,
            stock,
        });

        // Save to database
        await newMedicine.save();

        res.status(200).json({ message: 'Medicine added successfully', medicine: newMedicine });
    } catch (error) {
        console.error('Error adding medicine:', error.message);
        res.status(500).json({ error: 'Failed to add medicine' });
    }
};

const finalitems = async (req, res) => {
    const { id, items } = req.body;

    // Validate the request
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Items field is required and must be an array' });
    }

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Validate existing orders
        if (user.order && user.order.length > 0) {
            const incompleteOrder = user.order.some(order =>
                !order.orderId ||
                !order.items || order.items.length === 0 ||
                !order.totalPrice ||
                order.payment === 'Pending' ||
                !order.address
            );

            if (incompleteOrder) {
                return res.status(201).json({
                    message: 'Kindly proceed with the payment',
                });
            }
        }

        // Generate a unique order ID
        const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();

        // Push items into the `order` array
        const newOrder = {
            orderId,
            items, // Add the items from the request
            totalPrice: items.reduce((total, item) => total + item.price * item.quantity, 0), // Calculate total price
            payment: 'Pending', // Placeholder for payment method
            address: 'TBD', // Placeholder for address
            status: 'Pending'
        };

        user.order.push(newOrder); // Push the new order into the user's `order` array
        await user.save(); // Save the updated user document

        return res.status(200).json({
            message: 'Medicine added successfully to orders',
            order: newOrder,
        });
    } catch (error) {
        console.error('Error adding items to order:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const finaladdress = async (req, res) => {
    const { id, orderid, address } = req.body;

    // Validate the request
    if (!id || !orderid || !address) {
        return res.status(400).json({ error: 'User ID, Order ID, and Address are required' });
    }

    try {
        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the order by orderid in the user's order array
        const orderIndex = user.order.findIndex(order => order.orderId === orderid);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the address field
        user.order[orderIndex].address = address;

        // Save the updated user document
        await user.save();

        return res.status(200).json({
            message: 'Address added successfully',
            updatedOrder: user.order[orderIndex],
        });
    } catch (error) {
        console.error('Error updating address:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const finalpayment = async (req, res) => {
    const { id, orderid, payment } = req.body;

    // Validate the request
    if (!id || !orderid || !payment) {
        return res.status(400).json({ error: 'User ID, Order ID, and payment are required' });
    }

    try {
        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the order by orderid in the user's order array
        const orderIndex = user.order.findIndex(order => order.orderId === orderid);

        if (orderIndex === -1) {
            return res.status(404).json({ error: 'Order not found' });
        }

        // Update the address field
        user.order[orderIndex].payment = payment;
        user.order[orderIndex].status = "Booked";

        // Save the updated user document
        await user.save();

        return res.status(200).json({
            message: 'Payment successfull!',
            updatedOrder: user.order[orderIndex],
        });
    } catch (error) {
        console.error('Error updating address:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }

}

const deletecartItems = async (req, res) => {
    const { id } = req.body;

    // Validate the request
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Find the user by ID
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Clear the `orderedmedicines` array
        user.orderedmedicines = []; // Set the array to an empty array

        // Save the updated user document
        await user.save();

        return res.status(200).json({ message: 'Ordered medicines have been cleared successfully.' });
    } catch (error) {
        console.error('Error clearing ordered medicines:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

const doctorchatbotfetchdata = async (req, res) => {
    const { doctorspecialist } = req.body;
    console.log("Specialist:", doctorspecialist);

    try {
        const doctors = await Doctor.find({ specialist: doctorspecialist });

        return res.status(200).json({ doctors }); // ✅ send to frontend
    } catch (error) {
        console.error("Error fetching doctors:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const uploadPrescriptionFile = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Here you would typically save the file to a storage service (like AWS S3, Cloudinary, etc.)
        // For now, we'll simulate approval/rejection randomly
        const isApproved = Math.random() > 0.5; // 50% chance of approval

        // You could save the file path to the user's record
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Add prescription record to user
        user.prescriptions = user.prescriptions || [];
        user.prescriptions.push({
            fileName: req.file.originalname,
            filePath: req.file.path, // In real implementation, this would be the uploaded file URL
            uploadedAt: new Date(),
            status: isApproved ? 'approved' : 'rejected'
        });

        await user.save();

        return res.status(200).json({
            message: isApproved ? 'Prescription approved' : 'Prescription rejected',
            status: isApproved ? 'approved' : 'rejected'
        });
    } catch (error) {
        console.error('Error uploading prescription:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const createStoreApprovalRequest = async (req, res) => {
    try {
        const {
            storeName,
            ownerName,
            countryCode,
            mobile,
            email,
            licenceNumber,
            gstNumber,
            city,
            address,
            state,
            pincode,
        } = req.body;

        if (!storeName || !ownerName || !mobile || !email || !licenceNumber || !city || !address || !state || !pincode) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide all required store details' });
        }

        if (!req.file) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Store licence document is required' });
        }

        const existingPending = await StoreApprovalRequest.findOne({
            $or: [{ email }, { licenceNumber }],
            status: 'pending',
        });

        if (existingPending) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                message: 'A pending store approval request already exists for this email or licence number',
            });
        }

        const requestPayload = {
            storeName,
            ownerName,
            countryCode: countryCode || '+91',
            mobile,
            email,
            licenceNumber,
            gstNumber: gstNumber || '',
            city,
            address,
            state,
            pincode,
            licenceDocument: {
                fileName: req.file.originalname,
                filePath: req.file.path,
                mimeType: req.file.mimetype,
            },
        };

        const createdRequest = await StoreApprovalRequest.create(requestPayload);

        return res.status(StatusCodes.CREATED).json({
            message: 'Store approval request submitted successfully',
            request: createdRequest,
        });
    } catch (error) {
        console.error('Error creating store approval request:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to submit store approval request' });
    }
};

const getStoreApprovalRequests = async (req, res) => {
    const adminAccess = verifyAdminRequest(req);
    if (!adminAccess.ok) {
        return res.status(adminAccess.status).json({ message: adminAccess.message });
    }

    try {
        const status = req.query.status;
        const filter = status ? { status } : {};

        const requests = await StoreApprovalRequest.find(filter).sort({ createdAt: -1 });

        return res.status(StatusCodes.OK).json({ success: true, requests });
    } catch (error) {
        console.error('Error fetching store approval requests:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to fetch store approval requests' });
    }
};

const reviewStoreApprovalRequest = async (req, res) => {
    const adminAccess = verifyAdminRequest(req);
    if (!adminAccess.ok) {
        return res.status(adminAccess.status).json({ message: adminAccess.message });
    }

    try {
        const { id } = req.params;
        const { status, reviewNotes = '' } = req.body;

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid review status' });
        }

        const updatedRequest = await StoreApprovalRequest.findByIdAndUpdate(
            id,
            {
                status,
                reviewNotes,
                reviewedAt: new Date(),
            },
            { new: true },
        );

        if (!updatedRequest) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Store approval request not found' });
        }

        //Adding the new Store and deleting the existing approval request
        const request = await StoreApprovalRequest.findById(id);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        let createdStore = null;
        if (status === 'approved') {
            const plainPassword = Math.random().toString(36).slice(-8);
            createdStore = await Store.create({
                storeName: request.storeName,
                ownerName: request.ownerName,
                countryCode: request.countryCode,
                mobile: request.mobile,
                email: request.email,
                password: plainPassword,
                licenceNumber: request.licenceNumber,
                gstNumber: request.gstNumber,
                city: request.city,
                address: request.address,
                state: request.state,
                pincode: request.pincode,
                licenceDocument: request.licenceDocument,
                status: 'Active',
            });
            await StoreApprovalRequest.findByIdAndDelete(id);
        }
        //Will use Twilio SendGrid or Nodemailer to send email notification to the store owner about the review outcome
        // await sendStoreEmail(updatedRequest.email, status);

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Store request ${status}`,
            request: updatedRequest,
        });
    } catch (error) {
        console.error('Error reviewing store approval request:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to review store approval request' });
    }
};

const getAllStores = async (req, res) => {
    const adminAccess = verifyAdminRequest(req);
    if (!adminAccess.ok) {
        return res.status(adminAccess.status).json({ message: adminAccess.message });
    }

    try {
        const stores = await Store.find().sort({ createdAt: -1 });

        if (!stores || stores.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({
                message: 'No stores found'
            });
        }
        return res.status(StatusCodes.OK).json({
            success: true,
            count: stores.length,
            stores,
        });
    } catch (error) {
        console.error('Error fetching stores:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to fetch stores'
        });
    }
};

const updateStoreStatus = async (req, res) => {
    const adminAccess = verifyAdminRequest(req);
    if (!adminAccess.ok) {
        return res.status(adminAccess.status).json({ message: adminAccess.message });
    }

    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid store status' });
        }

        const updatedStore = await Store.findByIdAndUpdate(
            id,
            { status },
            { new: true },
        );

        if (!updatedStore) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: 'Store not found' });
        }

        return res.status(StatusCodes.OK).json({
            success: true,
            message: `Store status updated to ${status}`,
            store: updatedStore,
        });
    } catch (error) {
        console.error('Error updating store status:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            message: 'Failed to update store status'
        });
    }
};

const addStore = async (req, res) => {  
    try {   
        const { storeName, ownerName, countryCode, mobile, email, password, licenceNumber, gstNumber, city, address, state, pincode, licenceDocument } = req.body;

        if (!storeName || !ownerName || !mobile || !email || !licenceNumber || !city || !address || !state || !pincode) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'Please provide all required store details' });
        }

        const existingStore = await Store.findOne({ email });
        if (existingStore) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: 'A store with this email already exists' });
        }

        const plainPassword = Math.random().toString(36).slice(-8); // Generate a random 8-character password
        const newStore = new Store({
            storeName,
            ownerName,
            countryCode: countryCode || '+91',
            mobile,
            email,
            password: plainPassword,
            licenceNumber,
            gstNumber: gstNumber || '',
            city,
            address,
            state,
            pincode,
            licenceDocument,
            status: 'Active',
        });

        await newStore.save();

        return res.status(StatusCodes.CREATED).json({ message: 'Store added successfully', store: newStore });
    } catch (error) {
        console.error('Error adding store:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to add store' });
    }   
}

module.exports = {
    signUp, signIn, fetchData, UpdateDoctorProfile, adminsignIn, AdminfetchData, doctorListAssigned, updatedoctorstatus
    , fetchupdateddoctors, updateavailability, fetchavailableslots, confirmslot, getnames, linkgiven, uploadpres, confirmstatus, UpdatePatientProfile, fetchDoctors, fetchpharmacymedicines, updateorderedmedicines, updatecartquantity, addmedicinetodb, decreaseupdatecartquantity, deletemedicine, finalitems, finaladdress, finalpayment, deletecartItems, doctorchatbotfetchdata, uploadPrescriptionFile, createStoreApprovalRequest, getStoreApprovalRequests, reviewStoreApprovalRequest, getAllStores, updateStoreStatus, addStore, getUserNotificationPreferences, updateUserNotificationPreferences
};