import { auth, db } from "./firebase.js";
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-firestore.js";

document.getElementById("SignUpform").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
       
        const usercredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = usercredential.user;
        console.log("user created successfully", user);
        alert("user created successfully");
        const docRef = await addDoc(collection(db, "users"), {
            name,
            email,
            password
        });
        console.log("Document written with ID: ", docRef.id);
        window.location.href = "./Login.html";

    }
    catch (error) {
        console.error("error creating user", error);
        console.error("Error adding document: ", error);
        alert(error.message);

    }
});