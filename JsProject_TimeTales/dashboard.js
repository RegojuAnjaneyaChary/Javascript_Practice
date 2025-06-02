import { db, auth } from "./firebase.js";
import { serverTimestamp, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

// Ensure user is authenticated
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "login.html";
  }
});

const form = document.getElementById("capsule-form");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const media = document.getElementById("media").value.trim();
    const openDate = document.getElementById("openDate").value;
    const closeTime = document.getElementById("closeTime").value;

    if (!title || !openDate || !closeTime) {
      alert("Please fill in all required fields.");
      return;
    }

    // Parse date and time
    const [year, month, day] = openDate.split("-");
    const isoDate = `${year}-${month}-${day}`;
    const time24 = convertTo24Hour(closeTime);

    const openTimeString = `${isoDate}T${time24}:00`;
    const fullOpenTime = new Date(openTimeString);

    if (isNaN(fullOpenTime.getTime())) {
      alert("Invalid date or time.");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("User not authenticated.");
        return;
      }

      // Add a new capsule document to the "capsules" collection
      await addDoc(collection(db, "capsules"), {
        title,
        description,
        media,
        openAt: fullOpenTime, // This is a JS Date, Firestore will store as Timestamp
        createdAt: serverTimestamp(),
        userId: user.uid
      });

      alert("Capsule saved!");
      form.reset();
    } catch (err) {
      console.error("Error saving capsule:", err);
      alert("Error saving capsule.");
    }
  });
}

function convertTo24Hour(time) {
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);

  if (
    isNaN(hour) || isNaN(minute) ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return null;
  }

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Logout button
const logoutBtn = document.getElementById("authBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}
