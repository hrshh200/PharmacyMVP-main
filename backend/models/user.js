const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
   name: {
      type: String,
      require: true,
      unique: true,
   },
   salutation: {
      type: String,
   },
   firstName: {
      type: String,
   },
   middleName: {
      type: String,
   },
   lastName: {
      type: String,
   },
   storeName: {
      type: String,
   },
   ownerName: {
      type: String,
   },
   licenceNumber: {
      type: String,
   },
   gstNumber: {
      type: String,
   },
   email: {
      type: String,
      require: true,
      unique: true,
   },
   countryCode: {
      type: String,
   },
   address: {
      type: String,
      require: true,
   },
   city: {
      type: String,
   },
   mobile: {
      type: String,
      require: true,
   },
   state: {
      type: String,
   },
   pincode: {
      type: String,
   },
   weight: {
      type: Number,
      require: true,
   },
   dob: {
      type: String,
      require: true,
   },
   height: {
      type: Number,
      require: true,
   },
   sex: {
      type: String,
      require: true,
   },
   bloodgroup: {
      type: String,
      require: true,
   },
   password: {
      type: String,
      require: true
   },
   appointments: [{ regNo: String, slot: String }],
   hash_password: {
      type: String,
      require: true
   },
   confirm: {
      type: [
         {
            confirm: { type: Boolean, required: true },
            regNo: { type: Number, required: true }
         }
      ],
      default: []
   },
   link: [
      {
         link: { type: String, required: true }, // URL of the link
         regNo: { type: Number, required: true } // Registration number
      }
   ],
   medicines: {
      type: [[{
         regNo: { type: Number, required: true },
         name: { type: String, required: true },
         type: { type: String, required: true },
         description: { type: String, required: true }
      }]],
      default: [] // Initialize as an empty array
   },
   orderedmedicines: {
      type: [
        {
          medicine: { type: String, required: true },
          quantity: {type: Number, required: true},
          price: {type: Number, required: true}
        },
      ],
      default: [], // Default to an empty array
    },

   order: {
      type: [
        {
          orderId: { type: String, required: true },
          items: [
            {
              id: { type: String, required: true }, // Unique identifier for each item
              name: { type: String, required: true },  // Name of the item
              quantity: { type: Number, required: true }, // Quantity ordered
              price: { type: Number, required: true }, // Price of the individual item
            },
          ],
          totalPrice: { type: Number, required: true }, // Total price for the order
          payment: { type: String, required: true }, // Payment method
          address: { type: String, required: true }, // Delivery address
          status: {type: String, required: true}
        },
      ],
      default: [], // Default to an empty array
   },
   prescriptions: {
      type: [
        {
          fileName: { type: String, required: true },
          filePath: { type: String, required: true },
          uploadedAt: { type: Date, default: Date.now },
          status: { type: String, enum: ['approved', 'rejected', 'pending'], default: 'pending' }
        }
      ],
      default: []
   },
}, { timestamps: true });
//For get fullName from when we get data from database

// userSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

userSchema.method({
   async authenticate(password) {
      return bcrypt.compare(password, this.password);
   },
});
module.exports = mongoose.model("User", userSchema);