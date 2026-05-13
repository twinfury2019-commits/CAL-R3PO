const mongoose = require('mongoose');

const licenseSchema = new mongoose.Schema({
  cnic: {
    type:     String,
    required: [true, 'CNIC is required'],
    trim:     true,
    match:    [/^\d{13}$/, 'CNIC must be exactly 13 digits with no dashes']
  },
  name: {
    type:     String,
    required: [true, 'Name is required'],
    trim:     true
  },
  fatherName: {
    type:     String,
    required: [true, 'Father name is required'],
    trim:     true
  },
  address: {
    type:     String,
    required: [true, 'Address is required'],
    trim:     true
  },
  licenseNo: {
    type:     String,
    required: [true, 'License number is required'],
    unique:   true,
    trim:     true,
    uppercase: true
  },
  weaponNo: {
    type:     String,
    required: [true, 'Weapon number is required'],
    trim:     true,
    uppercase: true
  },
  weaponType: {
    type:     String,
    required: [true, 'Weapon type is required'],
    trim:     true
  },
  issueDate: {
    type:     Date,
    required: [true, 'Issue date is required']
  },
  expiryDate: {
    type:     Date,
    required: [true, 'Expiry date is required']
  },
  licenseType: {
    type:     String,
    enum:     ['Balochistan', 'All Pakistan'],
    required: [true, 'License type is required']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref:  'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('License', licenseSchema);
