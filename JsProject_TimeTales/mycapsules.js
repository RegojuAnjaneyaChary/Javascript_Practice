import { auth, db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

let currentId = null;

// Fetch and display capsules
onAuthStateChanged(auth, async (user) => {
  if (!user) return (window.location.href = "login.html");

  const q = query(collection(db, "capsules"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);
  const list = document.getElementById("capsule-list");
  list.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const openDate = data.openAt.toDate();
    const now = new Date();

    const li = document.createElement("li");
    li.className = "capsule";
    li.innerHTML = `
      <h4>${data.title}</h4>
      <p>${data.description}</p>
      ${
        now >= openDate
          ? `<a href="${data.media}" target="_blank">Open Capsule</a>`
          : `<em>🔒 Capsule locked until: ${openDate.toLocaleString()}</em>`
      }
      <br>
      <button class="btn primary" onclick='window.editCapsule("${docSnap.id}")'>Edit</button>
      <button class="btn danger" onclick='window.deleteCapsule("${docSnap.id}")'>Delete</button>
      <hr/>
    `;
    // Store data for editing
    li.dataset.capsule = JSON.stringify({
      id: docSnap.id,
      ...data,
      openAt: openDate.toISOString()
    });
    list.appendChild(li);
  });
});

// Edit Capsule
window.editCapsule = (id) => {
  currentId = id;
  const list = document.getElementById("capsule-list");
  const li = Array.from(list.children).find(
    (el) => JSON.parse(el.dataset.capsule).id === id
  );
  const data = JSON.parse(li.dataset.capsule);

  document.getElementById("editForm").classList.remove("hidden");
  document.getElementById("editTitle").value = data.title;
  document.getElementById("editDesc").value = data.description;
  document.getElementById("editMedia").value = data.media;
  document.getElementById("editOpenAt").value = data.openAt.slice(0, 16);
};

// Update Capsule
document.getElementById("updateBtn").addEventListener("click", async () => {
  if (!currentId) return;

  const title = document.getElementById("editTitle").value;
  const description = document.getElementById("editDesc").value;
  const media = document.getElementById("editMedia").value;
  const openAtInput = document.getElementById("editOpenAt").value;
  const openAt = new Date(openAtInput);

  await updateDoc(doc(db, "capsules", currentId), {
    title,
    description,
    media,
    openAt
  });

  alert("Capsule updated!");
  document.getElementById("editForm").classList.add("hidden");
  location.reload();
});

// Delete Capsule
window.deleteCapsule = async (id) => {
  if (confirm("Delete this capsule?")) {
    await deleteDoc(doc(db, "capsules", id));
    alert("Capsule deleted!");
    location.reload();
  }
};

// Cancel Edit
document.getElementById("cancelEditBtn").addEventListener("click", () => {
  document.getElementById("editForm").classList.add("hidden");
  currentId = null;
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});
