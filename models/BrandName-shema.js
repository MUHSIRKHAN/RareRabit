const mongoose = require('mongoose')

const brandNameSchema = new mongoose.Schema({

    brandName: {
        type: String,
        required: true,
        unique:true
    },default:{
        type:Boolean,
      default:false, 
    }
},

)

const brandModel = mongoose.model('brandName', brandNameSchema)
module.exports = brandModel