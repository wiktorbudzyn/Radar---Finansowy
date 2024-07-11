const router = require("express").Router();
const { User, validateRegistration } = require("../models/user");
const bcrypt = require("bcrypt");
const auth = require("../middleware/auth");
const Joi = require("joi");
const multer = require("multer");


// Konfiguracja multer dla obsługi przesyłania plików
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/avatars/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });


// Zmiana avatara użytkownika
router.post(
    "/change-avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        try {
            const user = await User.findById(req.user.id);

            if (!user) {
                return res.status(404).json({ message: "Użytkownik nie znaleziony" });
            }

            if (!req.file) {
                return res.status(400).send({ message: "Nie przesłano pliku" });
            }

            user.avatar = req.file.path;
            await user.save();

            res.status(200).send({ message: "Avatar został zmieniony pomyślnie" });
        } catch (error) {
            console.error("Błąd podczas zmiany avatara:", error.message);
            res.status(500).send({ message: "Wewnętrzny błąd serwera" });
        }
    }
);


// Rejestracja nowego użytkownika
router.post("/", async (req, res) => {
    try {
        const { error } = validateRegistration(req.body);
        if (error)
            return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res
                .status(409)
                .send({ message: "Użytkownik o podanym adresie e-mail już istnieje!" });

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);
        const defaultAvatarPath = "./uploads/avatars/1700417842428-avatar.png";

        await new User({
            ...req.body,
            password: hashPassword,
            avatar: defaultAvatarPath,
        }).save();
        res.status(201).send({ message: "Użytkownik został utworzony pomyślnie" });
    } catch (error) {
        res.status(500).send({ message: "Wewnętrzny błąd serwera" });
    }
});


// Pobieranie danych zalogowanego użytkownika
router.get("/user-data", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");

        if (!user) {
            return res.status(404).json({ message: "Użytkownik nie znaleziony" });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: "Wewnętrzny błąd serwera" });
    }
});


// Zmiana hasła użytkownika
router.post("/change-password", auth, async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;
        const user = await User.findById(req.user.id);

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
            return res
                .status(400)
                .send({ message: "Obecne hasło jest nieprawidłowe" });
        }

        if (newPassword !== confirmPassword) {
            return res
                .status(400)
                .send({ message: "Nowe hasła nie pasują do siebie" });
        }

        const passwordSchema = Joi.string()
            .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)(?=.*\w).{8,}$/)
            .required()
            .messages({
                "string.pattern.base":
                    "Hasło musi zawierać co najmniej 1 dużą literę, 1 symbol, 1 cyfrę i mieć co najmniej 8 znaków",
                "any.required": "Hasło jest wymagane",
            })
            .label("Hasło");

        const { error } = passwordSchema.validate(newPassword);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashPassword;
        await user.save();

        res.status(200).send({ message: "Hasło zostało pomyślnie zmienione" });
    } catch (error) {
        console.error("Błąd podczas zmiany hasła:", error.message);
        res.status(500).send({ message: "Wewnętrzny błąd serwera" });
    }
});

module.exports = router;