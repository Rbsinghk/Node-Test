const userSchema = require('../models/user');
const bcrypt = require('bcrypt');
const joi = require('joi');
const axios = require('axios');

const register = async (req, res) => {
    try {
        const schema = joi.object({
            name: joi.string().min(3).optional().label("name"),
            email: joi.string().required().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
            password: joi.string().min(6).max(20).required().label("password"),
            number: joi.string().regex(/^[0-9]{10}$/).messages({ 'string.pattern.base': `Phone number must have 10 digits.` }).optional(),
        })
        const { error } = schema.validate(req.body)
        if (error) {
            res.json({ message: error.message, isSuccess: false })
        } else {
            var number = req.body.number;
            const userMail = (req.body.number == undefined) ? false : await userSchema.findOne({ number });
            if (userMail) {
                res.send({ message: 'Number Already Exists', isSuccess: false });
            } else {
                const newuser = new userSchema(req.body);
                newuser.save()
                    .then(() => res.status(201).json({ message: "Register successfully", isSuccess: true }))
                    .catch((error) => {
                        if (error.code === 11000) {
                            res.send({ message: 'Email Already Exists', isSuccess: false });
                        } else {
                            res.send({ error, isSuccess: false });
                        }
                    });
            }
        }
    } catch (error) {
        res.json({ message: error.message, isSuccess: false })
    }
}

const login = async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let number = req.body.number;
        const userMail = await userSchema.findOne({ email }) || await userSchema.findOne({ number });
        const isMatch = await bcrypt.compare(password, userMail.password);
        const token = await userMail.generateAuthToken();
        if (isMatch) {
            res.status(201).send({ message: "Login Success", data: token, isSuccess: true })
        }
        else {
            res.json({ message: "Invalid Username or Password", isSuccess: false });
        }
    } catch (error) {
        res.json({ message: "Invalid Username or Password", isSuccess: false });
    }
}

const getProfile = async (req, res) => {
    try {
        const _id = req.user._id;
        const getProfile = await userSchema.findById(_id)
        if (getProfile == null) {
            res.send({ messgae: "Invalid User Id", isSuccess: false });
        } else {
            res.send({ getProfile, isSuccess: true })
        }
    } catch (error) {
        res.send({ messgae: "Invalid User Id", isSuccess: false });
    }
}

const logout = async (req, res) => {
    try {
        delete req.user
        res.status(201).send({ message: "Logout SuccessFully", isSuccess: true })
    } catch (error) {
        res.send({ message: "Invalid Email", isSuccess: false });
    }
}

const getJokes = async (req, res) => {
    try {
        const data = await axios.get("https://api.chucknorris.io/jokes/random")
        res.send({ "Joke": data.data, isSuccess: true })
    } catch (error) {
        res.send({ messgae: "Invalid User Id", isSuccess: false });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    logout,
    getJokes
}