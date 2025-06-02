import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";

document.getElementById("SignUpform").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        console.log("User created successfully", user);

        // Store user info in Firestore (do NOT store password)
        await addDoc(collection(db, "users"), {
            name,
            email,
            uid: user.uid
        });

        alert("User created successfully");
        window.location.href = "./login.html";
    } catch (error) {
        console.error("Error creating user", error);
        alert(error.message);
    }
});