const express = require('express');
const route = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check,validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../model/Users');
// @route   POST api/users
// @desc    Register Users
// @access  PUBLIC

route.post('/',[
    check('first','First Name is required').not().isEmpty(),
    check('last','Last Name is required').not().isEmpty(),
    check('email','Please Enter a valid email').isEmail(),
    check('password','Please Enter a valid password with min length 3').isLength({'min': 3})
],
async (req,res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    const {first,last,email,password} = req.body;
    try {
        // see if user exist or not
        let user = await User.findOne({email});
        
        if(user) {
            return res.status(400).json({error:[{'message':'User Alreday Exist'}]});
        }

        //get User Gravtar
        const avatar = gravatar.url(email,{
            s: '200',
            r: 'pg',
            d: 'mm'
        });
        
        user = new User({
            first,
            last,
            email,
            avatar,
            password
        })
        //Encrypt Password
        const salt = await bcrypt.genSalt(10);

        user.password = await bcrypt.hash(password,salt);

        await user.save();

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