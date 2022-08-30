//import webpush from 'web-push';

const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BFBlrf5uFuv7nmZpQD8ubQmoZwR0Qk8RE8f85js5VSYjDrBOOGFr-onJWgq3T_wbWC664LPnUutssKyCM7jGwLc';
const privateVapidKey = 'WK75Qk2E_pHRhBEaOFfsrrPiOyHngLffJ7BwYmPKQ9w';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:s0573811@htw-berlin.de', publicVapidKey, privateVapidKey);
});

module.exports = router;