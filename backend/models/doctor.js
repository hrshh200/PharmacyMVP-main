const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const doctorSchema = new mongoose.Schema({
  regNo: {
    type: Number,
    //  require: true,
    //  unique: true
  },
  name: {
    type: String,
    //   require: true,
    //   unique: true,
  },
  location: {
    type: String,
  },
  address: {
    type: String,
  },
  fees: {
    type: Number,
  },
  hospital: {

  },
  specialist: {
    type: String,
  },
  experience: {
    type: Number,
  },
  assign: {
    type: Boolean,
  },
  status: {
    type: String
  },
  appointments: [{ patientName: String, slot: String }],
  email: {
    type: String,
    //   require: true,
    //   unique: true,
  },
  confirm: {
    type: [
        {
            confirm: { type: Boolean, required: true },
            name: { type: String, required: true }
        }
    ],
    default: []
},
  available: {
    type: [String],
  },
  password: {
    type: String,
    //  require: true
  },
  hash_password: {
    type: String,
    //   require: true
  },
}, { timestamps: true });
//For get fullName from when we get data from database

// userSchema.virtual("fullName").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

doctorSchema.method({
  async authenticate(password) {
    return bcrypt.compare(password, this.password);
  },
});
module.exports = mongoose.model("Doctor", doctorSchema);