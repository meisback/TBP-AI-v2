
// =============================
// TBP AI v2.0 - Part 3A
// Basic Chat Functions
// =============================

// Backend URL
const API_URL = "https://tbp-ai-v2.onrender.com/chat";

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
// =============================
// TBP AI v2.0 - Part 3B
// Send Message
// =============================

async function sendMessage() {

    const text = userInput.value.trim();

    if (!text) return;

    // User Message
    addMessage(text, "user");

    messages.push({
        role: "user",
        content: text
    });

    userInput.value = "";

    showTyping();
    createTypingBubble();

    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text,
                history: messages
            })

        });

        const data = await response.json();

        hideTyping();
removeTypingBubble();

const reply =
            data.reply ||
            "⚠️ কোনো উত্তর পাওয়া যায়নি।";

        addMessage(reply, "bot");

        messages.push({
            role: "assistant",
            content: reply
        });

    } catch (error) {

        hideTyping();
removeTypingBubble();

addMessage(
            "❌ সার্ভারের সাথে সংযোগ করা যাচ্ছে না। পরে আবার চেষ্টা করুন।",
            "bot"
        );

        console.error(error);

    }

}

// Send Button
sendBtn.addEventListener("click", sendMessage);

// Press Enter
userInput.addEventListener("keydown", function(e){

    if(e.key === "Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});
// =============================
// TBP AI v2.0 - Part 3C
// Chat History + New Chat + Theme
// =============================

// Save Chat
function saveChat() {
    localStorage.setItem("tbp_messages", JSON.stringify(messages));
}

// Load Chat
function loadChat() {

    const saved = localStorage.getItem("tbp_messages");

    if (!saved) return;

    messages = JSON.parse(saved);

    chatBox.innerHTML = "";

    messages.forEach(msg => {

        addMessage(
            msg.content,
            msg.role === "user" ? "user" : "bot"
        );

    });

}

// Save automatically
const oldPush = messages.push;

messages.push = function (...items) {
    const result = oldPush.apply(this, items);
    saveChat();
    return result;
};

// New Chat
newChatBtn.addEventListener("click", () => {

    if (!confirm("নতুন Chat শুরু করবেন?")) return;

    messages = [];

    localStorage.removeItem("tbp_messages");

    chatBox.innerHTML = "";

    addMessage(
        "👋 নতুন Chat শুরু হয়েছে।",
        "bot"
    );

});

// Theme
themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("light");

    localStorage.setItem(
        "tbp_theme",
        document.body.classList.contains("light")
            ? "light"
            : "dark"
    );

});

// Load Theme
const savedTheme = localStorage.getItem("tbp_theme");

if (savedTheme === "light") {
    document.body.classList.add("light");
}

// Load Chat on Start
loadChat();
// =============================
// TBP AI v2.0 - Part 3D
// Copy Button + Message Actions
// =============================

// Copy Text
async function copyMessage(text) {

    try {

        await navigator.clipboard.writeText(text);

        alert("✅ Message Copied");

    } catch (e) {

        alert("❌ Copy Failed");

    }

}

// Update addMessage()

function addMessage(text, sender) {

    const wrapper = document.createElement("div");
    wrapper.className = `${sender} message`;

    const bubble = document.createElement("div");
    bubble.className = "bubble";
    bubble.innerHTML = text;

    const actions = document.createElement("div");
    actions.className = "message-actions";

    const copyBtn = document.createElement("button");
    copyBtn.innerHTML = "📋";
    copyBtn.title = "Copy";
    copyBtn.onclick = () => copyMessage(text);

    actions.appendChild(copyBtn);

    bubble.appendChild(actions);

    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}
// =============================
// TBP AI v2.0 - Part 3E
// AI Typing Animation
// =============================

// Create typing bubble
function createTypingBubble() {

    const wrapper = document.createElement("div");
    wrapper.className = "bot message";
    wrapper.id = "typingBubble";

    wrapper.innerHTML = `
        <div class="bubble">
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
            <span class="typing-dot"></span>
        </div>
    `;

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;
}

// Remove typing bubble
function removeTypingBubble() {

    const bubble = document.getElementById("typingBubble");

    if (bubble) {

        bubble.remove();

    }

}
// =============================
// TBP AI v2.0 - Part 3F
// Like, Dislike & Regenerate
// =============================

// Like Message
function likeMessage(button) {
    button.innerHTML = "💚";
}

// Dislike Message
function dislikeMessage(button) {
    button.innerHTML = "❤️";
}

// Regenerate
function regenerateResponse(lastMessage) {

    userInput.value = lastMessage;

    sendMessage();

}

// Send Button
sendBtn.addEventListener("click", sendMessage);

// Enter Key Support
userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
// ==============================
// TBP AI v2.0 - Part 3I
// Login System
// ==============================

const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

// Already logged in?
const savedUser = localStorage.getItem("tbp_username");

if (savedUser) {
    loginScreen.style.display = "none";
}

// Login
loginBtn.addEventListener("click", () => {

    const name = usernameInput.value.trim();

    if (!name) {
        alert("আপনার নাম লিখুন");
        return;
    }

    localStorage.setItem("tbp_username", name);

    loginScreen.style.display = "none";

    addMessage(
        `👋 স্বাগতম <b>${name}</b>!`,
        "bot"
    );

});
console.log("TBP AI Script Loaded");

loginBtn.onclick = () => {
    alert("Login Button Working!");
};
// ==============================
// TBP AI v3.0
// Phase 2B - Wallpaper System
// ==============================

const wallpaperBtn = document.getElementById("wallpaperBtn");
const wallpaperPanel = document.getElementById("wallpaperPanel");
const closeWallpaper = document.getElementById("closeWallpaper");
const wallpapers = document.querySelectorAll(".wallpaper");

// Open Panel
if (wallpaperBtn) {
    wallpaperBtn.addEventListener("click", () => {
        wallpaperPanel.style.display = "flex";
    });
}

// Close Panel
if (closeWallpaper) {
    closeWallpaper.addEventListener("click", () => {
        wallpaperPanel.style.display = "none";
    });
}

// Select Wallpaper
wallpapers.forEach(item => {

    item.addEventListener("click", () => {

        const wall = item.dataset.wall;

        document.body.style.backgroundImage =
            `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url('${wall}')`;

        localStorage.setItem("tbp_wallpaper", wall);

        wallpaperPanel.style.display = "none";

    });

});

// Load Saved Wallpaper
const savedWallpaper = localStorage.getItem("tbp_wallpaper");

if (savedWallpaper) {

    document.body.style.backgroundImage =
        `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url('${savedWallpaper}')`;

}
