//import webpush from 'web-push';

const express = require('express');
const webpush = require('web-push');
const router = express.Router();

const publicVapidKey = 'BOUbYc6tO5KzEgRJXSAIhPfyv7RssTducAKKgsuaS1c_pmm3FbLIjYF9ONS3ergDI9gvY6eJo1T2EiYFTV4seNs';
const privateVapidKey = 'omLzpc1ByE5GSzlYwdJkY3-irQpJ4wtTTothopLVbI0';

router.post('/', async(req, res) => {
    const subscription = req.body;
    console.log('subscription', subscription);
    res.status(201).json({ message: 'subscription received'});

    webpush.setVapidDetails('mailto:s0573811@htw-berlin.de', publicVapidKey, privateVapidKey);
});

module.exports = router;