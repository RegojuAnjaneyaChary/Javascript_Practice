import { auth } from "./firebase.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.7.1/firebase-auth.js";

document.getElementById("Loginform").addEventListener("submit", async(e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

try{
    const usercredential = await signInWithEmailAndPassword(auth, email, password);
    const user = usercredential.user;
    console.log("user logged in suucessfully", user);
    alert("user logged in successfully");
    window.location.href="./dashboard.html";
}
catch(error){
    console.error("error logging in user", error);
    alert(error.message);
}
});