const express = require("express")
const router = express.Router()

const userDataLayer = require("../../dal/user")
const {checkIfAuthenticatedJWT} = require("../../middleware")



// user sign up
router.post("/sign-up", express.json(), async(req,res) => {
    let newUser = req.body
    let signUpUser = userDataLayer.userSignUp(newUser)
    res.send({
        "message": "success"
    })
    // send status, react interpret and rnder
})

// user login
router.post("/login", express.json(), async(req,res) => {
    let userField = req.body
    let accessToken = await userDataLayer.userLogin(userField)
    if (accessToken) {
        res.send({
            "accessToken": accessToken,
            "message": "success"
        })
    } else {
        // send status, react interpret and render
        res.send({
            "message": "failed"
        })
    }
    
})




module.exports = router