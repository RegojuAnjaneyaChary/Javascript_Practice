import { db, auth } from "./firebase.js";
import {
  serverTimestamp,
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

// Show user's name in navbar
const navbarUsername = document.getElementById("navbar-username");

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const userData = querySnapshot.docs[0].data();
      if (navbarUsername) {
        navbarUsername.textContent = `Welcome, ${userData.name}`;
      }
    }
  }
});

// Handle capsule form submission
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
      Swal.fire("Missing Fields", "Please fill in all required fields.", "warning");
      return;
    }

    const time24 = convertTo24Hour(closeTime);
    const fullOpenTime = new Date(`${openDate}T${time24}:00`);

    if (isNaN(fullOpenTime.getTime())) {
      Swal.fire("Invalid Input", "Invalid date or time format.", "error");
      return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire("Not Authenticated", "Please login first.", "error");
        return;
      }

      await addDoc(collection(db, "capsules"), {
        title,
        description,
        media,
        openAt: fullOpenTime,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email,
      });

      await Swal.fire({
        title: "Capsule Saved!",
        html: `
          <b>Title:</b> ${title}<br>
          <b>Description:</b> ${description || "No description"}<br>
          <b>Opens at:</b> ${fullOpenTime.toLocaleString()}
        `,
        icon: "success",
        confirmButtonText: "OK"
      });

      form.reset(); // Optional: Clear form after saving

    } catch (error) {
      console.error("Error saving capsule:", error);
      Swal.fire("Error", "Failed to save capsule. Please try again.", "error");
    }
  });
}

function convertTo24Hour(time) {
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);
  if (isNaN(hour) || isNaN(minute)) return null;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Logout button
const logoutBtn = document.getElementById("authBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Logout?",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Logout",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth).then(() => {
          window.location.href = "login.html";
        });
      }
    });
  });
}
