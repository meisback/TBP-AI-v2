document.addEventListener("DOMContentLoaded", () => {
    // === ১. লগইন স্ক্রিনের এলিমেন্টসমূহ ===
    const loginScreen = document.getElementById("loginScreen");
    const usernameInput = document.getElementById("username");
    const loginBtn = document.getElementById("loginBtn");
    const profileName = document.getElementById("profileName");

    // === ২. চ্যাট বক্স এবং ইনপুট এরিয়া ===
    const chatBox = document.getElementById("chatBox");
    const userInput = document.getElementById("userInput");
    const sendBtn = document.getElementById("sendBtn");
    const stopGenerationBtn = document.getElementById("stopGenerationBtn");
    const typingIndicator = document.getElementById("typing");

    // === ৩. মডাল প্যানেলসমূহ ===
    const wallpaperPanel = document.getElementById("wallpaperPanel");
    const settingsPanel = document.getElementById("settingsPanel");
    const profilePanel = document.getElementById("profilePanel");

    // === ৪. হেডারের টপ অ্যাকশন বাটনসমূহ ===
    const newChatBtn = document.getElementById("newChatBtn");
    const themeBtn = document.getElementById("themeBtn");
    const wallpaperBtn = document.getElementById("wallpaperBtn");
    const settingsBtn = document.getElementById("settingsBtn");
    const profileBtn = document.getElementById("profileBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const openWallpaperBtn = document.getElementById("openWallpaperBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");

    // === ৫. মডাল বন্ধ করার বাটনসমূহ ===
    const closeWallpaper = document.getElementById("closeWallpaper");
    const closeSettings = document.getElementById("closeSettings");
    const closeProfile = document.getElementById("closeProfile");

    // === ৬. ফাইল আপলোড এবং প্রিভিউ এরিয়া ===
    const attachBtn = document.getElementById("attachBtn");
    const cameraBtn = document.getElementById("cameraBtn");
    const voiceBtn = document.getElementById("voiceBtn");
    const hiddenFileInput = document.getElementById("hiddenFileInput");
    const hiddenCameraInput = document.getElementById("hiddenCameraInput");
    const attachmentPreviewBar = document.getElementById("attachmentPreviewBar");

    // === অ্যাপের ইন্টারনাল স্টেট (Variables) ===
    let selectedFiles = [];
    let isGenerating = false;
    let generationTimeout = null;
    let isVoiceActive = false;
        // লগইন বাটন ক্লিক হ্যান্ডলার
    if (loginBtn) {
        loginBtn.addEventListener("click", loginUser);
        usernameInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") loginUser();
        });
    }

    function loginUser() {
        const username = usernameInput.value.trim();
        if (username !== "") {
            if (profileName) profileName.innerText = username;
            // লগইন স্ক্রিন হাইড করা
            loginScreen.style.setProperty("display", "none", "important");
        } else {
            alert("অনুগ্রহ করে আপনার নাম লিখে Continue চাপুন!");
        }
    }
        // মেসেজ সেন্ড করার ইভেন্ট
    sendBtn.addEventListener("click", handleSendMessage);
    userInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });

    function handleSendMessage() {
        if (isGenerating) return;
        const text = userInput.value.trim();
        
        if (text === "" && selectedFiles.length === 0) return;

        // স্ক্রিনে মেসেজ দেখানো
        appendMessage("user", text, selectedFiles);
        
        // ইনপুট রিসেট
        userInput.value = "";
        userInput.style.height = "auto";
        selectedFiles = [];
        renderAttachmentPreview();

        // জেনারেশন বা থিংকিং মোড অন
        setGenerationState(true);

        // ১.৮ সেকেন্ড পর বটের রেসপন্স
        generationTimeout = setTimeout(() => {
            setGenerationState(false);
            const botResponse = getBotReply(text);
            appendMessage("bot", botResponse);
        }, 1800);
    }

    function setGenerationState(generating) {
        isGenerating = generating;
        if (generating) {
            typingIndicator.style.display = "flex";
            sendBtn.style.display = "none";
            stopGenerationBtn.style.display = "flex";
        } else {
            typingIndicator.style.display = "none";
            sendBtn.style.display = "flex";
            stopGenerationBtn.style.display = "none";
        }
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // জেনারেশন স্টপ করার বাটন লজিক
    stopGenerationBtn.addEventListener("click", () => {
        clearTimeout(generationTimeout);
        setGenerationState(false);
        appendMessage("bot", "⚠️ Generation stopped by user.");
    });

    // চ্যাট বক্সে মেসেজ যোগ করার মেইন ফাংশন
    function appendMessage(sender, text, files = []) {
        const messageRow = document.createElement("div");
        messageRow.classList.add("message", sender);
        const avatarIcon = sender === "user" ? "👤" : "🤖";
        const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // ফাইল বা ছবি থাকলে তা বাবলে যুক্ত করা
        let mediaHtml = "";
        if (files.length > 0) {
            mediaHtml += `<div style="display:flex; gap:8px; margin-bottom:8px; flex-wrap:wrap;">`;
            files.forEach(file => {
                if (file.type.startsWith("image/")) {
                    mediaHtml += `<div class="preview-pill"><img src="${URL.createObjectURL(file)}"></div>`;
                } else {
                    mediaHtml += `<div class="preview-pill"><div class="doc-icon">📄</div></div>`;
                }
            });
            mediaHtml += `</div>`;
        }

        // কোড ব্লক ফরম্যাটিং চেক করা
        let processedText = text;
        if (sender === "bot" && text.includes("```")) {
            processedText = formatCodeBlocks(text);
        } else {
            processedText = text.replace(/\n/g, "<br>");
        }

        if (sender === "user") {
            messageRow.innerHTML = `<div class="bubble">${mediaHtml}<div>${processedText}</div></div><div class="avatar">${avatarIcon}</div>`;
        } else {
            messageRow.innerHTML = `
                <div class="avatar">${avatarIcon}</div>
                <div class="bubble">
                    <div>${processedText}</div>
                    <div class="message-info">
                        <span>${currentTime}</span>
                        <button class="copy-btn" title="Copy Message">📋</button>
                    </div>
                </div>`;

            // মেসেজ টেক্সট কপি বাটন
            const copyBtn = messageRow.querySelector(".copy-btn");
            if (copyBtn) {
                copyBtn.addEventListener("click", () => {
                    navigator.clipboard.writeText(text.replace(/```/g, "")).then(() => {
                        copyBtn.innerText = "✅";
                        setTimeout(() => copyBtn.innerText = "📋", 1500);
                    });
                });
            }

            // কোড ব্লকের ভেতরের কোড কপি বাটন
            const copyCodeButtons = messageRow.querySelectorAll(".copy-code-btn");
            copyCodeButtons.forEach(btn => {
                btn.addEventListener("click", () => {
                    const codeText = btn.parentElement.nextElementSibling.querySelector("code").innerText;
                    navigator.clipboard.writeText(codeText).then(() => {
                        btn.innerText = "Copied!";
                        setTimeout(() => btn.innerText = "Copy", 1500);
                    });
                });
            });
        }

        chatBox.appendChild(messageRow);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // ব্যাকটিক (```) ডিটেক্ট করে কোড উইন্ডো বানানোর ফাংশন
    function formatCodeBlocks(text) {
        const parts = text.split("```");
        for (let i = 1; i < parts.length; i += 2) {
            const rawCode = parts[i];
            const firstNewLine = rawCode.indexOf("\n");
            let lang = rawCode.substring(0, firstNewLine).trim() || "code";
            let code = rawCode.substring(firstNewLine + 1);

            parts[i] = `
                <div class="code-block-container">
                    <div class="code-block-header"><span>${lang}</span><button class="copy-code-btn">Copy</button></div>
                    <pre><code>${code.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code></pre>
                </div>`;
        }
        return parts.join("");
    }

    // বটের ডামি রিপ্লাই ডেটাবেজ
    function getBotReply(msg) {
        const lowMsg = msg.toLowerCase();
        if (lowMsg.includes("hi") || lowMsg.includes("hello") || lowMsg.includes("হ্যালো")) {
            return "হ্যালো! TBP AI v3.1 এ আপনাকে স্বাগতম। আজ আপনাকে কীভাবে সাহায্য করতে পারি?";
        } else if (lowMsg.includes("code") || lowMsg.includes("কোড") || lowMsg.includes("html")) {
            return "এখানে আপনার অনুরোধের একটি নমুনা কোড দেওয়া হলো:\n```html\n<!DOCTYPE html>\n<html>\n<head>\n    <title>TBP AI Demo</title>\n</head>\n<body>\n    <h1>Hello World</h1>\n</body>\n</html>\n```";
        } else if (lowMsg.includes("তোমার নাম") || lowMsg.includes("your name")) {
            return "আমি **TBP AI v3.1 Stable**, আপনার একটি অ্যাডভান্সড এআই অ্যাসিস্ট্যান্ট।";
        } else if (lowMsg.includes("কেমন আছ")) {
            return "আমি চমৎকার আছি! আশা করি আপনিও ভালো আছেন।";
        } else {
            return `আপনার দেওয়া বার্তাটি পেলাম: "${msg}"\n\nএটি একটি দারুণ টপিক! এই বিষয়ে আরও গভীর তথ্যের জন্য আমার মূল ক্লাউড API সার্ভার সক্রিয় করুন।`;
        }
    }
    // ফাইল এবং ক্যামেরা সিলেক্ট ট্রিগার
    attachBtn.addEventListener("click", () => hiddenFileInput.click());
    if (cameraBtn) {
        cameraBtn.addEventListener("click", () => hiddenCameraInput.click());
    }

    hiddenFileInput.addEventListener("change", handleFileSelection);
    if (hiddenCameraInput) {
        hiddenCameraInput.addEventListener("change", handleFileSelection);
    }

    function handleFileSelection(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => selectedFiles.push(file));
        renderAttachmentPreview();
    }

    // ইনপুট বক্সের ওপর প্রিভিউ বার রেন্ডার করা
    function renderAttachmentPreview() {
        if (selectedFiles.length === 0) {
            attachmentPreviewBar.style.display = "none";
            attachmentPreviewBar.innerHTML = "";
            return;
        }

        attachmentPreviewBar.style.display = "flex";
        attachmentPreviewBar.innerHTML = "";

        selectedFiles.forEach((file, index) => {
            const pill = document.createElement("div");
            pill.classList.add("preview-pill");

            if (file.type.startsWith("image/")) {
                pill.innerHTML = `<img src="${URL.createObjectURL(file)}"><div class="preview-pill-remove" data-index="${index}">✕</div>`;
            } else {
                pill.innerHTML = `<div class="doc-icon">📄</div><div class="preview-pill-remove" data-index="${index}">✕</div>`;
            }

            // ফাইল রিমুভ করার ক্রস বাটন লজিক
            pill.querySelector(".preview-pill-remove").addEventListener("click", (e) => {
                const idx = parseInt(e.target.getAttribute("data-index"));
                selectedFiles.splice(idx, 1);
                renderAttachmentPreview();
            });

            attachmentPreviewBar.appendChild(pill);
        });
    }

    // ভয়েস বাটন টগল এবং পালস অ্যানিমেশন
    voiceBtn.addEventListener("click", () => {
        isVoiceActive = !isVoiceActive;
        if (isVoiceActive) {
            voiceBtn.classList.add("active-state");
            userInput.placeholder = "Listening...";
        } else {
            voiceBtn.classList.remove("active-state");
            userInput.placeholder = "Message TBP AI...";
        }
    });
        // মডাল ওপেন করার ফাংশন
    const showPanel = (panel) => panel.style.display = "block";
    const hidePanel = (panel) => panel.style.display = "none";

    wallpaperBtn.addEventListener("click", () => showPanel(wallpaperPanel));
    settingsBtn.addEventListener("click", () => showPanel(settingsPanel));
    profileBtn.addEventListener("click", () => showPanel(profilePanel));
    
    openWallpaperBtn.addEventListener("click", () => {
        hidePanel(settingsPanel);
        showPanel(wallpaperPanel);
    });

    // মডাল ক্লোজ করা
    closeWallpaper.addEventListener("click", () => hidePanel(wallpaperPanel));
    closeSettings.addEventListener("click", () => hidePanel(settingsPanel));
    closeProfile.addEventListener("click", () => hidePanel(profilePanel));

    // মডালের বাইরে ক্লিক করলে বন্ধ হওয়া
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("panel")) hidePanel(e.target);
    });

    // লাইভ ওয়ালপেপার চেঞ্জার
    const wallpapers = document.querySelectorAll(".wallpaper");
    wallpapers.forEach(wall => {
        wall.addEventListener("click", () => {
            const wallUrl = wall.getAttribute("data-wall");
            document.body.style.backgroundImage = `linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.82)), url('${wallUrl}')`;
            hidePanel(wallpaperPanel);
        });
    });

    // ডার্ক এবং লাইট থিম সুইচ
    let isDarkMode = true;
    themeBtn.addEventListener("click", () => {
        isDarkMode = !isDarkMode;
        themeBtn.innerText = isDarkMode ? "🌙" : "☀️";
        document.documentElement.style.setProperty('--bg', isDarkMode ? '#0b1220' : '#f3f4f6');
        document.documentElement.style.setProperty('--card', isDarkMode ? 'rgba(17,24,39,.88)' : 'rgba(255,255,255,.90)');
        document.documentElement.style.setProperty('--text', isDarkMode ? '#ffffff' : '#111827');
        document.documentElement.style.setProperty('--muted', isDarkMode ? '#9ca3af' : '#4b5563');
    });

    // চ্যাট ক্লিয়ার ও নিউ চ্যাট ফাংশন
    const triggerClear = () => {
        chatBox.innerHTML = `<div class="message bot"><div class="avatar">🤖</div><div class="bubble">All chats cleared. New session started!</div></div>`;
        hidePanel(settingsPanel);
    };
    newChatBtn.addEventListener("click", triggerClear);
    clearChatBtn.addEventListener("click", triggerClear);

    // লগআউট হ্যান্ডলার
    logoutBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to logout?")) {
            loginScreen.style.display = "flex";
            usernameInput.value = "";
            triggerClear();
        }
    });

    // টেক্সট এরিয়া অটো-রিসাইজ (লেখা বড় হলে ইনপুট বক্স বড় হবে)
    userInput.addEventListener("input", function() {
        this.style.height = "auto";
        this.style.height = (this.scrollHeight) + "px";
    });
});
