const querystring = require("querystring");


const logger = (msg) => {
  console.log(`[BGC] ${msg}`);
};

logger("background client up.");

logger("connecting to SSE service...");
const port = querystring.parse(__resourceQuery.slice(1)).port;
const es = new EventSource(`http://localhost:${port}/__server_sent_events__`);

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


// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   console.log('Message received in background script:', message);
//   if (message && message.type === 'transcribe' && message.blobUrl) {
//     console.log('Message received in background script:', message);
//     try {
//       const response = await fetch(message.blobUrl);
//       const blob = await response.blob();
//        const currFile = new File([contentState.blob], "transcript.mp4", { type: "video/mp4" });
//        let formData = new FormData();
//        formData.append("file", currFile);
//        formData.append("response_format", "json")
//       const res = fetch("http://localhost:5002/inference", {
//       method: "POST",
//       body: formData,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//       },
//       })
//       .then(response => response.json())
//       .then(data => console.log(data));


//       // Now you have access to the Blob object
//       // Do whatever processing you need with the blob
//       console.log('Received Blob:', blob);
//       // Send a response back to the sender
     
//     } catch (error) {
//       console.error('Error fetching Blob:', error);
//       // Handle errors and optionally send an error response back to the sender
//       sendResponse({ received: false, error: error.message });
//     }
//   }
// });