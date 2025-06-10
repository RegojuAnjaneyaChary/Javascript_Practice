import { db, auth } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";
import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";

const container = document.querySelector(".container");
const logoutBtn = document.getElementById("logoutBtn");

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// On user login
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }
  await loadOpenCapsules(user.uid);
});

async function loadOpenCapsules(userId) {
  if (!container) return console.error("Missing .container element in HTML");

  const now = new Date();
  const q = query(collection(db, "capsules"), where("userId", "==", userId));
  const snapshot = await getDocs(q);
  let found = false;

  container.innerHTML = "";

  snapshot.forEach(docSnap => {
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

      // WhatsApp logic
      let whatsappBtn = "";
      if (data.mobile) {
        const cleanMobile = data.mobile.replace(/\D/g, "");
        if (cleanMobile.length >= 10) {
          const countryCode = cleanMobile.startsWith("91") ? "" : "91"; // assume India if not provided
          const msg = encodeURIComponent(
            `🎉 Your TimeTales capsule is now open! 🎁\n\n📌 Title: ${data.title}\n📝 Description: ${data.description || "No description"}\n${data.media ? `📎 Media: ${data.media}\n` : ""}\n📅 Opened on: ${openAt.toLocaleString()}`
          );
          whatsappBtn = `
            <a class="whatsapp-share" href="https://wa.me/${countryCode}${cleanMobile}?text=${msg}" target="_blank">
              📲 Share on WhatsApp
            </a>`;
        }
      }

      // SMS logic
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
        ${whatsappBtn}
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
  if (/\.(jpg|jpeg|png|gif)$/i.test(mediaURL)) {
    return `<img src="${mediaURL}" alt="Capsule Image" style="max-width:100%;max-height:300px;">`;
  } else if (/\.(mp4|webm)$/i.test(mediaURL)) {
    return `<video controls src="${mediaURL}" style="max-width:100%;max-height:300px;"></video>`;
  } else if (/\.(mp3|wav)$/i.test(mediaURL)) {
    return `<audio controls src="${mediaURL}"></audio>`;
  } else {
    return `<a href="${mediaURL}" target="_blank">📁 View/Download Media</a>`;
  }
}