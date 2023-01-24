const mongoose=require('mongoose')
const productSchema=new mongoose.Schema(
    {
        brandname: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'brandName'
            // required: true
        },
        price: {
            type: Number,
            // required: true
        },
        description: {
            type: String,
            // required: true
        },
        color: {
            type: String,
            // required: true
        },
        size: {
            type: String,
            // required: true
        },
        gender: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'Gender_Type'
            // required: true
        },
        brandname: {
            type: mongoose.Schema.Types.ObjectId,
            ref:'brandName'
            // required: true
        },
        
        imagesDetails: {
            type:Array,
            // required:true
        },
        quantity:{
            type:Number,
            // required:true
        }, deleteProduct: { 
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
)

const productModel = mongoose.model('Products',productSchema)
module.exports = productModel

