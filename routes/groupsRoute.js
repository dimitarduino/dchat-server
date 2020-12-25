const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const { mongoose } = require('mongoose');
const Group = require('../models/Groups');

router.get('/', async (req, res) => {
    try {
        if (req.query.korisnici) {
            let korisniciIds = req.query.korisnici;
            korisniciIds = korisniciIds.split(",");
            console.log(korisniciIds);
            const grupi = await Group.find({
                korisnici: {$in: korisniciIds}
            });
            res.json({grupi});
        } else {
            res.status(400).json({err: "Невалиден корисник"});
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
})

router.post("/:id", async (req, res) => {
    try {
        let grupaEdit = await Group.findById(req.params.id);

        if (grupaEdit) {
            if (!!req.body.ime) grupaEdit.ime = req.body.ime;
            if (!!req.body.korisnici) {
                // let korisniciArr = korisnici.split(",");

                // korisniciArr.map(korisniciArr => korisniciArr.trim());
                grupaEdit.korisnici = req.body.korisnici;
            }

            try {
                await grupaEdit.save();

                res.json(grupaEdit);
            } catch (err) {
                res.status(400).json({errors: [{
                    "msg": err.message
                }]})
            }
        } else {
            res.status(400).json({errors: [{'msg': 'Групата не е пронајдена.'}]});
        }
    } catch (err) {
        res.status(400).json({err});
    }
})

router.post('/', [
    check('korisnici', 'Внесената листа на корисници не е валидна'),
    check('ime', 'Внесеното име не е валидна').isLength({ min: 3 })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()})
    } else {
        try {
            const { korisnici, ime } = req.body;
            // console.log();
            let korisniciArr = korisnici.split(",");

            korisniciArr.map(korisnik => korisnik.trim());

            let grupa = new Group({
                korisnici: korisniciArr,
                ime,
                poslednaPoraka: new Date().getTime()
            })
    
            await grupa.save();
    
            res.status(200).json({
                msg: "Групата е успешно направена.",
                grupa
            })
        } catch (err) {
            console.log(err);
            res.status(400).json({err});
        }
    }
})

module.exports = router;