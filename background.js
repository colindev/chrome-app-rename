

// install init
chrome.runtime.onInstalled.addListener();

// remove gc
chrome.runtime.onSuspend.addListener();

// launch
chrome.app.runtime.onLaunched.addListener(appStart);

function appStart(){
    chrome.app.window.create('index.html', {
        'outerBounds': {
            'width': 400,
            'height': 800,
            'top': 0,
            'left': 1500
        }
    });
}

