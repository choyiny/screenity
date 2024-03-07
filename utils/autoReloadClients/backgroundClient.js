const querystring = require("querystring");


const logger = (msg) => {
  console.log(`[BGC] ${msg}`);
};

logger("background client up.");

logger("connecting to SSE service...");
const port = querystring.parse(__resourceQuery.slice(1)).port;
const es = new EventSource(`http://localhost:${port}/__server_sent_events__`);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if(message.type === "open-transcribe"){
    let editor_url = "editor.html";
    chrome.tabs.create({ url: editor_url, active: true}, (tab) => {
      chrome.tabs.onUpdated.addListener(function _(
        tabId,
        changeInfo,
        updatedTab
      ) {
        // Check if recorder tab has finished loading
        if (tabId === tab.id && changeInfo.status === "complete") {
          chrome.tabs.sendMessage(tab.id, {
            type: "init-transcribe",
            tabId: tab.id,
          });
          chrome.tabs.onUpdated.removeListener(_);
        }
      });
    })
  
}})

es.addEventListener(
  "open",
  () => {
    logger("SSE service connected!");
  },
  false
);

es.addEventListener(
  "error",
  (event) => {
    if (event.target.readyState === 0) {
      console.error("[BGC] you need to open devServer first!");
    } else {
      console.error(event);
    }
  },
  false
);

es.addEventListener("background-updated", () => {
  logger("received 'background-updated' event from SSE service.");
  logger("extension will reload to reload background...");
  chrome.runtime.reload(); // reload extension to reload background.
});

es.addEventListener(
  "content-scripts-updated",
  () => {
    logger("received 'content-scripts-updated' event from SSE service.");
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.sendMessage(
          tab.id,
          {
            from: "backgroundClient",
            action: "reload-yourself",
          },
          (res) => {
            if (chrome.runtime.lastError && !res) return;

            const { from, action } = res;
            if (from === "contentScriptClient" && action === "yes-sir") {
              es.close();
              logger("extension will reload to update content scripts...");
              chrome.runtime.reload();
            }
          }
        );
      });
    });
  },
  false
);
