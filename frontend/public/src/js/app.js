let enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

//Registrierung des Serviceworkers.
//Auch in jeder einzelnen HTML-Dateien als <script>-Element möglich.
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        .register('/sw.js')
        .then(() => {
            console.log('service worker registriert')
        })
        .catch(
            err => { console.log(err); }
        );
}

//Benachrichtigung beim Aktivieren der Anzeige von Benachrichtigungen.
function displayConfirmNotification() {
    console.log("Anzeige Push-Nachricht")
    if('serviceWorker' in navigator) {
        let options = { body: 'Du hast die Benachrichtigungen aktiviert!',
            icon: '/src/pictures/world.png',
            image: '/src/pictures/world.png',
            lang: 'de-DE',
            vibrate: [100, 50, 200],
            badge: '/src/pictures/world.png',
            tag: 'confirm-notification',
            renotify: true,
            actions: [
                //https://icons8.com/icon/sz8cPVwzLrMP/check-mark
                { action: 'confirm', title: 'Ok', icon: '/src/pictures/ok.png' },
                //https://icons8.com/icons/set/X-red--static--red
                //{ action: 'cancel', title: 'Abbrechen', icon: '/src/pictures/abbrechen.png' },
            ]};

        navigator.serviceWorker.ready
            .then( sw => {
                sw.showNotification('Benachrichtigungen Erfolgreich aktiviert!', options).then(r => console.log("Anzeige Push-Nachricht" + options));
            });
        console.log("Anzeige Push-Nachricht" + options);
    }
}

//https://github.com/GoogleChromeLabs/web-push-codelab/issues/46
//Funktion zur Umwandlung von Base64 zu Uint8Array.
function urlBase64ToUint8Array(base64String) {
    let padding = '='.repeat((4 - base64String.length % 4) % 4);
    let base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    let rawData = window.atob(base64);
    let outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function configurePushSubscription() {
    if(!('serviceWorker' in navigator)) {
        return
    }

    let swReg;
    navigator.serviceWorker.ready
        .then( sw => {
            swReg = sw;
            return sw.pushManager.getSubscription();
            console.log('swReg=sw');
        })
        .then( sub => {
            if(sub === null) {
                console.log('sub==ull')
                let vapidPublicKey = 'BLY-eiPr8iVy2l1CHWop2m3Mn_UoNtEQCtJVzgev_uNNDQHjcpz6FAt7v9cNI_PTCt7N-_VSJSDwp0X_DQ0BXHA';
                let convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
                console.log("swReg: " + swReg);
                console.log(convertedVapidPublicKey);
                return swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedVapidPublicKey,
                });
            } else {
                // already subscribed
            }
            //Falls schon angemeldet wurde, dann einmal folgenden Code ausführen, um es zu löschen:
                        /*sub.unsubscribe()
                            .then( () => {
                                console.log('unsubscribed()', sub)
                            })*/
        })
        .then( newSub => {
            return fetch('http://localhost:3000/subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(newSub)
            })
                .then( response => {
                    if(response.ok) {
                        displayConfirmNotification();
                        console.log('displayConfirmNotification')
                    }
                })
        });
}


function askForNotificationPermission() {
    Notification.requestPermission( result => {
        console.log('Auswahl:', result);
        if(result !== 'granted') {
            console.log('Benachrichtigungen wurden nicht aktiviert');
        } else {
            console.log("configurePushSubscription");
            configurePushSubscription();
        }
    });
}

//Button Benachrichtigungen ist nur sichtbar, wenn Push-Benachrichtigungen vom Browser
//unterstützt werden.
if('Notification' in window && 'serviceWorker' in navigator) {
    for(let button of enableNotificationsButtons) {
        button.style.display = 'inline-block';
        button.addEventListener('click', askForNotificationPermission);
    }
}

