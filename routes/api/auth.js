const express = require('express');
const route = express.Router();
const auth = require('../../middleware/auth');
const User = require('../../model/Users');
const jwt = require('jsonwebtoken');
const config = require('config');
const {check,validationResult} = require('express-validator/check');
const bcrypt = require('bcryptjs');

// @route   GET api/auth
// @desc    Test Route
// @access  PUBLIC

route.get('/',auth, async (req,res)=>{
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error")
        
    }
});

// @route   POST api/auth
// @desc    Authenticat Users & get Token
// @access  PUBLIC

route.post('/',[
    check('email','Please Enter a valid email').isEmail(),
    check('password','Password is Required').exists()
],
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    const {email,password} = req.body;
    try {
        // see if user exist or not
        let user = await User.findOne({email});
        
        if(!user) {
            return res.status(400).json({error:[{'message':'Invalid Credentials'}]});
        }

        //compare password 
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch) {
            return res.status(400).json({error:[{'message':'Invalid Credentials'}]});
        }
       //Return JSON WEB TOKEN
        const payload = {
            user : {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn:360000},
            (err,token) => {
                if(err) throw err;
                res.json({token});
            }
        )
        //res.send('User Registered');
    } catch(ex) {
        console.error(ex.message);
        res.status(500).send('server error');
        
    }

});
module.exports = route;