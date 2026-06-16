/* ==========================================================================
   TBP AI v3.1 Professional - Core Intelligence Engine (Part 1 - Static Site Fix)
   ========================================================================== */

(function () {
    "use strict";

    const STORAGE_KEYS = {
        USER_SESSION: "tbp_session_user",
        WALLPAPER: "tbp_active_wallpaper",
        PROFILE_AVATAR: "tbp_user_avatar",
        THEME: "tbp_theme_mode",
        CHAT_HISTORY: "tbp_conversations"
    };

    let appState = {
        currentUser: null,
        activeWallpaper: "wallpapers/wall1.jpg",
        userAvatar: "👤",
        isDarkMode: true,
        activeChatId: null,
        conversations: {},
        uploadedFiles: [],
        abortController: null
    };

    // --- স্ট্যাটিক সাইটের জন্য এপিআই কনফিগারেশন ---
    // নোট: সিকিউরিটির জন্য প্রোডাকশনে প্রক্সি ব্যবহার করা ভালো, তবে স্ট্যাটিক সাইট থেকে সরাসরি টেস্ট করতে নিচের এপিআই কাজ করবে।
    const API_CONFIG = {
        ENDPOINT: "https://api.openai.com/v1/chat/completions", 
        TIMEOUT_MS: 30000,
        MAX_RETRIES: 2,
        MODEL: "gpt-4o-mini",
        // আপনার OpenAI API Key-টি নিচের কোটেশনের ভেতর বসিয়ে দিন (যেমন: "sk-proj-...")
        API_KEY: "‎"YOUR_OPENAI_API_KEY" 
    };

    const DOM = {
        loginScreen: document.getElementById("loginScreen"),
        usernameInput: document.getElementById("username"),
        loginBtn: document.getElementById("loginBtn"),
        sidebarPanel: document.getElementById("sidebarPanel"),
        mobileMenuBtn: document.getElementById("mobileMenuBtn"),
        sidebarNewChatBtn: document.getElementById("sidebarNewChatBtn"),
        newChatBtn: document.getElementById("newChatBtn"),
        searchChatInput: document.getElementById("searchChatInput"),
        chatHistoryZone: document.getElementById("chatHistoryZone"),
        exportChatBtn: document.getElementById("exportChatBtn"),
        themeBtn: document.getElementById("themeBtn"),
        wallpaperBtn: document.getElementById("wallpaperBtn"),
        profileBtn: document.getElementById("profileBtn"),
        settingsBtn: document.getElementById("settingsBtn"),
        logoutBtn: document.getElementById("logoutBtn"),
        chatBox: document.getElementById("chatBox"),
        typingIndicator: document.getElementById("typing"),
        attachmentPreviewBar: document.getElementById("attachmentPreviewBar"),
        hiddenFileInput: document.getElementById("hiddenFileInput"),
        hiddenCameraInput: document.getElementById("hiddenCameraInput"),
        attachBtn: document.getElementById("attachBtn"),
        cameraBtn: document.getElementById("cameraBtn"),
        userInput: document.getElementById("userInput"),
        voiceBtn: document.getElementById("voiceBtn"),
        stopGenerationBtn: document.getElementById("stopGenerationBtn"),
        sendBtn: document.getElementById("sendBtn"),
        wallpaperPanel: document.getElementById("wallpaperPanel"),
        closeWallpaper: document.getElementById("closeWallpaper"),
        customWallpaperInput: document.getElementById("customWallpaperInput"),
        galleryThumbs: document.querySelectorAll(".gallery-thumb-item"),
        settingsPanel: document.getElementById("settingsPanel"),
        closeSettings: document.getElementById("closeSettings"),
        themeSwitchBtn: document.getElementById("themeSwitchBtn"),
        clearChatBtn: document.getElementById("clearChatBtn"),
        profilePanel: document.getElementById("profilePanel"),
        closeProfile: document.getElementById("closeProfile"),
        profileAvatarDisplay: document.getElementById("profileAvatarDisplay"),
        profileAvatarInput: document.getElementById("profileAvatarInput"),
        changeAvatarBtn: document.getElementById("changeAvatarBtn"),
        editProfileName: document.getElementById("editProfileName"),
        saveProfileBtn: document.getElementById("saveProfileBtn"),
        panelLogoutBtn: document.getElementById("panelLogoutBtn")
    };

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let voiceRecognitionInstance = null;
    if (SpeechRecognition) {
        voiceRecognitionInstance = new SpeechRecognition();
        voiceRecognitionInstance.continuous = false;
        voiceRecognitionInstance.lang = 'bn-BD';
        voiceRecognitionInstance.interimResults = false;
    }

    function initApp() {
        if (typeof marked !== 'undefined') {
            marked.setOptions({ breaks: true, gfm: true, headerIds: false });
        }
        loadSystemState();
        applyVisualThemes();
        renderChatHistoryList();
        registerEventHandlers();
        checkAuthentication();
        autoResizeTextArea();
        setupDragAndDrop();
    }

    function checkAuthentication() {
        const storedUser = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
        if (storedUser) {
            appState.currentUser = storedUser;
            DOM.loginScreen.style.opacity = "0";
            setTimeout(() => DOM.loginScreen.style.display = "none", 400);
            DOM.editProfileName.value = storedUser;
            syncAvatarUI();
            if (Object.keys(appState.conversations).length === 0) {
                createNewConversation();
            } else {
                const keys = Object.keys(appState.conversations);
                switchConversation(keys[keys.length - 1]);
            }
        } else {
            DOM.loginScreen.style.display = "flex";
            DOM.loginScreen.style.opacity = "1";
        }
    }

    function loadSystemState() {
        appState.activeWallpaper = localStorage.getItem(STORAGE_KEYS.WALLPAPER) || "wallpapers/wall1.jpg";
        appState.userAvatar = localStorage.getItem(STORAGE_KEYS.PROFILE_AVATAR) || "👤";
        appState.isDarkMode = localStorage.getItem(STORAGE_KEYS.THEME) !== "false";
        try {
            appState.conversations = JSON.parse(localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY)) || {};
        } catch (e) {
            appState.conversations = {};
        }
    }

    function applyVisualThemes() {
        document.body.style.backgroundImage = `linear-gradient(rgba(5,10,20,${appState.isDarkMode ? "0.85" : "0.5"}),rgba(5,10,20,${appState.isDarkMode ? "0.85" : "0.5"})), url("${appState.activeWallpaper}")`;
        if (!appState.isDarkMode) {
            document.documentElement.style.setProperty('--bg', '#f3f4f6');
            document.documentElement.style.setProperty('--surface', '#ffffff');
            document.documentElement.style.setProperty('--text', '#1f2937');
            document.documentElement.style.setProperty('--muted', '#6b7280');
            document.documentElement.style.setProperty('--card', 'rgba(255,255,255,0.8)');
            DOM.themeBtn.textContent = "☀️";
        } else {
            document.documentElement.style.setProperty('--bg', '#0b1220');
            document.documentElement.style.setProperty('--surface', '#111827');
            document.documentElement.style.setProperty('--text', '#ffffff');
            document.documentElement.style.setProperty('--muted', '#9ca3af');
            document.documentElement.style.setProperty('--card', 'rgba(17,24,39,.75)');
            DOM.themeBtn.textContent = "🌙";
        }
    }

    function syncAvatarUI() {
        if (appState.userAvatar.startsWith("data:image")) {
            DOM.profileAvatarDisplay.textContent = "";
            DOM.profileAvatarDisplay.style.backgroundImage = `url(${appState.userAvatar})`;
        } else {
            DOM.profileAvatarDisplay.textContent = appState.userAvatar;
            DOM.profileAvatarDisplay.style.backgroundImage = "none";
        }
    }

    function createNewConversation() {
        const id = "chat_" + Date.now();
        appState.conversations[id] = {
            title: "নতুন চ্যাট সেশন",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            messages: []
        };
        appState.activeChatId = id;
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
        renderChatHistoryList();
        loadActiveChatUI();
    }

    function switchConversation(id) {
        if (!appState.conversations[id]) return;
        appState.activeChatId = id;
        loadActiveChatUI();
        renderChatHistoryList();
    }

    function loadActiveChatUI() {
        DOM.chatBox.innerHTML = "";
        const currentChat = appState.conversations[appState.activeChatId];
        if (!currentChat || currentChat.messages.length === 0) {
            DOM.chatBox.innerHTML = `
                <div class="message-row ai-row">
                    <div class="avatar">🤖</div>
                    <div class="message-content-wrap">
                        <div class="message-bubble">
                            👋 <b>স্বাগতম ${appState.currentUser}!</b><br><br>
                            আমি আপনার পার্সোনাল এআই অ্যাসিস্ট্যান্ট। আজ আপনাকে কীভাবে সাহায্য করতে পারি? ফাইল শেয়ার করতে ক্লিপ আইকন বা ক্যামেরা ব্যবহার করুন।
                        </div>
                        <div class="message-meta"><span class="timestamp">System</span></div>
                    </div>
                </div>`;
            return;
        }
        currentChat.messages.forEach((msg, index) => {
            appendMessageToDOM(msg.role, msg.content, msg.timestamp, index, msg.files);
        });
        DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;
    }

    function renderChatHistoryList(filterKeyword = "") {
        DOM.chatHistoryZone.innerHTML = "";
        Object.keys(appState.conversations).reverse().forEach(id => {
            const chat = appState.conversations[id];
            if (filterKeyword && !chat.title.toLowerCase().includes(filterKeyword.toLowerCase())) return;
            const pill = document.createElement("div");
            pill.className = `history-item-pill ${id === appState.activeChatId ? 'active' : ''}`;
            pill.innerHTML = `💬 <span style="overflow:hidden; text-overflow:ellipsis; flex:1;">${chat.title}</span>`;
            pill.addEventListener("click", () => switchConversation(id));
            DOM.chatHistoryZone.appendChild(pill);
        });
       }
     async function dispatchAIReplySequence() {
        const activeChat = appState.conversations[appState.activeChatId];
        if (!activeChat || activeChat.messages.length === 0) return;

        DOM.typingIndicator.style.display = "flex";
        DOM.sendBtn.style.display = "none";
        DOM.stopGenerationBtn.style.display = "flex";
        DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;

        appState.abortController = new AbortController();
        if (activeChat.messages.length === 1 && activeChat.title === "নতুন চ্যাট সেশন") {
            activeChat.title = activeChat.messages[0].content.substring(0, 20) + "...";
            renderChatHistoryList();
        }

        let payloadHistory = activeChat.messages.map(m => ({ role: m.role, content: m.content }));
        let attempt = 0;
        let responseReceived = false;

        while (attempt <= API_CONFIG.MAX_RETRIES && !responseReceived) {
            try {
                // সরাসরি ওপেনএআই এন্ডপয়েন্টে রিকোয়েস্ট পাঠানো হচ্ছে হেডারসহ
                const res = await fetch(API_CONFIG.ENDPOINT, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${API_CONFIG.API_KEY}`
                    },
                    body: JSON.stringify({ 
                        model: API_CONFIG.MODEL,
                        messages: payloadHistory 
                    }),
                    signal: appState.abortController.signal
                });
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                const data = await res.json();
                
                const replyText = data.choices[0].message.content;

                activeChat.messages.push({
                    role: "assistant",
                    content: replyText,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                });
                responseReceived = true;
            } catch (err) {
                attempt++;
                if (err.name === 'AbortError') break;
                if (attempt > API_CONFIG.MAX_RETRIES) {
                    activeChat.messages.push({
                        role: "assistant",
                        content: "⚠️ দুঃখিত, এপিআই সংযোগে সমস্যা হচ্ছে। আপনার API KEY চেক করুন অথবা পুনরায় চেষ্টা করুন।",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            }
        }

        DOM.typingIndicator.style.display = "none";
        DOM.sendBtn.style.display = "flex";
        DOM.stopGenerationBtn.style.none = "none";
        appState.abortController = null;

        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
        loadActiveChatUI();
                   }
   
