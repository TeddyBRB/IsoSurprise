// Change this to your YouTube link.
const YOUTUBE_LINK = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

const form = document.getElementById("passwordForm");
const input = document.getElementById("passwordInput");
const hint = document.getElementById("hint");
const secretBox = document.getElementById("secretBox");
const messageText = document.getElementById("messageText");
const card = document.querySelector(".card");
const confettiButton = document.getElementById("confettiButton");

confettiButton.href = YOUTUBE_LINK;

function fromBase64(value) {
  return Uint8Array.from(atob(value), character => character.charCodeAt(0));
}

async function getKeyFromPassword(password, salt) {
  const encoder = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: SECRET_DATA.iterations,
      hash: "SHA-256"
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

async function decryptMessage(password) {
  const salt = fromBase64(SECRET_DATA.salt);
  const iv = fromBase64(SECRET_DATA.iv);
  const ciphertext = fromBase64(SECRET_DATA.ciphertext);
  const key = await getKeyFromPassword(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const password = input.value.trim();

  if (!password) {
    hint.textContent = "You gotta type the secret password first.";
    return;
  }

  try {
    const message = await decryptMessage(password);

    messageText.textContent = message;
    secretBox.classList.remove("hidden");
    confettiButton.classList.remove("hidden");
    hint.textContent = "Access approved.";
    input.value = "";
  } catch {
    secretBox.classList.add("hidden");
    confettiButton.classList.add("hidden");
    hint.textContent = "Wrong password.";
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
  }
});
