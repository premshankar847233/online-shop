const mongoose  = require('mongoose');

const productSchema = new mongoose.Schema({
    name:{
        type : String,
        required:[true,'please enter product name'],
        trim:true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    price:{
        type: Number,
        required: [true,'Please Enter Product price'],
        maxlength : [5,'Product value can not excedd 5 character'],
        default: 0.0
    },
    description:{
        type: String,
        required:[true,'please enter product description'],
    },
    ratings:{
        type:Number,
        default: 0
    },
    imges:[
        {
            public_id:{
                type: String,
                required:true
            },
            url:{
                type:String,
                required:true
            }
        }
    ],
    category:{
        type: String,
        required:[true,'please select category of products'],
        enum:{
            values:[
                'Electronics',
                'Cameras',
                'Laptops',
                'Accessories',
                'Headphones',
                'Food',
                'Books',
                'Clothes/Shoes',
                'Beauty/Health',
                'Sports',
                'Outdoor',
                'Home'
            ],
            message:'Please select correct ctegory for products'
        }
    },
    seller:{
        type:String,
        required:[true,'Please enter product seller']
    },
    stock:{
        type:Number,
        required:[true,'please enter product stock'],
        maxlength:[5,'Product name cannot exceed 5 characters'],
        default:0
    },
    numofReviews:{
        type:Number,
        default:0
    },
    reviews:[
        {
            name:{
                type:String,
                required:true
            },
            rating:{
                type:Number,
                required:true,
            },
            comment:{
                type:String,
                required:true
            }
        }
    ],
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required:true
    },
    createdAt:{
        type : Date,
        default:Date.now
    }
});

module.exports = mongoose.model('product',productSchema);