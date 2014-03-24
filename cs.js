var Constants = {
    //Bots & Amounts
    Bots: {

        Doge: "TipDoge",
        BitCoin: "TipperCoin",
        DogeTip: "133.7 doge",
        BitTip: "0.0001337 bitcoins",

        GetTipObjectByType: function (type) {
            var name;
            var amount;
            switch (type) {
                case "bitcoin":
                    name = this.BitCoin;
                    amount = this.BitTip;
                    break;
                case "dogecoin":
                    name = this.Doge;
                    amount = this.DogeTip;
                    break;
            }

            return {
                Bot: name,
                Amount: amount
            };
        }
    }
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.greeting == "addButtons")
            addButtons();
    });

if (window.location.host == "forum.pcinpact.com")
{
	var comments = document.getElementsByClassName("author");
	[].forEach.call(comments, createTipButtonsFofo);
}

function addButtons() {
		var comments = document.getElementsByClassName("commentaire");
		[].forEach.call(comments, createTipButtons);
}

function createTipButtonsFofo(htmlElement) {
	var urlElement = htmlElement.querySelectorAll('a.name');
    if (urlElement.length < 1)
        return;
    var url = urlElement[0].getAttribute('href');
	var id = /http:\/\/forum\.pcinpact\.com\/user\/(\d*)-(.*)\//.exec(url)[1];
    var pseudo = /http:\/\/forum\.pcinpact\.com\/user\/(\d*)-(.*)\//.exec(url)[2];
	var imgBTC = createClickableImg(id, "bitcoin", pseudo, "forum");
    var imgDoge = createClickableImg(id, "dogecoin", pseudo, "forum");

    htmlElement.appendChild(imgBTC);
    htmlElement.appendChild(imgDoge);
}

function createTipButtons(htmlElement) {
    var urlElement = htmlElement.querySelectorAll('a.commentaire_pseudo');
    if (urlElement.length < 1)
        return;
    var url = urlElement[0].getAttribute('href');
    var id = /\/inpactien\/([0-9]+)/.exec(url)[1];
    var pseudo = urlElement[0].innerText.split(' Le ')[0];
    var imgBTC = createClickableImg(id, "bitcoin", pseudo, "site");
    var imgDoge = createClickableImg(id, "dogecoin", pseudo, "site");
	
    htmlElement.childNodes[3].childNodes[4].appendChild(imgBTC);
    htmlElement.childNodes[3].childNodes[4].appendChild(imgDoge);
}

function createClickableImg(id, type, pseudo, source) {
    var tipObject = Constants.Bots.GetTipObjectByType(type);

    var imgElm = document.createElement('img');
    imgElm.setAttribute('data-id', id);
	imgElm.setAttribute('data-pseudo', pseudo);
    imgElm.setAttribute('data-mode', type);
	imgElm.setAttribute('data-source', source);
    imgElm.className = 'tipButton';
    imgElm.src = chrome.extension.getURL('img/' + type + ".png");
    imgElm.title = "Récompensez " + pseudo + " via @" + tipObject.Bot;

    imgElm.width = "20";
    imgElm.onclick = function (e) {
        Tipper(this);
    };

    return imgElm;
}
function Tipper(elmt) {
    var mode = elmt.getAttribute('data-mode');
    var id = elmt.getAttribute('data-id');
	var pseudo = elmt.getAttribute('data-pseudo');
	var source = elmt.getAttribute('data-source');
	
    var tipObject = Constants.Bots.GetTipObjectByType(mode);
	callback = function (result) {
        if (result != undefined && result != -1) {

            //utiliser encodeURI ici
            var tweeetURL = "https://twitter.com/intent/tweet?text=Hey%20%40" + tipObject.Bot
             + "%20tip%20donc%20"
             + tipObject.Amount
             + "%20%C3%A0%20"
             + result
             + "&hashtags=CryptoTipPCi";

            window.open(tweeetURL, "", "toolbar=0, status=0, width=600, height=257");
        }
        else alert("Cet INpactien n'a pas lié son compte à un compte Twitter");
    };
	
    if (source == "site") getTwitterAccount(id, callback);
	else extractFromForum("http://forum.pcinpact.com/user/" + id + "-" + pseudo + "/", callback);
}

function getTwitterAccount(id, callback) {
    DoGet("http://www.pcinpact.com/inpactien/" + id, function () {
        if (this.status == 200) {
            var query = this.response.querySelectorAll("#action_profil a");
            if (query.length > 0) {
                var urlForum = query[0].href;
                extractFromForum(urlForum, callback);
            }
        } else console.error("Une erreur est survenue lors de la récupération du profil du forum");
    });
}

function extractFromForum(url, callback) {
    DoGet(url, function () {
        if (this.status == 200) {
            var result = -1;
            var elts = this.responseXML.getElementsByClassName("row_data");
            for (var i = 0; i < elts.length; i++) {
                if (elts[i].innerHTML.indexOf("Twitter") > -1)
                    result = "@" + elts[i].innerText.trim();
            }
            callback(result);
        } else console.error("Une erreur est survenue lors de la récupération du compte Twitter");
    });
}

function DoGet(url, onResut) {
    if (typeof onResut != "function")
        console.log("lame !");

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "document";
    xhr.onload = onResut;
    xhr.send(null);
}