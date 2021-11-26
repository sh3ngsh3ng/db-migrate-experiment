const express = require("express")
const router = express.Router()
const {Vendor} = require("../models")

const {createRegistrationForm, createLoginForm, bootstrapField} = require("../forms")

// display vendor sign up form
router.get("/sign-up", (req,res) => {
    const registerForm = createRegistrationForm()
    res.render("login-su/sign-up", {
        'form': registerForm.toHTML(bootstrapField)
    })
})


// process vendor sign up form
router.post("/sign-up", (req,res) => {
    const registerForm = createRegistrationForm()
    registerForm.handle(req, {
        'success': async(form) => {
            const vendor = new Vendor({
                'vendor_name': form.data.vendor_name,
                'vendor_phone': form.data.vendor_phone,
                'vendor_email': form.data.vendor_email,
                'username': form.data.username,
                'password': form.data.password
            })

            await vendor.save()
            req.flash("success_messages", "You have signed up successfully!")
            res.redirect("/login")
        },
        'error': (form) => {
            res.render("login-su/sign-up", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// view vendor login form
router.get("/login", (req,res) => {
    const loginForm = createLoginForm()
    res.render("login-su/login", {
        'form': loginForm.toHTML(bootstrapField)
    })
})


// process vendor login form
router.post("/login", (req,res) => {
    const loginForm = createLoginForm()
    loginForm.handle(req, {
        'success': async (form) => {
            let vendor = await Vendor.where({
                'username': form.data.username
            }).fetch({
                require: false
            })

            if (!vendor) {
                req.flash("error_messages", "Login Failed. Please try again.")
                res.redirect("/login")
            } else {
                // user found (login success + fail)
                if (vendor.get("password") === form.data.password) {
                    // to store details in session file
                    req.session.vendor = {
                        id: vendor.get("id"),
                        username: vendor.get('username'),
                        email: vendor.get('vendor_email')
                    }
                    req.flash("success_messages", "You have logged in successfully! " + vendor.get("username"))
                    res.redirect("/user/profile")
                } else {
                    req.flash("error_messages", "Login Failed. Please try again")
                    res.redirect("/login")
                }
                
            }

        },
        'error': async(form) => {
            req.flash("error_messages", "Login Failed. Please try again")
            res.render("login-su/login", {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

module.exports = router