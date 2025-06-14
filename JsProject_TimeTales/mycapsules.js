import { db, auth } from "./firebase.js";
import {
  serverTimestamp,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import {
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

// Navbar username
const navbarUsername = document.getElementById("navbar-username");
onAuthStateChanged(auth, async (user) => {
  if (user && navbarUsername) {
    const q = query(collection(db, "users"), where("uid", "==", user.uid));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const userData = snapshot.docs[0].data();
      navbarUsername.textContent = `Welcome, ${userData.name}`;
    }
  }
});

// Elements
const capsuleList = document.getElementById("capsule-list");
const form = document.getElementById("capsule-form");
const updateBtn = document.getElementById("updateBtn");
// const deleteBtn = document.getElementById("deleteBtn");
const cancelEditBtn = document.getElementById("cancelEditBtn");

let editingCapsuleId = null;

// Load capsules
async function loadCapsules() {
  capsuleList.innerHTML = "<li>Loading...</li>";
  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      capsuleList.innerHTML = "<li>Please log in to view your capsules.</li>";
      return;
    }
    const q = query(collection(db, "capsules"), where("userId", "==", user.uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      capsuleList.innerHTML = "<li>No capsules found.</li>";
      return;
    }

    capsuleList.innerHTML = "";
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const openAt = data.openAt?.toDate ? data.openAt.toDate() : new Date(data.openAt);
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.title}</strong><br>
        ${data.description || ""}<br>
        <small>Opens at: ${openAt.toLocaleString()}</small><br>
        <button class="btn primary" onclick="editCapsule('${docSnap.id}')">Edit</button>
        <button class="btn delete" onclick="deleteCapsule('${docSnap.id}')">Delete</button>
        <hr>
      `;
      capsuleList.appendChild(li);
    });
  });
}

// Edit capsule
window.editCapsule = async function (id) {
  const capsuleSnap = await getDocs(query(collection(db, "capsules"), where("__name__", "==", id)));
  if (!capsuleSnap.empty) {
    const data = capsuleSnap.docs[0].data();
    document.getElementById("title").value = data.title || "";
    document.getElementById("description").value = data.description || "";
    document.getElementById("media").value = data.media || "";
    const openAt = data.openAt?.toDate ? data.openAt.toDate() : new Date(data.openAt);
    document.getElementById("openDate").value = openAt.toISOString().slice(0, 10);
    document.getElementById("closeTime").value = openAt.toTimeString().slice(0, 5);

    editingCapsuleId = id;
    form.style.display = "block";
    form.scrollIntoView({ behavior: "smooth" });
  }
};

// Delete capsule
window.deleteCapsule = async function (id) {
  const confirmResult = await Swal.fire({
    title: "Delete Capsule?",
    text: "Are you sure you want to delete this capsule?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it!",
  });

  if (confirmResult.isConfirmed) {
    await deleteDoc(doc(db, "capsules", id));
    await Swal.fire("Deleted!", "Capsule has been deleted.", "success");
    form.style.display = "none";
    loadCapsules();
  }
};

// Update capsule
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingCapsuleId) return;

  const title = document.getElementById("title").value.trim();
  const description = document.getElementById("description").value.trim();
  const media = document.getElementById("media").value.trim();
  const openDate = document.getElementById("openDate").value;
  const closeTime = document.getElementById("closeTime").value;

  const time24 = convertTo24Hour(closeTime);
  const fullOpenTime = new Date(`${openDate}T${time24}:00`);
  if (isNaN(fullOpenTime.getTime())) {
    Swal.fire("Invalid Date", "Please enter a valid date and time.", "error");
    return;
  }

  try {
    await updateDoc(doc(db, "capsules", editingCapsuleId), {
      title,
      description,
      media,
      openAt: fullOpenTime,
    });

    await Swal.fire("Success", "Capsule updated successfully!", "success");

    form.reset();
    form.style.display = "none";
    editingCapsuleId = null;
    loadCapsules();
  } catch (err) {
    Swal.fire("Error", "Failed to update capsule.", "error");
  }
});

// Cancel edit
cancelEditBtn.addEventListener("click", () => {
  form.reset();
  form.style.display = "none";
  editingCapsuleId = null;
  Swal.fire("Cancelled", "Edit mode exited.", "info");
});

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    Swal.fire({
      title: "Logout?",
      text: "Do you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        signOut(auth).then(() => {
          window.location.href = "login.html";
        });
      }
    });
  });
}

// Helper
function convertTo24Hour(time) {
  if (!time.includes(":")) return null;
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);
  if (isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59) return null;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Initial load
loadCapsules();
