chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "addButtons")
            addButtons();
    });

function addButtons() {
    var comments = document.getElementsByClassName("commentaire");
    for (i = 0; i < comments.length; i++) {
        var id = comments[i].childNodes[3].childNodes[1].getAttribute("href").split("inpactien/")[1];
		var pseudo = comments[i].childNodes[3].childNodes[1].innerText.split(" Le ")[0];

        var imgBTC = document.createElement("img");
        imgBTC.className = "tipButton btctip_" + id;
        imgBTC.src = chrome.extension.getURL("img/bitcoin.png");
        imgBTC.title = "Récompensez " + pseudo + " via @TipperCoin";
        imgBTC.style.cssText = "margin-top: 5px; margin-left: -5px; margin-right: 5px";
        imgBTC.width = "20";
        imgBTC.onclick = function (e) {
            Tipper(this)
        };

        var imgDoge = document.createElement("img");
        imgDoge.className = "tipButton dogetip_" + id;
        imgDoge.src = chrome.extension.getURL("img/dogecoin.png");
        imgDoge.title = "Récompensez " + pseudo + " via @TipDoge";
        imgDoge.style.cssText = "margin-top: 5px";
        imgDoge.width = "20";
        imgDoge.onclick = function (e) {
            Tipper(this)
        };

        comments[i].childNodes[1].appendChild(imgBTC);
        comments[i].childNodes[1].appendChild(imgDoge);
    }
}

function Tipper(elmt) {
    var splitted = elmt.className.split("_");
    var mode = splitted[0];
    var id = splitted[1];

    var tweeetURL = "";
    var bot = "";
    var tipDefaut = "";

    switch (mode) {
        case "tipButton btctip":
            bot = "tippercoin"
            tipDefaut = "0.001337 bitcoins";
            break;

        case "tipButton dogetip":
            bot = "tipdoge"
            tipDefaut = "133.7 doge";
            break;
    }

    getTwitterAccount(id, function (result) {
        if (result != undefined && result != -1) {

            tweeetURL = "https://twitter.com/intent/tweet?text=Hey%20%40" + bot
                + "%20tip%20donc%20"
				+ tipDefaut
				+ "%20%C3%A0%20"
				+ result
				+ "%20%23CryptoTipPCi";

            window.open(tweeetURL, "", "toolbar=0, status=0, width=600, height=257");
        }
        else alert("Cet INpactien n'a pas lié son compte à un compte Twitter");
    });
}

function getTwitterAccount(id, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://www.pcinpact.com/inpactien/" + id, true);
    xhr.responseType = "document";
    xhr.onload = function () {
        if (this.status == 200) {
            var urlForum = this.response.getElementById("action_profil").getElementsByTagName("a")[0].href;
            extractFromForum(urlForum, callback);
        }
        else console.error("Une erreur est survenue lors de la récupération du profil du forum")
    };
    xhr.send(null);
}

function extractFromForum(url, callback) {
    var result = undefined;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "document";
    xhr.onload = function () {
        if (this.status == 200) {
            result = -1;
            var elts = this.responseXML.getElementsByClassName("row_data");
            for (var i = 0; i < elts.length; i++) {
                if (elts[i].innerHTML.indexOf("Twitter") > -1)
                    result = "@" + elts[i].innerText.trim();
            }
            callback(result);
        }
        else console.error("Une erreur est survenue lors de la récupération du compte Twitter")
    };
    xhr.send(null);
}