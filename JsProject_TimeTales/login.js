import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

document.getElementById("Loginform").addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        Swal.fire("Error", "Please fill in all fields.", "warning");
        return;
    }

    try {
        await signInWithEmailAndPassword(auth, email, password);

        await Swal.fire({
            title: "Login Successful!",
            text: "Welcome back!",
            icon: "success",
            confirmButtonText: "OK"
        });

        window.location.href = "./dashboard.html";

    } catch (error) {
        Swal.fire("Login Failed", error.message, "error");
    }
});
