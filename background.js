var urlCommentsAJAX = "http://www.pcinpact.com/Actu/SetCommentsRead";

chrome.webRequest.onCompleted.addListener(function (e) {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        var msg;
        if (e.url == urlCommentsAJAX) msg = "commentsUpdate";
        	else msg = "forumRead";
        chrome.tabs.sendMessage(tabs[0].id, {greeting: msg});
    });
}, {urls: [urlCommentsAJAX,"http://forum.pcinpact.com/topic/*"]});

