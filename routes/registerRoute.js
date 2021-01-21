const router = require('express').Router()
const { check, validationResult } = require('express-validator');
const User = require('../models/Users');
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');


router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.json({users});
    } catch(err) {
        res.status(400).json({err});
    }
})

router.get("/:id", async (req, res) => {
    console.log('idto');
    try {
        const korisnik = await User.findById(req.params.id);
        res.json({korisnik});
    }

    catch (err) {
        res.status(400).json({err});
    }
})


router.post('/users', async (req, res) => {
    try {
        if (req.body.users) {
            console.log('ete korisnici');
            let userIds = req.body.users;
            console.log(userIds);
            userIds = userIds.split(",");
            console.log(userIds);
            const users = await User.find({
                _id: {$in: userIds}
            });
            res.json({users});
        } else {
            res.status(400).json({err: "Невалиден корисник"});
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
})

router.post('/', [
    check('email', 'Внесената email адреса не е валидна').isEmail(),
    check('lozinka', 'Лозинката треба да биде подолга од 6 карактери').isLength({min: 6}),
    check('ime', 'Внесеното име не е валидно').isLength({min: 1}),
    check('prezime', 'Внесеното презиме не е валидно').isLength({min: 1}),
    check('telefon', 'Внесениот телефонски број не е валиден').isLength({min: 6}),
    
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()})
    } else {

        const { email, lozinka, telefon, ime, prezime } = req.body;

        try {
            let user = await User.findOne({email});
            if (user) {
                res.status(400).json({errors: {msg: 'Корисникот е веќе регистриран'}});
            } else {
                user = new User({
                    ime,
                    prezime,
                    email,
                    telefon, 
                    lozinka
                })
        
                const salt = await bcrypt.genSalt(10);
                user.lozinka = await bcrypt.hash(lozinka, salt);
        
                await user.save();
        
                const payload = {
                    id: user._id
                }
        
                jwt.sign(payload, process.env.SECRET, {
                    expiresIn: 3600
                }, (err, token) => {
                    if (err) throw err
                    res.send({token});
                });
            }
    
        } catch (err) {
            console.log(err);   
            res.status(400).send({err});
        }
    
    }


})

module.exports = router;