const router = require('express').Router()
const { check, validationResult } = require('express-validator');
const User = require('../models/Users');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth')

router.get("/", auth, async (req, res) => {
    try {
        // console.log(req.user.id);
        const user = await User.findById(req.user.id).select("-lozinka");
        // console.log(user);
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            msg: `Greshka: ${err.message}`
        });
    }
})

//promeni lozinka
router.post("/:id", async (req, res) => {
    const userId = req.params.id;
    var { oldPassword, newPassword, confirmPassword } = req.body;


    if (oldPassword && newPassword && confirmPassword) {
        const user = await User.findById(userId);

        if (user) {
                const match = await bcrypt.compare(oldPassword, user.lozinka);
        
                if (!match) {
                    res.status(400).json({ msg: "Внесената лозинка не е точна!" });
                } else {
                    if (newPassword != confirmPassword) {
                        res.status(400).json({ msg: "Лозинките не се совпаѓаат!" });
                    } else {
                        if (newPassword.trim().length < 6) {
                            res.status(400).json({ msg: "Лозинката мора да е подолга од 6 карактери!" });
                        } else {
                            const salt = await bcrypt.genSalt(10);
        
                            user.lozinka = await bcrypt.hash(newPassword, salt);
                            await user.save();
        
                            var { ime, prezime, telefon, email, _id } = user;
        
                            res.send({
                                ime, prezime, telefon, email, _id
                            });
        
                        }
                    }
    
            }
        } else {
            res.status(400).json({ msg: "Корисникот не е пронајден" });
        }
    } else {
        res.status(500).send({err: "Невалидни податоци!"});
    }

   
})


router.post('/', [
    check('email', 'Ве молиме внесете валидна email адреса').isEmail(),
    check('lozinka', 'Ве молиме внесете лозинка подолга од 6 карактери').isLength({min: 6})
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
    }

    const { email, lozinka } = req.body;

    try {
        let user = await User.findOne({ email });

        if (!!user == false) {
            res.status(400).json({ errors: { msg: 'Корисникот не е пронајден, Ве молиме регистрирајте се.' } });
        } else {
            const match = await bcrypt.compare(lozinka, user.lozinka);

            if (!match) {
                res.status(400).json({
                    errors: {
                        msg: "Невалидни податоци"
                    }
                })
            }

            const payload = {
                id: user._id
            }

            jwt.sign(payload, process.env.SECRET, {
                expiresIn: 86400
            }, (err, token) => {
               
                if (err) throw err
                res.send({ token });
            });
        }


    } catch (err) {
        res.status(400).send("Server error");
    }
})

router.get("/:email", async (req, res) => {
    try {
        const user = await User.find({email: req.params.email});
        console.log(user);
        if (user && user.length != 0) {
            res.status(200).json({msg: "Корисникот е успешно додаден во вашата група", user: user[0]});
        } else {
            res.status(400).json({msg: "Корисникот не постои во системот!"});
        }
    } catch (err) {
        console.log('ima greska');
        res.status(400).json({msg: "Корисникот не постои во системот!"});
    }
})

module.exports = router;