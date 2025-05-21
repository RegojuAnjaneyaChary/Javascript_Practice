import { db, storage, auth } from "./firebase.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-storage.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const form = document.getElementById("capsule-form");
const mediaInput = document.getElementById("media");
const authBtn = document.getElementById("authBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const description = document.getElementById("description").value;
  const openDate = document.getElementById("openDate").value;
  const mediaFile = mediaInput.files[0];

  if (!mediaFile) {
    alert("Please select a file");
    return;
  }

  try {
    // Upload media file to Firebase Storage
    // const mediaRef = ref(storage, `capsules/${Date.now()}_${mediaFile.name}`);

    const mediaRef = ref(storage, `capsules/${mediaFile.name}`);

    await uploadBytes(mediaRef, mediaFile);     
    const mediaURL = await getDownloadURL(mediaRef);

    // Save metadata to Firestore
    const saveddata=await addDoc(collection(db, "capsules"), {
      title,
      description,
      openDate,
      mediaURL,
      createdAt: serverTimestamp(),
      userId: auth.currentUser?.uid || null
    });
    console.log('capsule data', saveddata.id)

    alert("Capsule saved successfully!");
    console.log(title)
    console.log(description)
    console.log(openDate)
    
    // form.reset();
  } catch (error) {
    console.error("Error saving capsule:", error);
    alert("Failed to save capsule.");
  }
});

// Logout

// authcurrentuser=authBtn.addEventListener("click", () => {
//   signOut(auth)
//     .then(() => {
//       window.location.href = "./login.html";
//     })
//     console.log("user logged out", authcurrentuser )

//     .catch((error) => {
//       console.error("Logout error:", error);
//       alert("Failed to log out.");
//     });
// });



