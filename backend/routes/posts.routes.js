const express = require('express');
const router = express.Router();
const Post = require('../models/posts')
const upload = require('../middleware/upload')
const mongoose = require('mongoose')
const webpush = require('web-push');
require('dotenv').config()


//Push-Benachrichtigungen:
const publicVapidKey = 'BLY-eiPr8iVy2l1CHWop2m3Mn_UoNtEQCtJVzgev_uNNDQHjcpz6FAt7v9cNI_PTCt7N-_VSJSDwp0X_DQ0BXHA';
const privateVapidKey = 'cQF0xsXJWheR_FsvtcpZ4TYDxAcUC9LGCEy_yLSkXFk';
const pushSubscription = {
    endpoint: 'https://fcm.googleapis.com/fcm/send/dAar95GZcc8:APA91bESyqlMIvK0vsQG83iPpgdx9exm1G_pIJajS1JB2AJWtCk5wy7tNBbcKBILaSUWSOqv25y27Heqrj67UsCrE9Yhi7uYrZIxz_E-oEIBf3C1OI-pNWg94rDFvFbD4fCai3tgLRvf',
    expirationTime: null,
    keys: {
        p256dh: 'BOYkbmUbvcKHolZh3ARHlgyPX1cl0lDxqqDqKKLK0coBOISVuhSME6XJtBHsSkNaWBb6wV2BbXJ5T6mLZMZt7a0',
        auth: 'MdEtsU6rwHGb9E-JV37xNA'
    }
};

function sendNotification() {
    console.log("Funktionsaufruf sendNotification");
    webpush.setVapidDetails('mailto:s0573811@htw-berlin.de', publicVapidKey, privateVapidKey);
    const payload = JSON.stringify({
        title: 'Ein neues Bild in deinem Blog!',
        content: 'Klick hier und schau nach, was es Neues gibt!',
        openUrl: '/'
    });
    webpush.sendNotification(pushSubscription,payload)
        .catch(err => console.error(err));
    console.log('Benachrichtigung versandt');
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
        console.log("Benachrichtigung versandt");
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
            reject(new Error("Post existiert nicht!"));
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
            console.log('sendAllPosts: ', sendAllPosts)
            resolve(sendAllPosts)
        }
        catch
        {
            reject(new Error("Posts existiert nicht!"));
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
                error: "Post existiert nicht!"
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
                error: "Post existiert nicht!"
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
                error: "Post hat keinen Breitengrad und keinen L??ngengrad!"
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
        res.send({ error: "Post existiert nicht!" })
    }
});

//GET ObjectId of one Post:
function getObjectId() {
    let cursor=db.collection.find();
    let objectId= cursor.next()._id;
    console.log(objectId);
}

module.exports = router;