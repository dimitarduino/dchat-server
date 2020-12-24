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

module.exports = router;