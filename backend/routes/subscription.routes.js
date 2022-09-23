//import webpush from 'web-push';

const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BLY-eiPr8iVy2l1CHWop2m3Mn_UoNtEQCtJVzgev_uNNDQHjcpz6FAt7v9cNI_PTCt7N-_VSJSDwp0X_DQ0BXHA';
const privateVapidKey = 'cQF0xsXJWheR_FsvtcpZ4TYDxAcUC9LGCEy_yLSkXFk';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:s0573811@htw-berlin.de', publicVapidKey, privateVapidKey);
});


module.exports = router;