const Product = require('../models/product');
const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures');
// create eew Product  => /api/v1/product/new

exports.newProduct = catchAsyncErrors(async(req,res,next) =>{
    req.body.user = req.user.id;
    const product =await Product.create(req.body);

    

    res.status(201).json({
        success:true,
        product
    })
})

//get all products => api/v1/products?keyword=apple
exports.getProducts = catchAsyncErrors(async (req,res,next) =>{

    const resultPerPage = 4;
    const productCount = await Product.countDocuments();
    const apiFeatures = new APIFeatures(Product.find(),req.query)
        .search()
        .filter()
        .pagination(resultPerPage);
    let products = await apiFeatures.query;
    res.status(200).json({
        success : true,
        message : products,
        count:products.length,
        productCount
    })
})

//getting a single products => api/v1/products/:id

exports.getSingleProduct =catchAsyncErrors(async (req,res,next) =>{

    const product = await Product.findById(req.params.id);
    if(!product)
    {
        return next(new ErrorHandler('Products not found',404));
    }

    res.status(200).json({
        success : true,
        product
    })
})

// update product => /api/v1/product/:id

exports.updateProduct = catchAsyncErrors(async(req,res,next)=>{
    let product = await Product.findById(req.params.id);
    if(!product)
    {
        return res.status(404).json({
            success:false,
            message:'Product not found'
        })
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false,
    });

    res.status(200).json({

        success : true,
        product
    })
})

//delete products => /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors(async(req,res,next) =>{

    const product = await Product.findById(req.params.id);

    if(!product)
    {
        return res.status(404).json({
            success: false,
            message:"Product not found"
        })
    }

    await Product.findByIdAndRemove(req.params.id);

    res.status(200).json({
        success:true,
        message:"Product deleted Successfully"
    })
})