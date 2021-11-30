const {CartItems} = require("../models")


const getAllCartItems = async(userId) => {
    return await CartItems.collection().where({
        "user_id": userId // change to user id for frontend
    }).fetch({
        require: false,
        withRelated: ['productslot']
    })
}

const getSpecificCartItems = async (userId, productSlotId) => {
    return await CartItems.where({
        'user_id': userId,
        'product_slots_id': productSlotId
    }).fetch({
        require: false
    })
}

const addCartItems = async(userId, productSlotId) => {
    let cartItem = new CartItems({
        'user_id': userId,
        'cart_items_quantity': 1,
        'product_slots_id': productSlotId
    })
    await cartItem.save()
    return cartItem
}

const plusOneCartItem = async(userId, productSlotId) => {
    let cartItem = await CartItems.where({
        "user_id": userId,
        "product_slots_id": productSlotId
    }).fetch({
        require: false
    })
    cartItem.set('cart_items_quantity', cartItem.get('cart_items_quantity') + 1)
    await cartItem.save()
}

module.exports = {getAllCartItems, getSpecificCartItems, addCartItems, plusOneCartItem}