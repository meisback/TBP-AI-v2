
// =============================
// TBP AI v2.0 - Part 3A
// Basic Chat Functions
// =============================

// Backend URL
const API_URL = "https://YOUR-BACKEND.onrender.com/chat";

// Elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const typing = document.getElementById("typing");
const newChatBtn = document.getElementById("newChatBtn");
const themeBtn = document.getElementById("themeBtn");

// Conversation memory
let messages = [];

// Add message
function addMessage(text, sender) {

    const wrapper = document.createElement("div");
    wrapper.className = `${sender} message`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text;

    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Typing animation
function showTyping() {
    typing.style.display = "block";
}

function hideTyping() {
    typing.style.display = "none";
}
