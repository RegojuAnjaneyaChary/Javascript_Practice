import { db } from "./firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";

const container = document.querySelector(".container");
const now = new Date();

async function loadOpenCapsules() {
  const snapshot = await getDocs(collection(db, "capsules"));
  let found = false;

  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (!data.openAt) return;
    const openAt = data.openAt.toDate ? data.openAt.toDate() : new Date(data.openAt);

    if (now >= openAt) {
      found = true;
      // Create capsule display
      const capsuleDiv = document.createElement("div");
      capsuleDiv.className = "open-capsule";
      capsuleDiv.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.description || ""}</p>
        <p><strong>Opened on:</strong> ${openAt.toLocaleString()}</p>
        ${data.media ? renderMedia(data.media) : "<em>No media</em>"}
        <hr/>
      `;
      container.appendChild(capsuleDiv);
    }
  });

  if (!found) {
    container.innerHTML += `<p style="text-align:center;">No capsules are open yet!</p>`;
  }
}

function renderMedia(mediaURL) {
  if (mediaURL.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return `<img src="${mediaURL}" alt="Capsule Image" style="max-width:100%;max-height:300px;">`;
  } else if (mediaURL.match(/\.(mp4|webm)$/i)) {
    return `<video controls src="${mediaURL}" style="max-width:100%;max-height:300px;"></video>`;
  } else if (mediaURL.match(/\.(mp3|wav)$/i)) {
    return `<audio controls src="${mediaURL}"></audio>`;
  } else {
    return `<a href="${mediaURL}" target="_blank">Download File</a>`;
  }
}

loadOpenCapsules();
