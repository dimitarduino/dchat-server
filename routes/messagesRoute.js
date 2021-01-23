const router = require('express').Router();
const { check, validationResult } = require('express-validator');
const { mongoose } = require('mongoose');
const Message = require('../models/Messages');
const Group = require('../models/Groups');

router.get('/', async (req, res) => {
    console.log(req.query);
    try {
        if (req.query.grupi) {
            let grupiIds = req.query.grupi;
            grupiIds = grupiIds.split(",");
            console.log(grupiIds);
            const messages = await Message.find({
                grupa: {$in: grupiIds}
            });
            res.json({messages});
        } else {
            res.status(400).json({err: "Внесената група не е валидна"});
        }
    } catch (err) {
        console.log(`Error: ${err}`);
    }
});

router.post("/:id", async (req, res) => {
    let poraka = req.params.id;
    
    if (req.body.promenaPoraka == "seen") {
        //stavi seen status
        if (req.body.korisnik) {
            var porakaZaPromena = await Message.findById(poraka);

            if (porakaZaPromena) {
                let procitanoOd = !!porakaZaPromena.procitanoOd ? porakaZaPromena.procitanoOd : [];
                procitanoOd.push(req.body.korisnik);

                porakaZaPromena.procitanoOd = procitanoOd;

                await porakaZaPromena.save();
                res.status(200).json(porakaZaPromena);
            } else {
                res.status(400).json({err: "Внесената порака не е пронајдена."});
            }
        } else {
            res.status(400).json({err: "Внесениот корисник не е валиден."});
        }
    }
})

router.post('/', [
    check('sodrzina', 'Внесената порака не е валидна'),
    check('isprakjac', 'Внесениот испраќач не е валиден'),
    check('grupa', 'Внесената група не е валидна')
], async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.status(400).json({errors: errors.array()})
    } else {
        try {
            const { sodrzina, isprakjac, grupa } = req.body;

            let message = new Message({
                sodrzina, isprakjac, grupa, procitanoOd: [isprakjac]
            });

            await message.save();

            var momVreme = new Date();
            var timestamp = momVreme.getTime();

            const aktivnaGrupa = await Group.findById(grupa);
            aktivnaGrupa.poslednaPoraka = timestamp;

            await aktivnaGrupa.save();
    
            res.status(200).json({
                msg: "Пораката е успешно пратена!",
                message
            })
        } catch (err) {
            console.log(err);
            res.status(400).json({err});
        }
    }
})

router.delete('/:poraka', async (req,res) => {
    try {
        let deleted = await Message.findByIdAndDelete(req.params.poraka);

        res.status(200).json({message: deleted});
    } catch (err) {
        res.status(400).json({err});
    }
})

module.exports = router;