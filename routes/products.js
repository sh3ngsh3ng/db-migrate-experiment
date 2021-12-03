const express = require("express")
const router = express.Router()
const {Product, ProductSlot} = require("../models")
const {bootstrapField, createProductForm, createAddSessionForm} = require ("../forms")
const {checkIfAuthenticated, cloudinaryVariables} = require("../middleware")
const productServiceLayer = require("../services/products")


// view all products
router.get("/", checkIfAuthenticated, async (req,res) => {
    let vendor = req.session.vendor.id
    let activeProducts = await productServiceLayer.displayActiveListingsOfVendor(vendor)
    let inactiveProducts = await productServiceLayer.displayInactiveListingsOfVendor(vendor)
    // pass to hbs
    res.render("products/inventory", {
        'activeProducts': activeProducts.toJSON(),
        'inactiveProducts': inactiveProducts.toJSON()
    })
})

// view add product form
router.get('/add', [checkIfAuthenticated, cloudinaryVariables], (req,res)=>{
    const productForm = createProductForm()
    res.render('products/add-product', {
        'form': productForm.toHTML(bootstrapField),
    })
})

// process add product form
router.post('/add', checkIfAuthenticated, async(req,res)=>{
    const productForm = createProductForm()
    productForm.handle(req, {
        'success': async(form) => {
            const product = new Product()

            // product.set(form.data)

            product.set('product_name', form.data.product_name)
            product.set('product_description', form.data.product_description)
            product.set('product_price', form.data.product_price * 100)
            product.set('vendor_id', req.session.vendor.id)
            product.set('product_status', "active")
            product.set('thumbnail_url', form.data.thumbnail_url)
            product.set('image_url', form.data.image_url)
            product.set('room_size', form.data.room_size)
            await product.save()
            req.flash("success_messages", "New Product has been added")
            res.redirect('/products')
        },
        'error': async(form) => {
            req.flash("error_messages", "Please fill up the form properly")
            res.render('products/add-product', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
}) 

// view update product form
router.get('/:product_id/update', [checkIfAuthenticated, cloudinaryVariables], async (req, res) => {
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    })

    const productForm = createProductForm()

    productForm.fields.product_name.value = product.get('product_name')
    productForm.fields.product_description.value = product.get('product_description')
    productForm.fields.product_price.value = product.get('product_price')
    productForm.fields.room_size.value = product.get("room_size")

    res.render("products/update-product", {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})


// process update product form
router.post("/:product_id/update", checkIfAuthenticated, async(req,res) => {
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    const productForm = createProductForm()
    productForm.handle(req, {
        'success': async(form) => {
            product.set(form.data)
            product.save()
            res.redirect("/products")
        },
        'error': async(form) => {
            res.render("products/update-product", {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
})

// view for deletion of product
router.get("/:product_id/delete", checkIfAuthenticated, async(req,res)=> {
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    res.render('products/delete-product', {
        'product': product.toJSON()
    })
})


// process deletion of product
router.post("/:product_id/delete", checkIfAuthenticated, async(req,res)=>{
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    })

    await product.destroy()
    res.redirect("/products")
})


// view sessions page
router.get("/manage-sessions", checkIfAuthenticated, async (req,res)=>{

    let allProductsWithProductSlots = await productServiceLayer.displayAllProductSessionsOfVendor(req.session.vendor.id)
    res.render("products/manage-sessions", {
        'product': allProductsWithProductSlots
    })
})

// view for adding session of product (into product slots table)
router.get("/:product_id/add-session", checkIfAuthenticated, async(req,res)=> {
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    })
    
    const addSessionForm = createAddSessionForm()

    res.render("products/add-session", {
        'product': product.toJSON(),
        'form': addSessionForm.toHTML(bootstrapField)
    })
})

// process adding session of product (into product slots table)
router.post("/:product_id/add-session", checkIfAuthenticated, async(req,res)=> {
    const addSessionForm = createAddSessionForm()

    addSessionForm.handle(req, {
        'success': async (form) => {

            const product = await Product.where({
                'id': req.params.product_id
            }).fetch({
                require: true
            })

            const productSlot = new ProductSlot()
            productSlot.set("slot_datetime", form.data.slot_datetime)
            productSlot.set('slot_availability', true)
            productSlot.set('slot_quantity', product.toJSON().room_size)
            productSlot.set('product_id', req.params.product_id)
            await productSlot.save()
            res.redirect("/products")
        },
        'error': async(form) => {
            const product = await Product.where({
                'id': req.params.product_id
            }).fetch({
                require: true
            })

            // req.flash("error_messages", "Please fill up the form properly")
            res.render(`products/add-session`, {
                'product': product.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })


})


// change product listing to "active"
router.get("/:product_id/add-listing", async (req,res) => {
    let product = await Product.where({
        "id": req.params.product_id
    }).fetch({
        require: false
    })
    product.set("product_status", "active")
    await product.save()
    res.redirect("/products")
    console.log("Listing Added Successfully")
})

router.get("/:product_id/remove-listing", async(req,res)=>{
    let product = await Product.where({
        "id": req.params.product_id
    }).fetch({
        require: false
    })
    product.set("product_status", "inactive")
    await product.save()
    res.redirect("/products")
    console.log("Listing Removed Successfully")
})


module.exports = router