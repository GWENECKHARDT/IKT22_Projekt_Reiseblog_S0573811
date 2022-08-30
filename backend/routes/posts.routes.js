//import webpush from 'web-push';

const express = require('express');
const router = express.Router();
const Post = require('../models/posts')
const upload = require('../middleware/upload')
const mongoose = require('mongoose')
const webpush = require('web-push');
require('dotenv').config()


//Push-Benachrichtigungen:
const publicVapidKey = 'BFBlrf5uFuv7nmZpQD8ubQmoZwR0Qk8RE8f85js5VSYjDrBOOGFr-onJWgq3T_wbWC664LPnUutssKyCM7jGwLc';
const privateVapidKey = 'WK75Qk2E_pHRhBEaOFfsrrPiOyHngLffJ7BwYmPKQ9w';
const pushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/e5_7er1wUMk:APA91bFsbpqUTboWR_yJMayEog4_h2QEdTpmnhi5Wy1fNXEI7Go7dBFZb4PWrQph0mQins03sXL4ud7lD-h9mMsxbmzE3GEL0VhJOo7ssaSqwu1RVk4bpjxOvZeI6C3JnE1surVBOrYg',
    expirationTime: null,
    keys: {
        p256dh: 'BNNp9_kt8S9zYUvzz4-w9R1eV-3fe1wpLKWFwdqWXN-a35iPdiZMmPdd6uSgi2QqgnRg3qGRaSgosVsT6A13mh4',
        auth: 'UZgUWvc8yV3Oav_5S3dQeg'
    }
};

function sendNotification() {
    console.log("Funktionsaufruf sendNotification");
    webpush.setVapidDetails('mailto:s0573811@htw-berlin.de', publicVapidKey, privateVapidKey);
    const payload = JSON.stringify({
        title: 'New Push Notification',
        content: 'New data in database!',
        openUrl: '/'
    });
    webpush.sendNotification(pushSubscription,payload)
        .catch(err => console.error(err));
    console.log('push notification sent');
    // res.status(201).json({ message: 'push notification sent'});
}



//POST:

// POST one post:
router.post('/', upload.single('file'), async(req, res) => {
    if(req.file === undefined)
    {
        return res.send({
            "message": "no file selected"
        })
    } else {
        const newPost = new Post({
            title: req.body.title,
            location: req.body.location,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            date: req.body.date,
            notes: req.body.notes,
            image_id: req.file.filename
        })
        console.log('newPost', newPost)
        await newPost.save();
        sendNotification();
        console.log("Notification sended");
        res.send(newPost);
    }
})

//GET:

const connect = mongoose.createConnection(process.env.DB_CONNECTION, { useNewUrlParser: true, useUnifiedTopology: true });
const collectionFiles = connect.collection('posts.files');
const collectionChunks = connect.collection('posts.chunks');

//GET one Post by id?:
function getOnePost(id) {
    return new Promise( async(resolve, reject) => {
        try {
            const post = await Post.findOne({ _id: id });
            let fileName = post.image_id;

            collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {

                // sort({n: 1}) --> die chunks nach Eigenschaft n aufsteigend sortieren
                collectionChunks.find({files_id : docs[0]._id}).sort({n: 1}).toArray( (err, chunks) => {

                    //Alle Chunks zu einem Post werden im fileData-Array gespeichert
                    const fileData = [];
                    for(let chunk of chunks)
                    {
                        // console.log('chunk._id', chunk._id)
                        fileData.push(chunk.data.toString('base64'));
                    }

                    let base64file = 'data:' + docs[0].contentType + ';base64,' + fileData.join('');
                    let getPost = new Post({
                        "title": post.title,
                        "location": post.location,
                        "image_id": base64file,
                        "latitude": post.latitude,
                        "longitude": post.longitude,
                        "date": post.date,
                        "notes": post.notes
                    });

                    resolve(getPost)
                })

            }) // toArray find filename

        } catch {
            reject(new Error("Post does not exist!"));
        }
    })
}

//GET all Posts:
function getAllPosts() {
    return new Promise( async(resolve, reject) => {
        const sendAllPosts = [];
        const allPosts = await Post.find();
        try
        {
            for(const post of allPosts) {
                console.log('post', post)
                const onePost = await getOnePost(post._id);
                sendAllPosts.push(onePost);
            }
            console.log('sendAllPosts', sendAllPosts)
            resolve(sendAllPosts)
        }
        catch
        {
            reject(new Error("Posts do not exist!"));
        }
    });
}

//GET all Latitudes and Longitudes:
function getLatitudesLongitudes()
{
    return new Promise( async(resolve, reject) => {
        const sendAllLatitudesLongitudes = [];
        const allPosts = await Post.find();
        try {
            for(const post of allPosts) {
                console.log('post', post)
                const oneLatitude= await getOnePost(post.latitude);
                const oneLongitude=await getOnePost(post.longitude);
                sendAllLatitudesLongitudes.push(oneLatitude);
                sendAllLatitudesLongitudes.push(oneLongitude);
            }
            console.log('sendAllLatitudesLongitudes', sendAllLatitudesLongitudes)
            resolve(sendAllLatitudesLongitudes)
        } catch {
            reject(new Error("Posts do not exist!"));
        }
    });
}

// GET one post via id:
router.get('/:id', async(req, res) => {
    getOnePost(req.params.id)
        .then( (post) => {
            console.log('post', post);
            res.send(post);
        })
        .catch( () => {
            res.status(404);
            res.send({
                error: "Post does not exist!"
            });
        })
});

// GET all posts
router.get('/', async(req, res) => {

    getAllPosts()
        .then( (posts) => {
            res.send(posts);
        })
        .catch( () => {
            res.status(404);
            res.send({
                error: "Post do not exist!"
            });
        })
});

//GET latitude and longitude of all posts:

router.get('/map', async(req, res)=>
{
    getLatitudesLongitudes()
        .then((posts) => {
            console.log('postll', posts);
            res.send(posts);
        })
        .catch(()=>
        {
            res.status(404);
            res.send({
                error: "Post hat keine Latitude und keine Longitude"
            });
        })
});

//DELETE:

// DELETE one post via id
router.delete('/:id', async(req, res) => {
    try {
        const post = await Post.findOne({ _id: req.params.id })
        console.log(req.params.id);
        let fileName = post.image_id;
        await Post.deleteOne({ _id: req.params.id });
        await collectionFiles.find({filename: fileName}).toArray( async(err, docs) => {
            await collectionChunks.deleteMany({files_id : docs[0]._id});
        })
        await collectionFiles.deleteOne({filename: fileName});
        res.status(204).send()
    } catch {
        res.status(404)
        res.send({ error: "Post does not exist!" })
    }
});

//GET ObjectId of one Post:
function getObjectId() {
    let cursor=db.collection.find();
    let objectId= cursor.next()._id;
    console.log(objectId);
}

module.exports = router;