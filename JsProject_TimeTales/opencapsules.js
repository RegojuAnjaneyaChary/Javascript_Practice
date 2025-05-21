import { db } from "./firebase.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const titleEl = document.getElementById("title");
const descriptionEl = document.getElementById("description");
const openDateEl = document.getElementById("openDate");
const mediaPreview = document.getElementById("mediaPreview");
const shareBtn = document.getElementById("shareBtn");
const message = document.getElementById("message");

// Get capsule ID from URL: ?id=CAPSULE_ID
const urlParams = new URLSearchParams(window.location.search);
const capsuleId = urlParams.get("id");

if (!capsuleId) {
  titleEl.textContent = "Invalid capsule ID.";
  throw new Error("No capsule ID");
}

const loadCapsule = async () => {
  const docRef = doc(db, "capsules", capsuleId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    titleEl.textContent = "Capsule not found.";
    return;
  }

  const data = snapshot.data();
  const now = new Date();
  const openDate = new Date(data.openDate);

  titleEl.textContent = data.title;
  descriptionEl.textContent = data.description;
  openDateEl.textContent = data.openDate;

  if (now < openDate) {
    message.textContent = `⏳ This capsule will unlock on ${data.openDate}`;
    shareBtn.style.display = "none";
    return;
  }

  // Show media
  const mediaURL = data.mediaURL;
  if (mediaURL.match(/\.(jpg|jpeg|png|gif)$/i)) {
    mediaPreview.innerHTML = `<img src="${mediaURL}" alt="Capsule Image" />`;
  } else if (mediaURL.match(/\.(mp4|webm)$/i)) {
    mediaPreview.innerHTML = `<video controls src="${mediaURL}"></video>`;
  } else if (mediaURL.match(/\.(mp3|wav)$/i)) {
    mediaPreview.innerHTML = `<audio controls src="${mediaURL}"></audio>`;
  } else {
    mediaPreview.innerHTML = `<a href="${mediaURL}" target="_blank">Download File</a>`;
  }
};

loadCapsule();

// Share functionality
shareBtn.addEventListener("click", async () => {
  const shareURL = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: "Open my TimeTales capsule", url: shareURL });
  } else {
    navigator.clipboard.writeText(shareURL);
    alert("Link copied to clipboard!");
  }
});
