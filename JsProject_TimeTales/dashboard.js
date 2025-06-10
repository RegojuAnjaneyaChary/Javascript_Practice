import { db, auth } from "./firebase.js";
import { serverTimestamp, addDoc, collection } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-firestore.js";
import { signOut } from "https://www.gstatic.com/firebasejs/11.7.0/firebase-auth.js";

const form = document.getElementById("capsule-form");
const mobileInput = document.getElementById("mobile");
const smsLink = document.getElementById("smsLink");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("title").value.trim();
    const description = document.getElementById("description").value.trim();
    const media = document.getElementById("media").value.trim();
    const mobile = mobileInput.value.trim();
    const openDate = document.getElementById("openDate").value;
    const closeTime = document.getElementById("closeTime").value;

    if (!title || !openDate || !closeTime || !mobile) {
      alert("Please fill in all required fields.");
      return;
    }

    const [year, month, day] = openDate.split("-");
    const time24 = convertTo24Hour(closeTime);
    const openTimeString = `${year}-${month}-${day}T${time24}:00`;
    const fullOpenTime = new Date(openTimeString);

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

      alert(
        `Capsule saved!\n\nTitle: ${title}\nDescription: ${description || "No description"}\nOpens at: ${fullOpenTime.toLocaleString()}`
      );

      // Show SMS link after saving
      const cleanMobile = mobile.replace(/\D/g, "");
      if (cleanMobile.length >= 10 && smsLink) {
        const msg = encodeURIComponent(
          `Your TimeTales capsule "${title}" has been created!\nDescription: ${description || "No description"}\nOpens at: ${fullOpenTime.toLocaleString()}`
        );
        smsLink.href = `sms:${cleanMobile}?body=${msg}`;
        smsLink.style.display = "inline";
      } else if (smsLink) {
        smsLink.style.display = "none";
      }

      form.reset();
    } catch (err) {
      console.error("Error saving capsule:", err);
      alert("Error saving capsule.");
    }
  });
}

// SMS share link logic (shows link when mobile is valid)
if (mobileInput && smsLink) {
  mobileInput.addEventListener("input", () => {
    const mobile = mobileInput.value.replace(/\D/g, "");
    if (mobile.length >= 10) {
      const msg = encodeURIComponent("Your TimeTales capsule has been created!");
      smsLink.href = `sms:${mobile}?body=${msg}`;
      smsLink.style.display = "inline";
    } else {
      smsLink.style.display = "none";
    }
  });
}

function convertTo24Hour(time) {
  let [hour, minute] = time.split(":");
  hour = parseInt(hour, 10);
  minute = parseInt(minute, 10);

  if (
    isNaN(hour) || isNaN(minute) ||
    hour < 0 || hour > 23 ||
    minute < 0 || minute > 59
  ) {
    return null;
  }

  return `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
}

// Logout button
const logoutBtn = document.getElementById("authBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    });
  });
}