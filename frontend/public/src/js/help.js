let phoneButton = document.querySelector('#phone-btn');
let mailButton = document.querySelector('#mail-btn');
let chatButton = document.querySelector('#chat-btn');

phoneButton.addEventListener('click', event => {
    document.getElementById("phoneText").style.display = "block";
    document.getElementById("mailText").style.display = "none";
    document.getElementById("chatText").style.display = "none";

})

mailButton.addEventListener('click', event => {
    document.getElementById("mailText").style.display = "block";
    document.getElementById("phoneText").style.display = "none";
    document.getElementById("chatText").style.display = "none";
})

chatButton.addEventListener('click', event => {
    document.getElementById("chatText").style.display = "block";
    document.getElementById("phoneText").style.display = "none";
    document.getElementById("mailText").style.display = "none";
})
