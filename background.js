var urlCommentsAJAX = "http://www.pcinpact.com/Actu/SetCommentsRead";

chrome.webRequest.onCompleted.addListener(function (e) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {greeting: "addButtons"});
    });
}, {urls: [urlCommentsAJAX]});