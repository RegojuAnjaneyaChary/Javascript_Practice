import { db, storage, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { deleteObject, ref as storageRef } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

const listContainer = document.getElementById("capsule-list");
const editModal = document.getElementById("editModal");
const editTitle = document.getElementById("editTitle");
const editDescription = document.getElementById("editDescription");
const editOpenDate = document.getElementById("editOpenDate");
const saveEditBtn = document.getElementById("saveEditBtn");
const closeModalBtn = document.getElementById("closeModalBtn");

let currentEditId = null;

// Fetch and display capsules
async function loadCapsules() {
  const user = auth.currentUser;
  if (!user) return;

  const q = query(collection(db, "capsules"), where("userId", "==", user.uid));
  const snapshot = await getDocs(q);

  listContainer.innerHTML = "";
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const card = document.createElement("div");
    card.className = "capsule-card";
    card.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.description}</p>
      <p>Opens on: ${data.openDate}</p>
      <button onclick="editCapsule('${docSnap.id}', '${data.title}', '${data.description}', '${data.openDate}')">Edit</button>
      <button onclick="deleteCapsule('${docSnap.id}', '${data.mediaURL}')">Delete</button>
    `;
    listContainer.appendChild(card);
  });
}

// Delete capsule
window.deleteCapsule = async (id, mediaURL) => {
  if (!confirm("Delete this capsule?")) return;

  await deleteDoc(doc(db, "capsules", id));

  // Delete from Storage
  const mediaPath = new URL(mediaURL).pathname.split("/o/")[1].split("?")[0];
  const decodedPath = decodeURIComponent(mediaPath);
  await deleteObject(storageRef(storage, decodedPath));

  alert("Capsule deleted");
  loadCapsules();
};

// Edit capsule
window.editCapsule = (id, title, description, openDate) => {
  currentEditId = id;
  editTitle.value = title;
  editDescription.value = description;
  editOpenDate.value = openDate;
  editModal.style.display = "block";
};

// Save edited capsule
saveEditBtn.addEventListener("click", async () => {
  if (!currentEditId) return;

  const docRef = doc(db, "capsules", currentEditId);
  await updateDoc(docRef, {
    title: editTitle.value,
    description: editDescription.value,
    openDate: editOpenDate.value
  });

  alert("Capsule updated");
  editModal.style.display = "none";
  loadCapsules();
});

closeModalBtn.addEventListener("click", () => {
  editModal.style.display = "none";
});

auth.onAuthStateChanged((user) => {
  if (user) loadCapsules();
  else window.location.href = "login.html";
});
