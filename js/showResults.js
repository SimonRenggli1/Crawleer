document.addEventListener('DOMContentLoaded', function() {
    var startBtn = document.getElementById('startBtn');
    startBtn.addEventListener('click', function() {
        crawl();
        startBtn.disabled = true;
    });
});

function crawl() {
    chrome.tabs.query({active: true, currentWindow : true}, tabs => {
        if (tabs && tabs.length > 0) {
            var url = tabs[0].url;
            if (url == null)
                console.log("url is null");
            else {
                console.log("url is " + url);
                var visited = {};
                var queue = [url];
                var resultsDiv = document.createElement("div");
                while (queue.length > 0) {
                    var currUrl = queue.shift();
                    if (visited[currUrl]) {
                        continue;
                    }
                    visited[currUrl] = true;
                    fetch(currUrl).then(response => {
                        if (response.ok) {
                            return response.text();
                        } else {
                            throw new Error('Network response was not ok.');
                        }
                    }).then(html => {
                        var parser = new DOMParser();
                        var doc = parser.parseFromString(html, "text/html");
                        var links = doc.getElementsByTagName("a");
                        for (var i = 0; i < links.length; i++) {
                            var link = links[i].href;
                            var anchor = document.createElement("a");
                            anchor.href = link;
                            anchor.innerText = link;
                            var entryDiv = document.createElement("div");
                            if (links[i].href.indexOf("chrome-extension://") !== -1) {
                                continue;
                            }
                            if (visited[links[i].href]) {
                                continue;
                            }
                            if (links[i].href === "") {
                                continue;
                            }
                            if (links[i].href.indexOf("javascript:") !== -1) {
                                continue;
                            }
                            entryDiv.classList.add("entries");
                            if (i % 2 === 0) {
                                entryDiv.classList.add("entries-dark");
                            }
                            entryDiv.appendChild(anchor);
                            resultsDiv.appendChild(entryDiv);
                            console.log(link);
                            if (!visited[link]) {
                                queue.push(link);
                            }
                        }
                    }).catch(error => {
                        console.error('There was a problem with the fetch operation:', error);
                    });
                }
                var boxDiv = document.querySelector(".box");
                boxDiv.appendChild(resultsDiv);
            }
        }
    });
}