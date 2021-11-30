const express = require("express")
const router = express.Router()
const cartServiceLayer = require("../services/cart")


router.get("/", async (req,res) => {
    let cartItems = await cartServiceLayer.displayCartItems(1) // replace  1 with userId
    console.log(cartItems.toJSON())
    res.render("cart/index", {
        cartItems: cartItems.toJSON()
    })
})

router.get("/:productSlotId/add-item", async (req,res) => {
    await cartServiceLayer.addToCart(1, req.params.productSlotId) //change to user id
    res.redirect("/cart")
    console.log("added successfully")
})

router.get("/:productSlotId/delete-item", async(req,res)=>{
    await cartServiceLayer.deleteItemFromCart(1, req.params.productSlotId)
    res.redirect("/cart")
})

router.get("/:productSlotId/delete-one", async(req,res)=>{
    await cartServiceLayer.removeOneQuantityFromCart(1, req.params.productSlotId)
    res.redirect("/cart")
})

router.get("/:productSlotId/add-one", async(req,res)=>{
    await cartServiceLayer.addOneQuantityToCart(1, req.params.productSlotId)
    res.redirect("/cart")
})


module.exports = router