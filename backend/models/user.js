const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const { userSchema } = require("./userSchema");

userSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({ _id: this._id }, process.env.JWTPRIVATEKEY, {
        expiresIn: "7d",
    });
    return token;
};

const User = mongoose.model("User", userSchema);

const validateRegistration = (data) => {
    const schema = Joi.object({
        firstName: Joi.string().required().label("Imię"),
        lastName: Joi.string().required().label("Nazwisko"),
        email: Joi.string().email().required().label("Email"),
        password: Joi.string()
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?=.*\w).{8,}$/)
            .required()
            .messages({
                "string.pattern.base": "Hasło musi zawierać co najmniej 1 dużą literę, 1 symbol, 1 cyfrę i mieć co najmniej 8 znaków",
                "any.required": "Hasło jest wymagane",
            })
            .label("Hasło"),
    });

    return schema.validate(data, { abortEarly: false });
};

module.exports = { User, validateRegistration };