//import * as ol from "ol";

let shareImageButton = document.querySelector('#share-image-button');
let createPostArea = document.querySelector('#create-post');
let closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
let sharedMomentsArea = document.querySelector('#shared-moments');
let sharedBigMapArea = document.querySelector('#shared-bigmap');
let form = document.querySelector('form');
let titleInput = document.querySelector('#title');
let locationInput = document.querySelector('#location');
let dateInput = document.querySelector('#date');
let notesInput = document.querySelector('#notes');
let videoPlayer = document.querySelector('#player');
let canvasElement = document.querySelector('#canvas');
let captureButton = document.querySelector('#capture-btn');
let imagePicker = document.querySelector('#image-picker');
let imagePickerArea = document.querySelector('#pick-image');
let file = null;
let titleValue = '';
let locationValue = '';
let imageURI = '';
let dateValue= '';
let notesValue= '';
let locationButton = document.querySelector('#location-btn');
let locationmapButton = document.querySelector('#locationmap-btn');
//Eigener Button für Karte, da Karte schon besteht und keine Neue erstellt werden soll
let locationLoader = document.querySelector('#location-loader');
let fetchedLocation;
let mapDiv = document.querySelector('.map');
//let bigMapDiv = document.querySelector('.bigmap');
let imageButton = document.querySelector('#image-btn');
let moreInfosArea = document.querySelector('#show-info');
let cardInfoCardWrapper = document.createElement('div');
let cardWrapper = document.createElement('div');
//let deleteButton = document.querySelector('#delete-btn');

locationButton.addEventListener('click', event => {
    if(!('geolocation' in navigator)) {
        return;
    }

    locationButton.style.display = 'none';
    locationLoader.style.display = 'block';

    navigator.geolocation.getCurrentPosition( position => {
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        fetchedLocation = { latitude: position.coords.latitude, longitude: position.coords.longitude };
        console.log('current position: ', fetchedLocation);

        let nominatimURL = 'https://nominatim.openstreetmap.org/reverse';
        nominatimURL += '?format=jsonv2';   // format=[xml|json|jsonv2|geojson|geocodejson]
        nominatimURL += '&lat=' + fetchedLocation.latitude;
        nominatimURL += '&lon=' + fetchedLocation.longitude;

        fetch(nominatimURL)
            .then((res) => {
                console.log('nominatim res ...', res);
                return res.json();
            })
            .then((data) => {
                console.log('nominatim res.json() ...', data);
                locationInput.value = data.display_name;
                return data;
            })
            .then( d => {
                locationButton.style.display = 'none';
                locationLoader.style.display = 'none';
                mapDiv.style.display = 'block';

                const map = new ol.Map({
                    target: 'map',
                    layers: [
                        new ol.layer.Tile({
                            source: new ol.source.OSM()
                        })
                    ],
                    view: new ol.View({
                        center: ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]),
                        zoom: 12
                    })
                });

                const layer = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [
                            new ol.Feature({
                                geometry: new ol.geom.Point(ol.proj.fromLonLat([fetchedLocation.longitude, fetchedLocation.latitude]))
                            })
                        ]
                    })
                });

                map.addLayer(layer);

                console.log('map', map)
            })
            .catch( (err) => {
                console.error('err', err)
                locationInput.value = 'Irgendwo im Nirgendwo';
            })

        .catch((err) => {
            console.error('err', err)
            fetchedLocation.latitude = '';
            fetchedLocation.longitude = '';
        });

        document.querySelector('#manual-location').classList.add('is-focused');

    }, err => {
        console.log(err);
        locationButton.style.display = 'inline';
        locationLoader.style.display = 'none';
        alert('Couldn\'t fetch location, please enter manually!');
        //fetchedLocation = null;
        fetchedLocation = { latitude: '', longitude: '' }
        //fetchedLocation.latitude = '';
        //fetchedLocation.longitude = '';
    }, { timeout: 5000});
});



function initializeLocation() {
    if(!('geolocation' in navigator)) {
        locationButton.style.display = 'none';
    }
}

function initializeMedia() {
    if(!('mediaDevices' in navigator)) {
        navigator.mediaDevices = {};
    }

    if(!('getUserMedia' in navigator.mediaDevices)) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            let getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if(!getUserMedia) {
                return Promise.reject(new Error('getUserMedia is not implemented'));
            }

            return new Promise( (resolve, reject) => {
                getUserMedia.call(navigator, constraints, resolve, reject);
            })
        }
    }

    navigator.mediaDevices.getUserMedia({video: true})
        .then( stream => {
            videoPlayer.srcObject = stream;
            videoPlayer.style.display = 'block';
        })
        .catch( err => {
            imagePickerArea.style.display = 'block';
        });
}

function openCreatePostModal() {
    setTimeout( () => {
        createPostArea.style.transform = 'translateY(0)';
    }, 1);
    initializeMedia();
    initializeLocation();
}

function closeCreatePostModal() {
    imagePickerArea.style.display = 'none';
    videoPlayer.style.display = 'none';
    canvasElement.style.display = 'none';
    locationButton.style.display = 'inline';
    locationLoader.style.display = 'none';
    if(videoPlayer.srcObject) {
        videoPlayer.srcObject.getVideoTracks().forEach( track => track.stop());
    }
    setTimeout( () => {
        createPostArea.style.transform = 'translateY(100vH)';
    }, 1);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function moreInfos(card)
{
    console.log('More Infos');
    setTimeout( () => {
        moreInfosArea.style.transform = 'translateY(0)';
    }, 1);
    let cardInfo=document.createElement('div')
    let cardInfoTitle=document.createElement('h2')
    cardInfoTitle.className = 'mdl-card__title-text';
    cardInfoTitle.textContent=card.title;
    cardInfo.appendChild(cardInfoTitle);
    console.log(card.title);
    /*let cardInfoLocation=document.createElement('h4')
    cardInfoLocation.textContent=card.location;
    cardInfo.appendChild(cardInfoLocation);
    console.log(card.location);*/
    //moreInfosArea.appendChild(cardInfo);
    console.log(cardInfo);
    let cardInfoDate=document.createElement('h4')
    cardInfoDate.textContent=card.date;
    cardInfo.appendChild(cardInfoDate);
    let cardInfoNotes=document.createElement('h4')
    cardInfoNotes.textContent=card.notes;
    cardInfo.appendChild(cardInfoNotes);
    /*        let cardInfoLinks=document.createElement('h5')
            cardInfoLinks.textContent=picture.links;
            cardInfo.appendChild(cardInfoLinks);*/
    //Id zum Testen
    /*let cardInfoId=document.createElement('h4');
    cardInfoId.textContent=card._id;
    cardInfo.appendChild(cardInfoId);*/
    //Image-Id zum Testen
    /*let cardImageInfoId=document.createElement('h4');
    cardImageInfoId.textContent=card.image_id;
    cardInfo.appendChild(cardImageInfoId);*/
    let backToImageButton = document.createElement('button');
    backToImageButton.innerText="Zurück zum Bild";
    backToImageButton.id='backToImage-btn'
    backToImageButton.addEventListener('click', () => {
        //alert('Juchuu');
        //console.log('Yes!');
        //back(card);
        //createCard(card);
        location.reload(); //Umgehungslösung: Ganze Website lädt neu
    })
    let deleteButton = document.createElement('button');
    deleteButton.innerText="Bild löschen";
    console.log("ID aus MoreInfos-Funktion:" + card._id);
    deleteButton.addEventListener('click', () => {
        deleteOneCard(card)
    })
    cardInfoCardWrapper = document.createElement('div');
    //cardInfoCardWrapper.className = 'shared-moment-cardInfo mdl-card mdl-shadow--2dp';
    cardInfoCardWrapper.appendChild(cardInfo);
    cardInfoCardWrapper.appendChild(backToImageButton);
    cardInfoCardWrapper.appendChild(deleteButton);

    console.log(cardInfoCardWrapper);
    //sharedMomentsArea.appendChild(cardInfo);
    return cardInfoCardWrapper;

    /*    cardWrapper.appendChild(cardInfo);
    cardWrapper.appendChild(backToImageButton);
    componentHandler.upgradeElement(cardWrapper);
    console.log(cardWrapper);*/
}

function closeMoreInfosArea()
{
    setTimeout( () => {
        moreInfosArea.style.transform = 'translateY(100vH)';
    }, 1);
}

function back(card)
{
    console.log("Bild anzeigen")
    createCard(card);
}

function createCard(card) {
    cardWrapper = document.createElement('div');
    cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
    let cardTitle = document.createElement('div');
    cardTitle.className = 'mdl-card__title';
    let image = new Image();
    image.src = card.image_id;
    cardTitle.style.backgroundImage = 'url('+ image.src +')';
    cardTitle.style.backgroundSize = 'cover';
    cardWrapper.appendChild(cardTitle);
    let cardTitleTextElement = document.createElement('h2');
    cardTitleTextElement.className = 'mdl-card__title-text';
    cardTitleTextElement.textContent = card.title;
    //console.log(card.title);
    cardTitleTextElement.classList.add('whiteText');
    cardTitle.appendChild(cardTitleTextElement);
    let cardSupportingText = document.createElement('div');
    cardSupportingText.className = 'mdl-card__supporting-text';
    cardSupportingText.textContent = card.location;
    cardSupportingText.style.textAlign = 'center';
    // image.addEventListener('click', console.log('KLick!'))
    cardWrapper.appendChild(cardSupportingText);
    let moreInfosButton = document.createElement('button');
    // moreInfos.appendChild(document.createTextNode('Klick hier!'));
    moreInfosButton.innerText="Weitere Informationen";
    moreInfosButton.id='moreInfos-btn'
    moreInfosButton.addEventListener('click', () => {
        //alert('Juchuu');
        //console.log('Yes!');
        console.log("ID aus CreateCard-Funktion: " + card._id);
        cardTitle.style.backgroundImage = 'None';
        moreInfosButton.style.display = 'None';
        cardTitleTextElement.style.display = 'None';
        //cardTitle.display = 'None';
        moreInfos(card);
        cardTitle.appendChild(cardInfoCardWrapper);
    })
    cardWrapper.appendChild(moreInfosButton);
    componentHandler.upgradeElement(cardWrapper);
    sharedMomentsArea.appendChild(cardWrapper);

    //return cardWrapper;

    /*sharedMomentsArea.addEventListener('click', openImg())*/
    /*let moreInfos = document.getElementById('shared-moments')
    moreInfos.addEventListener('click', console.log('KLick!'))*/
}

fetch('http://localhost:3000/posts')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        console.log('From backend ...', data);
        updateUI(data);
        // showLocations();
    })
    .catch( (err) => {
        if('indexedDB' in window) {
            readAllData('posts')
                .then( data => {
                    console.log('From cache ...', data);
                    updateUI(data);
                })
        }
    });



function updateUI(data) {
    for(let card of data)
    {
        createCard(card);
    }
}

function deleteOneCard(card) {
    /*fetch('http://localhost:3000/posts', {
        method: 'GET',
        //body: formData
    })
        .then(response => {
            console.log('DB-Inhalt: ', response);
            console.log(card);
            return response.json();
        })*/

    let id=card._id.toString();
    //let cardid=card.ObjectId.toString();

    console.log(card);
    console.log(card._id);
    console.log(id);
    fetch('http://localhost:3000/posts/' +id, {
        method: 'DELETE',
    })
        .then( response => {
            console.log('Data deleted: ', response);
            return response.json();
        })
}

function sendDataToBackend() {
    const formData = new FormData();
    formData.append('title', titleValue);
    formData.append('location', locationValue);
    formData.append('latitude', fetchedLocation.latitude);
    formData.append('longitude', fetchedLocation.longitude);
    formData.append('date', dateValue);
    formData.append('notes', notesValue);
    formData.append('file', file);

    console.log('formData', formData)

    fetch('http://localhost:3000/posts', {
        method: 'POST',
        body: formData
    })
        .then( response => {
            console.log('Data sent to backend ...', response);
            return response.json();
        })
        .then( data => {
            console.log('data ...', data);
            const newPost = {
                title: data.title,
                location: data.location,
                latitude: data.latitude,
                longitude: data.longitude,
                date: data.date,
                notes: data.notes,
                image_id: imageURI
            }
            updateUI([newPost]);
        });
}

form.addEventListener('submit', event => {
    event.preventDefault(); // nicht absenden und neu laden

    if (file == null) {
        alert('Erst Foto aufnehmen!')
        return;
    }
    /*if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
        alert('Bitte Titel und Location angeben!')
        return;
    }*/
    if (titleInput.value.trim() === '') {
        alert('Bitte Titel angeben!')
        return;
    }
    if (locationInput.value.trim() === '') {
        alert('Bitte Location angegeben!')
        return;
    }
    if (fetchedLocation === undefined) {
        fetchedLocation = { latitude: '', longitude: '' }
        return fetchedLocation;
    }
    /*if (fetchedLocation === undefined) {
        return fetchedLocation.longitude = '';
    }*/
/*    if (fetchedLocation.latitude === undefined) {
        return fetchedLocation.latitude = '';

    }
    if (fetchedLocation.longitude === undefined) {
        return fetchedLocation.longitude = '';
    }*/

    closeCreatePostModal();

    titleValue = titleInput.value;
    locationValue = locationInput.value;
    dateValue = dateInput.value;
    notesValue = notesInput.value;
    //notesValue = notesInput.textContent;
    console.log('titleInput', titleValue)
    console.log('locationInput', locationValue)
/*    try{
        console.log('latitude', fetchedLocation.latitude);
    }
    catch{
        fetchedLocation.latitude = null;
        console.log('latitude', fetchedLocation.latitude)
    }
    try{
        console.log('longitude', fetchedLocation.longitude);
    }
    catch{
        fetchedLocation.longitude = null;
        console.log('longitude', fetchedLocation.longitude)
    }*/
    console.log('latitude', fetchedLocation.latitude)
    console.log('longitude', fetchedLocation.longitude)
    console.log('date', dateValue)
    console.log('notes', notesValue)
    console.log('file', file)

    if('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready
            .then( sw => {
                let post = {
                    id: new Date().toISOString(),
                    title: titleValue,
                    location: locationValue,
                    latitude: fetchedLocation.latitude,
                    longitude: fetchedLocation.longitude,
                    date: dateValue,
                    notes: notesValue,
                    image_id: file      // file durch den Foto-Button belegt
                }
                writeData('sync-posts', post)
                    .then( () => {
                        sw.sync.register('sync-new-post');
                    })
                    .then( () => {
                        let snackbarContainer = new MaterialSnackbar(document.querySelector('#confirmation-toast'));
                        let data = { message: 'Eingaben zum Synchronisieren gespeichert!', timeout: 2000};
                        snackbarContainer.showSnackbar(data);
                    });
            });
    }

    else {
        sendDataToBackend();
    }
});

captureButton.addEventListener('click', event => {
    event.preventDefault(); // nicht absenden und neu laden
    canvasElement.style.display = 'block';
    videoPlayer.style.display = 'none';
    captureButton.style.display = 'none';
    let context = canvasElement.getContext('2d');
    context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
    videoPlayer.srcObject.getVideoTracks().forEach( track => {
        track.stop();
    })
    imageURI = canvas.toDataURL("image/jpg");
    // console.log('imageURI', imageURI)       // base64-String des Bildes

    fetch(imageURI)
        .then(res => {
            return res.blob()
        })
        .then(blob => {
            file = new File([blob], "myFile.jpg", { type: "image/jpg" })
            console.log('file', file)
        })
});

imagePicker.addEventListener('change', event => {
    file = event.target.files[0];
});



