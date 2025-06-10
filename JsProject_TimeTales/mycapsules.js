import { db, auth } from "./firebase.js";
import { serverTimestamp, addDoc, collection, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

const form = document.getElementById("capsule-form");
const mobileInput = document.getElementById("mobile");
const smsLink = document.getElementById("smsLink");
const whatsappLink = document.getElementById("whatsappLink");
const capsuleList = document.getElementById("capsule-list");

// --- Capsule Creation ---
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title")?.value.trim();
    const description = document.getElementById("description")?.value.trim();
    const media = document.getElementById("media")?.value.trim();
    const mobile = mobileInput?.value.trim();
    const openDate = document.getElementById("openDate")?.value;
    const closeTime = document.getElementById("closeTime")?.value;

    if (!title || !openDate || !closeTime || !mobile) {
      alert("Please fill in all required fields.");
      return;
    }

    const time24 = convertTo24Hour(closeTime);
    if (!time24) {
      alert("Invalid time format.");
      return;
    }

    const fullOpenTime = new Date(`${openDate}T${time24}:00`);
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

      // Save to Firestore
      await addDoc(collection(db, "capsules"), {
        title,
        description,
        media,
        mobile,
        openAt: fullOpenTime,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userEmail: user.email
      });

      alert("Capsule saved!");

      // Show SMS share button after saving
      const cleanMobile = mobile.replace(/\D/g, "");
      if (cleanMobile.length >= 10 && smsLink) {
        const msg = encodeURIComponent(
          `🎉 Your TimeTales capsule has been created!\n\n📌 Title: ${title}\n📝 Description: ${description || "No description"}\n📅 Opens at: ${fullOpenTime.toLocaleString()}`
        );
        smsLink.href = `sms:${cleanMobile}?body=${msg}`;
        smsLink.style.display = "inline";
      } else if (smsLink) {
        smsLink.style.display = "none";
      }

      // Show WhatsApp share button after saving
      if (cleanMobile.length >= 10 && whatsappLink) {
        const msg = encodeURIComponent(
          `🎉 Your TimeTales capsule has been created!\n\n📌 Title: ${title}\n📝 Description: ${description || "No description"}\n📅 Opens at: ${fullOpenTime.toLocaleString()}`
        );
        whatsappLink.href = `https://wa.me/${cleanMobile}?text=${msg}`;
        whatsappLink.style.display = "inline";
      } else if (whatsappLink) {
        whatsappLink.style.display = "none";
      }

      form.reset();
      // Refresh the list after adding
      loadCapsules();
    } catch (err) {
      console.error("Error saving capsule:", err);
      alert("Error saving capsule.");
    }
  });
}

// --- WhatsApp link logic on mobile input ---
if (mobileInput && whatsappLink) {
  mobileInput.addEventListener("input", () => {
    const mobile = mobileInput.value.replace(/\D/g, "");
    const title = document.getElementById("title")?.value.trim() || "";
    const description = document.getElementById("description")?.value.trim() || "";
    if (mobile.length >= 10) {
      const msg = encodeURIComponent(
        `Your TimeTales capsule:\nTitle: ${title}\nDescription: ${description || "No description"}`
      );
      whatsappLink.href = `https://wa.me/${mobile}?text=${msg}`;
      whatsappLink.style.display = "inline";
    } else {
      whatsappLink.style.display = "none";
    }
  });
}

// --- Fetch and Display Capsules ---
async function loadCapsules() {
  if (!capsuleList) return;
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
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const openAt = data.openAt?.toDate ? data.openAt.toDate() : new Date(data.openAt);
      const li = document.createElement("li");
      li.innerHTML = `
        <strong>${data.title}</strong><br>
        ${data.description || ""}<br>
        <small>Opens at: ${openAt.toLocaleString()}</small><br>
        <button onclick="editCapsule('${docSnap.id}')">Edit</button>
        <button onclick="deleteCapsule('${docSnap.id}')">Delete</button>
        <hr>
      `;
      capsuleList.appendChild(li);
    });
  });
}

// --- Edit and Delete Functions (window-scoped for button onclick) ---
window.editCapsule = async function (id) {
  // You can implement a modal or form population logic here
  alert("Edit functionality not implemented in this snippet.");
};

window.deleteCapsule = async function (id) {
  if (confirm("Delete this capsule?")) {
    await deleteDoc(doc(db, "capsules", id));
    alert("Capsule deleted!");
    loadCapsules();
  }
};

// --- Hide SMS and WhatsApp link by default ---
if (smsLink) {
  smsLink.style.display = "none";
}
if (whatsappLink) {
  whatsappLink.style.display = "none";
}

// --- Logout button ---
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}

// --- Utility: Convert to 24-hour format ---
function convertTo24Hour(time) {
  if (!time.includes(":")) return null;
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);
  if (isNaN(hour) || isNaN(minute) || hour > 23 || minute > 59) return null;
  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// --- Load capsules on page load ---
loadCapsules();