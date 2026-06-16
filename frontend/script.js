document.addEventListener("DOMContentLoaded", () => {
    // DOM Elements - Login
    const loginScreen = document.getElementById("loginScreen");
    const usernameInput = document.getElementById("username");
    const loginBtn = document.getElementById("loginBtn");
    const profileName = document.getElementById("profileName");

    // DOM Elements - Main Chat
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const typingIndicator = document.getElementById("typing");

    // DOM Elements - Modals & Buttons
    const wallpaperPanel = document.getElementById("wallpaperPanel");
    const settingsPanel = document.getElementById("settingsPanel");
    const profilePanel = document.getElementById("profilePanel");

    const wallpaperBtn = document.getElementById("wallpaperBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const profileBtn = document.getElementById("profileBtn");
    const openWallpaperBtn = document.getElementById("openWallpaperBtn");
    const themeBtn = document.getElementById("themeBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const newChatBtn = document.getElementById("newChatBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");

    const closeWallpaper = document.getElementById("closeWallpaper");
    const closeSettings = document.getElementById("closeSettings");
    const closeProfile = document.getElementById("closeProfile");

    // File Inputs
    const attachBtn = document.getElementById("attachBtn");
    const hiddenFileInput = document.getElementById("hiddenFileInput");

    // --- 1. Login System ---
    loginBtn.addEventListener("click", loginUser);
    usernameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") loginUser();
    });

    function loginUser() {
        const username = usernameInput.value.trim();
        if (username !== "") {
            profileName.innerText = username;
            loginScreen.style.display = "none";
            // ওয়েলকাম মেসেজ পাঠানো
            appendMessage("bot", `হ্যালো ${username}! আমি TBP AI। আজ আপনাকে কীভাবে সাহায্য করতে পারি?`);
        } else {
            alert("অনুগ্রহ করে আপনার নাম লিখুন!");
        }
    }

    // --- 2. Message Exchange System ---
    sendBtn.addEventListener("click", handleSendMessage);
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    function handleSendMessage() {
        const text = userInput.value.trim();
        if (text === "") return;

        // ইউজারের মেসেজ চ্যাটে দেখানো
        appendMessage("user", text);
        userInput.value = "";
        userInput.style.height = "auto"; // Textarea রিসেট

        // বট টাইপিং অ্যানিমেশন চালু
        showTyping(true);

        // ১.৫ সেকেন্ড পর বটের ডাইনামিক রিপ্লাই জেনারেট করা
        setTimeout(() => {
            showTyping(false);
            const botResponse = getBotReply(text);
            appendMessage("bot", botResponse);
        }, 1500);
    }

    // মেসেজ স্ক্রিনে যুক্ত করার ফাংশন
    function appendMessage(sender, text) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("message", sender);

        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (sender === "user") {
            messageDiv.innerHTML = `
                <div class="bubble">${text}</div>
                <div class="avatar">👤</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="avatar">🤖</div>
                <div class="bubble">
                    ${text}
                    <div class="message-info">
                        <span>${currentTime}</span>
                        <button class="copy-btn" title="Copy Message">📋</button>
                    </div>
                </div>
            `;

            // কপি বাটন সচল করা
            const copyBtn = messageDiv.querySelector(".copy-btn");
            copyBtn.addEventListener("click", () => {
                // '📋' আইকন এবং টাইমস্ট্যাম্প বাদ দিয়ে শুধু টেক্সট কপি করার জন্য split করা
                const cleanText = text.replace(/<[^>]*>/g, ''); // HTML tags রিমুভ করার জন্য
                navigator.clipboard.writeText(cleanText).then(() => {
                    copyBtn.innerText = "✅";
                    setTimeout(() => copyBtn.innerText = "📋", 1500);
                });
            });
        }

        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // অটো স্ক্রোল ডাউন
    }

    function showTyping(isTyping) {
        typingIndicator.style.display = isTyping ? "flex" : "none";
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // --- 3. Dummy AI Logic (বটের উত্তরের লজিক) ---
    function getBotReply(msg) {
        const lowMsg = msg.toLowerCase();
        if (lowMsg.includes("hi") || lowMsg.includes("hello") || lowMsg.includes("হ্যালো")) {
            return "হ্যালো! কেমন আছেন? আমি আপনাকে কীভাবে সাহায্য করতে পারি?";
        } else if (lowMsg.includes("কেমন আছ") || lowMsg.includes("kemon acho")) {
            return "আমি ভালো আছি! আপনি কেমন আছেন? আপনার কোনো সাহায্য লাগবে?";
        } else if (lowMsg.includes("তোমার নাম কি") || lowMsg.includes("name")) {
            return "আমার নাম TBP AI v3.1 Pro। আমি আপনার ব্যক্তিগত এআই অ্যাসিস্ট্যান্ট।";
        } else if (lowMsg.includes("ধন্যবাদ") || lowMsg.includes("thank")) {
            return "আপনাকেও অনেক ধন্যবাদ! আপনার সাথে কথা বলে ভালো লাগলো।";
        } else {
            return `আপনি বলেছেন: "${msg}"। এটি একটি চমৎকার প্রশ্ন! তবে এই বিষয়ে বিস্তারিত জানতে আমার মূল সার্ভার কানেকশন প্রয়োজন।`;
        }
    }

    // --- 4. Modals Control (Open & Close) ---
    // Open Modals
    wallpaperBtn.addEventListener("click", () => wallpaperPanel.style.display = "flex");
    settingsBtn.addEventListener("click", () => settingsPanel.style.display = "flex");
    profileBtn.addEventListener("click", () => profilePanel.style.display = "flex");
    openWallpaperBtn.addEventListener("click", () => {
        settingsPanel.style.display = "none";
        wallpaperPanel.style.display = "flex";
    });

    // Close Modals
    closeWallpaper.addEventListener("click", () => wallpaperPanel.style.display = "none");
    closeSettings.addEventListener("click", () => settingsPanel.style.display = "none");
    closeProfile.addEventListener("click", () => profilePanel.style.display = "none");

    // উইন্ডোর বাইরে ক্লিক করলে মডাল বন্ধ হওয়া
    window.addEventListener("click", (e) => {
        if (e.target === wallpaperPanel) wallpaperPanel.style.display = "none";
        if (e.target === settingsPanel) settingsPanel.style.display = "none";
        if (e.target === profilePanel) profilePanel.style.display = "none";
    });

    // --- 5. Wallpaper Changer ---
    const wallpapers = document.querySelectorAll(".wallpaper");
    wallpapers.forEach(wall => {
        wall.addEventListener("click", () => {
            const wallUrl = wall.getAttribute("data-wall");
            document.body.style.backgroundImage = `linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.82)), url('${wallUrl}')`;
            wallpaperPanel.style.display = "none";
        });
    });

    // --- 6. Top Actions Buttons ---
    // Theme Switcher (Dark/Light mode toggler)
    let isDarkMode = true;
    themeBtn.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        if (!isDarkMode) {
            document.documentElement.style.setProperty('--bg', '#f0f2f5');
            document.documentElement.style.setProperty('--card', 'rgba(255, 255, 255, 0.9)');
            document.documentElement.style.setProperty('--bubble', '#e4e6eb');
            document.documentElement.style.setProperty('--text', '#000000');
            document.documentElement.style.setProperty('--muted', '#65676b');
            themeBtn.innerText = "☀️";
        } else {
            document.documentElement.style.setProperty('--bg', '#0b1220');
            document.documentElement.style.setProperty('--card', 'rgba(17, 24, 39, .82)');
            document.documentElement.style.setProperty('--bubble', '#1e293b');
            document.documentElement.style.setProperty('--text', '#ffffff');
            document.documentElement.style.setProperty('--muted', '#9ca3af');
            themeBtn.innerText = "🌙";
        }
    });

    // New Chat & Clear Chat
    const resetChat = () => {
        chatBox.innerHTML = `
            <div class="message bot">
                <div class="avatar">🤖</div>
                <div class="bubble">👋 নতুন চ্যাট সেশন শুরু হয়েছে। আমি আপনাকে কীভাবে সাহায্য করতে পারি?</div>
            </div>
        `;
        settingsPanel.style.display = "none";
    };
    newChatBtn.addEventListener("click", resetChat);
    clearChatBtn.addEventListener("click", resetChat);

    // Logout
    logoutBtn.addEventListener("click", () => {
        if (confirm("আপনি কি নিশ্চিতভাবে লগআউট করতে চান?")) {
            loginScreen.style.display = "flex";
            usernameInput.value = "";
            chatBox.innerHTML = ""; // চ্যাট হিস্ট্রি ক্লিয়ার
        }
    });

    // --- 7. Attach File Trigger ---
    attachBtn.addEventListener("click", () => {
        hiddenFileInput.click();
    });
    hiddenFileInput.addEventListener("change", () => {
        if (hiddenFileInput.files.length > 0) {
            alert(`${hiddenFileInput.files.length}টি ফাইল আপলোড এর জন্য সিলেক্ট করা হয়েছে!`);
        }
    });

    // Textarea Auto-Resize (লেখা বড় হলে ইনপুট বক্স বড় হবে)
    userInput.addEventListener("input", function () {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
});
              
