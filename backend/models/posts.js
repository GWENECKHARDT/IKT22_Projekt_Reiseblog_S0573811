const mongoose = require('mongoose');

const schema = new mongoose.Schema({
    title: String,
    location: String,
    latitude: String,
    longitude: String,
    image_id: String,
    date: String,
    notes: String
});

module.exports = mongoose.model('Post', schema);

//Längen- und Breitengrad zu jedem Post werden in Datenbank gespeichert,
//damit die Karte darauf zugreifen kann.