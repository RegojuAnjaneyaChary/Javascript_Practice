import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";

const container = document.querySelector(".container");
const logoutBtn = document.getElementById("logoutBtn");
const navbarUsername = document.getElementById("navbar-username");

// Show user name in navbar
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    // window.location.href = "login.html";
    return;
  }

  // Fetch and show user name
  if (navbarUsername) {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      navbarUsername.textContent = `Welcome, ${userData.name}`;
    }
  }

  await loadOpenCapsules(user.uid);
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// Load open capsules for user
async function loadOpenCapsules(userId) {
  if (!container) return console.error("Missing .container element in HTML");

  const now = new Date();
  const q = query(collection(db, "capsules"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  let found = false;

  container.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (!data.openAt) return;

    let openAt;
    try {
      openAt = data.openAt.toDate ? data.openAt.toDate() : new Date(data.openAt);
      if (isNaN(openAt)) throw new Error("Invalid openAt format");
    } catch {
      return;
    }

    if (now >= openAt) {
      found = true;
      const capsuleDiv = document.createElement("div");
      capsuleDiv.className = "open-capsule";

      // SMS share button
      let smsBtn = "";
      if (data.mobile) {
        const cleanMobile = data.mobile.replace(/\D/g, "");
        if (cleanMobile.length >= 10) {
          const smsMsg = encodeURIComponent(
            `Your TimeTales capsule is now open!\nTitle: ${data.title}\nDescription: ${data.description || "No description"}\n${data.media ? `Media: ${data.media}\n` : ""}Opened on: ${openAt.toLocaleString()}`
          );
          smsBtn = `
            <a class="sms-share" href="sms:${cleanMobile}?body=${smsMsg}">
              📩 Send SMS
            </a>`;
        }
      }

      capsuleDiv.innerHTML = `
        <h2>${data.title}</h2>
        <p>${data.description || "No description provided."}</p>
        <p><strong>Opened on:</strong> ${openAt.toLocaleString()}</p>
        <p><strong>Created by:</strong> ${data.userEmail || data.userId}</p>
        ${data.media ? renderMedia(data.media) : "<em>No media</em>"}
        ${smsBtn}
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
  if (!mediaURL) return "<em>No media</em>";

  const parts = mediaURL.split('/');
  const fileName = decodeURIComponent(parts[parts.length - 1]); // extract file name from URL
  const fileExtension = fileName.split('.').pop().toLowerCase();

  if (/\.(jpg|jpeg|png|gif|webp)$/i.test(fileName)) {
    return `<img src="${mediaURL}" alt="${fileName}" 
      style="max-width:100%;max-height:300px;border-radius:8px;
      box-shadow:0 1px 6px rgba(0,0,0,0.07);margin:1rem 0;">`;
  }

  else if (/\.(mp4|webm)$/i.test(fileName)) {
    return `<video controls src="${mediaURL}"
      style="max-width:100%;max-height:300px;border-radius:8px;
      box-shadow:0 1px 6px rgba(0,0,0,0.07);margin:1rem 0;"></video>`;
  }

  else if (/\.(mp3|wav|ogg)$/i.test(fileName)) {
    return `<audio controls src="${mediaURL}" style="width:100%;margin:1rem 0;"></audio>`;
  }

  else {
   
    return `
  <p class="media-link-wrapper">
    📁 <a href="${mediaURL}" target="_blank" rel="noopener noreferrer" class="media-link-button">
      Open ${fileName}
    </a>
  </p>`;

  }
}
