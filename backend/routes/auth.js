const router = require("express").Router();
const { User } = require("../models/user");
const bcrypt = require("bcrypt");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (!user)
            return res.status(401).send({ message: "Nieprawidłowy e-mail lub hasło" });

        const validPassword = await bcrypt.compare(
            req.body.password,
            user.password
        );
        if (!validPassword)
            return res.status(401).send({ message: "Nieprawidłowy e-mail lub hasło" });

        const tokenPayload = {
            id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
        };

        const token = jwt.sign(tokenPayload, process.env.JWTPRIVATEKEY, {
            expiresIn: "7d",
        });

        res.status(200).send({
            data: {
                token: token,
                user: tokenPayload,
            },
            message: "Zalogowano pomyślnie"
        });
    } catch (error) {
        res.status(500).send({ message: "Wewnętrzny błąd serwera" });
    }
});

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Hasło"),
    });
    return schema.validate(data);
};

module.exports = router;
