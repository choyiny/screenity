import signIn from './signIn';

// Function to upload a video to Google Drive
const saveToDrive = async (videoBlob, fileName, sendResponse) => {
  chrome.storage.sync.get('uploadToken', function (data) {
    let token = data.uploadToken;
    if (!token) {
      token = prompt('Please input upload token for Artoo');
      chrome.storage.sync.set({ uploadToken: token });
    }
    return new Promise(async (resolve, reject) => {
      try {
        // Get the access token from Chrome storage
        if (!token || token === null) {
          throw new Error('Sign-in failed');
        }

        var metadata = {
          name: fileName,
          mimeType: videoBlob.type,
        };

        var form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', videoBlob);

        // Upload to Artoo
        const uploadResponse = await fetch('https://artoo.verto-staging.workers.dev/videos', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Error uploading to Google Drive: ${uploadResponse.status}`);
        }

        const responseData = await uploadResponse.json();

        sendResponse({ status: 'ok', responseData: responseData });

        resolve(true); // Return the file ID if needed
      } catch (error) {
        console.error('Error uploading to Verto Drive:', error.message);
        sendResponse({ status: 'ew', url: null });
        reject(error);
      }
    });
  });
};

export default saveToDrive;
