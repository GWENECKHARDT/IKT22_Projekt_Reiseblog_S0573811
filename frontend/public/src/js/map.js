let locations = new Array();
let marker = new Array();

fetch('http://localhost:3000/posts')
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        console.log('Fetch Show Locations');
        console.log('data1: ', data);
        //Umwandeln der Werte von Längen- und Breitengrad in Floatwerte
        for(let i=0; i<data.length; i++)
        {
            locations[i] = [parseFloat(data[i]["longitude"]), parseFloat(data[i]["latitude"])]
        }
        console.log('Array: ',locations);
        showLocations();
    })
    .catch( (err) => {
        //Falls nicht auf die Datenbank zugegriffen werden kann, wird auf die Werte in der IndexedDB zugegriffen
        if('indexedDB' in window) {
            readAllData('posts')
                .then( data => {
                    console.log('From cache: ', data);
                    for(let i=0; i<data.length; i++)
                    {
                        locations[i] = [parseFloat(data[i]["longitude"]), parseFloat(data[i]["latitude"])]
                    }
                    showLocations();
                })
        }
    });

function createMarker()
{
    console.log('Create Marker')

    /*marker = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([13.3777, 52.5162]))
    })*/

    console.log('Marker: ', marker)

    return marker;
}

function showLocations()
{
    console.log('Show Locations')

    //Erzeugen der Karte
    const bigmap = new ol.Map({
        target: 'bigmap',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        //Ansicht ist auf Berlin zentriert
        view: new ol.View({
            center: ol.proj.fromLonLat([13.3777, 52.5162]),
            zoom: 6
        })
    });


    //Für jeden Längen- und Breitengrad wird eine Form (blauer Kreis) erzeugt
    //und in layer gespeichert
    for(let i=0; i<locations.length; i++) {
        const layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [
                    new ol.Feature({
                        geometry: new ol.geom.Point(ol.proj.fromLonLat(locations[i])),
                        /*color: 'red'*/
                    }),

                ]
            })
        });

        //jedes layer wird der Karte hinzugefügt
        bigmap.addLayer(layer);

    }
    console.log('bigmap', bigmap)
}


