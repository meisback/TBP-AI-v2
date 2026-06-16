/* ==========================================================================
   TBP AI v3.1 Professional - Core Intelligence Engine (Part 1)
   ========================================================================== */

(function () {
    "use strict";

    const STORAGE_KEYS = {
        USER_SESSION: "tbp_session_user",
        WALLPAPER: "tbp_active_wallpaper",
        PROFILE_AVATAR: "tbp_user_avatar",
        THEME: "tbp_theme_mode",
        CHAT_HISTORY: "tbp_conversations",
        USER_API_KEY: "tbp_openai_api_key"
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

    const API_CONFIG = {
        ENDPOINT: "https://api.openai.com/v1/chat/completions", 
        TIMEOUT_MS: 30000,
        MAX_RETRIES: 2,
        MODEL: "gpt-4o-mini"
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
        injectAPIKeyInputInSettings(); 
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
            if (DOM.loginScreen) {
                DOM.loginScreen.style.opacity = "0";
                setTimeout(() => DOM.loginScreen.style.display = "none", 400);
            }
            if (DOM.editProfileName) DOM.editProfileName.value = storedUser;
            syncAvatarUI();
            if (Object.keys(appState.conversations).length === 0) {
                createNewConversation();
            } else {
                const keys = Object.keys(appState.conversations);
                switchConversation(keys[keys.length - 1]);
            }
        } else {
            if (DOM.loginScreen) {
                DOM.loginScreen.style.display = "flex";
                DOM.loginScreen.style.opacity = "1";
            }
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

    function injectAPIKeyInputInSettings() {
        if (!DOM.settingsPanel) return;
        const savedKey = localStorage.getItem(STORAGE_KEYS.USER_API_KEY) || "";
        const keyGroup = document.createElement("div");
        keyGroup.style.margin = "15px 0";
        keyGroup.style.textAlign = "left";
        keyGroup.innerHTML = `
            <label style="display:block; font-size:12px; margin-bottom:5px; color:var(--text);">OpenAI API Key সেট করুন:</label>
            <input type="password" id="userApiKeyInput" value="${savedKey}" placeholder="sk-proj-..." style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); background:rgba(0,0,0,0.2); color:var(--text); font-size:12px;">
            <button id="saveKeyBtn" style="margin-top:8px; width:100%; padding:6px; background:var(--primary); color:white; border:none; border-radius:5px; cursor:pointer; font-size:12px;">🔑 চাবি সেভ করুন</button>
        `;
        const container = DOM.settingsPanel.querySelector(".panel-content") || DOM.settingsPanel;
        if (DOM.clearChatBtn) {
            container.insertBefore(keyGroup, DOM.clearChatBtn);
        } else {
            container.appendChild(keyGroup);
        }

        document.getElementById("saveKeyBtn").addEventListener("click", () => {
            const keyVal = document.getElementById("userApiKeyInput").value.trim();
            if(keyVal) {
                localStorage.setItem(STORAGE_KEYS.USER_API_KEY, keyVal);
                alert("API Key সফলভাবে সেভ হয়েছে!");
            } else {
                localStorage.removeItem(STORAGE_KEYS.USER_API_KEY);
                alert("API Key মুছে ফেলা হয়েছে।");
            }
        });
    }

    function applyVisualThemes() {
        document.body.style.backgroundImage = `linear-gradient(rgba(5,10,20,${appState.isDarkMode ? "0.85" : "0.5"}),rgba(5,10,20,${appState.isDarkMode ? "0.85" : "0.5"})), url("${appState.activeWallpaper}")`;
        if (!appState.isDarkMode) {
            document.documentElement.style.setProperty('--bg', '#f3f4f6');
            document.documentElement.style.setProperty('--surface', '#ffffff');
            document.documentElement.style.setProperty('--text', '#1f2937');
            document.documentElement.style.setProperty('--muted', '#6b7280');
            document.documentElement.style.setProperty('--card', 'rgba(255,255,255,0.8)');
            if (DOM.themeBtn) DOM.themeBtn.textContent = "☀️";
        } else {
            document.documentElement.style.setProperty('--bg', '#0b1220');
            document.documentElement.style.setProperty('--surface', '#111827');
            document.documentElement.style.setProperty('--text', '#ffffff');
            document.documentElement.style.setProperty('--muted', '#9ca3af');
            document.documentElement.style.setProperty('--card', 'rgba(17,24,39,.75)');
            if (DOM.themeBtn) DOM.themeBtn.textContent = "🌙";
        }
    }

    function syncAvatarUI() {
        if (!DOM.profileAvatarDisplay) return;
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
        if (!DOM.chatBox) return;
        DOM.chatBox.innerHTML = "";
        const currentChat = appState.conversations[appState.activeChatId];
        if (!currentChat || currentChat.messages.length === 0) {
            DOM.chatBox.innerHTML = `
                <div class="message-row ai-row">
                    <div class="avatar">🤖</div>
                    <div class="message-content-wrap">
                        <div class="message-bubble">
                            👋 <b>স্বাগতম ${appState.currentUser}!</b><br><br>
                            আমি আপনার পার্সোনাল এআই অ্যাসিস্ট্যান্ট। চ্যাট শুরু করার আগে আপনার ডানপাশের গিয়ার (⚙️) আইকনে ক্লিক করে <b>OpenAI API Key</b> টি অবশ্যই সেট করে নিন।
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
        if (!DOM.chatHistoryZone) return;
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
       /* ==========================================================================
       TBP AI v3.1 Professional - Core Intelligence Engine (Part 2)
       ========================================================================== */

    function appendMessageToDOM(role, content, timestamp, index, files = []) {
        const isUser = role === "user";
        const row = document.createElement("div");
        row.className = `message-row ${isUser ? 'user-row' : 'ai-row'}`;
        row.dataset.index = index;

        let renderedContent = escapeHTML(content);
        if (!isUser && typeof marked !== 'undefined') {
            renderedContent = marked.parse(content);
            renderedContent = processCodeBlocksInHTML(renderedContent);
        } else {
            renderedContent = renderedContent.replace(/\n/g, '<br>');
        }

        let mediaPayloadMarkup = "";
        if (files && files.length > 0) {
            mediaPayloadMarkup = `<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">`;
            files.forEach(f => {
                if (f.type.startsWith("image/")) {
                    mediaPayloadMarkup += `<img src="${f.data}" style="max-width:180px; max-height:140px; border-radius:8px; border:1px solid var(--border);" alt="Preview">`;
                } else {
                    mediaPayloadMarkup += `<div style="padding:8px 12px; background:rgba(0,0,0,0.2); border-radius:8px; font-size:12px; color:var(--primary);">📄 Document (${f.name})</div>`;
                }
            });
            mediaPayloadMarkup += `</div>`;
        }

        let avatarContent = isUser ? "" : "🤖";
        let avatarStyle = "";
        if (isUser) {
            if (appState.userAvatar.startsWith("data:image")) {
                avatarStyle = `background-image: url(${appState.userAvatar}); background-size:cover;`;
            } else {
                avatarContent = appState.userAvatar;
            }
        }

        row.innerHTML = `
            <div class="avatar" style="${avatarStyle}">${avatarContent}</div>
            <div class="message-content-wrap">
                <div class="message-bubble">
                    ${mediaPayloadMarkup}
                    <div class="bubble-markdown-core">${renderedContent}</div>
                </div>
                <div class="message-meta">
                    <span class="timestamp">${timestamp}</span>
                    <button class="msg-action-btn copy-msg-btn">📋 Copy</button>
                    ${isUser ? '<button class="msg-action-btn edit-msg-btn">✏️ Edit</button>' : '<button class="msg-action-btn speak-msg-btn">🔊 Speak</button>'}
                    <button class="msg-action-btn delete-msg-btn">🗑️ Delete</button>
                    ${!isUser ? '<button class="msg-action-btn regen-msg-btn">🔄 Regenerate</button>' : ''}
                </div>
            </div>
        `;

        attachBubbleActionListeners(row, isUser, index);
        DOM.chatBox.appendChild(row);
        DOM.chatBox.scrollTop = DOM.chatBox.scrollHeight;
    }

    function processCodeBlocksInHTML(html) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        const preElements = wrapper.querySelectorAll('pre');
        preElements.forEach(pre => {
            const codeNode = pre.querySelector('code');
            const codeText = codeNode ? codeNode.innerText : pre.innerText;
            const langMatch = codeNode ? codeNode.className.match(/language-(\w+)/) : null;
            const language = langMatch ? langMatch[1] : "code";

            const elementContainer = document.createElement('div');
            elementContainer.className = "code-block-container";
            elementContainer.innerHTML = `
                <div class="code-block-header">
                    <span>${language.toUpperCase()}</span>
                    <button class="copy-code-btn">Copy Code</button>
                </div>
                <pre><code>${escapeHTML(codeText)}</code></pre>
            `;
            elementContainer.querySelector('.copy-code-btn').addEventListener('click', (e) => {
                navigator.clipboard.writeText(codeText);
                e.target.textContent = "Copied!";
                setTimeout(() => e.target.textContent = "Copy Code", 2000);
            });
            pre.replaceWith(elementContainer);
        });
        return wrapper.innerHTML;
    }

    function attachBubbleActionListeners(row, isUser, index) {
        row.querySelector(".copy-msg-btn").addEventListener("click", () => {
            const txt = appState.conversations[appState.activeChatId].messages[index].content;
            navigator.clipboard.writeText(txt);
        });
        row.querySelector(".delete-msg-btn").addEventListener("click", () => {
            appState.conversations[appState.activeChatId].messages.splice(index, 1);
            localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
            loadActiveChatUI();
        });
        if (isUser) {
            row.querySelector(".edit-msg-btn").addEventListener("click", () => {
                const currentMsg = appState.conversations[appState.activeChatId].messages[index];
                DOM.userInput.value = currentMsg.content;
                DOM.userInput.focus();
                appState.conversations[appState.activeChatId].messages.splice(index);
                localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
                loadActiveChatUI();
            });
        } else {
            row.querySelector(".speak-msg-btn").addEventListener("click", () => {
                if ('speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                    const txt = appState.conversations[appState.activeChatId].messages[index].content.replace(/[#*`]/g, '');
                    const utterance = new SpeechSynthesisUtterance(txt);
                    utterance.lang = 'bn-BD';
                    window.speechSynthesis.speak(utterance);
                }
            });
            row.querySelector(".regen-msg-btn").addEventListener("click", () => {
                appState.conversations[appState.activeChatId].messages.splice(index);
                localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
                loadActiveChatUI();
                dispatchAIReplySequence();
            });
        }
    }

    async function dispatchAIReplySequence() {
        const activeChat = appState.conversations[appState.activeChatId];
        if (!activeChat || activeChat.messages.length === 0) return;

        const userSavedKey = localStorage.getItem(STORAGE_KEYS.USER_API_KEY);
        if (!userSavedKey) {
            activeChat.messages.push({
                role: "assistant",
                content: "🛑 <b>API Key পাওয়া যায়নি!</b> অনুগ্রহ করে সেটিংস (⚙️) আইকনে ক্লিক করে আপনার OpenAI API Key-টি সেট করুন।",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
            loadActiveChatUI();
            return;
        }

        if(DOM.typingIndicator) DOM.typingIndicator.style.display = "flex";
        if(DOM.sendBtn) DOM.sendBtn.style.display = "none";
        if(DOM.stopGenerationBtn) DOM.stopGenerationBtn.style.display = "flex";
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
                const res = await fetch(API_CONFIG.ENDPOINT, {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${userSavedKey}`
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
                        content: "⚠️ দুঃখিত, সংযোগে সমস্যা হচ্ছে। আপনার API KEY সঠিক আছে কিনা পরীক্ষা করুন অথবা পুনরায় চেষ্টা করুন।",
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    });
                }
            }
        }

        if(DOM.typingIndicator) DOM.typingIndicator.style.display = "none";
        if(DOM.sendBtn) DOM.sendBtn.style.display = "flex";
        if(DOM.stopGenerationBtn) DOM.stopGenerationBtn.style.display = "none";
        appState.abortController = null;

        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
        loadActiveChatUI();
    }

    function handleSelectedFiles(filesList) {
        Array.from(filesList).forEach(file => {
            const reader = new FileReader();
            reader.onload = function (e) {
                appState.uploadedFiles.push({ name: file.name, type: file.type, data: e.target.result });
                renderAttachmentPills();
            };
            if (file.type.startsWith("image/")) {
                reader.readAsDataURL(file);
            }
        });
    }

    function renderAttachmentPills() {
        if(!DOM.attachmentPreviewBar) return;
        DOM.attachmentPreviewBar.innerHTML = "";
        if (appState.uploadedFiles.length === 0) {
            DOM.attachmentPreviewBar.style.display = "none";
            return;
        }
        DOM.attachmentPreviewBar.style.display = "flex";
        appState.uploadedFiles.forEach((file, idx) => {
            const pill = document.createElement("div");
            pill.className = "preview-pill";
            if (file.type.startsWith("image/")) {
                pill.innerHTML = `<img src="${file.data}"><span class="preview-pill-remove" data-idx="${idx}">✕</span>`;
            } else {
                pill.innerHTML = `<div class="doc-icon">📄</div><span class="preview-pill-remove" data-idx="${idx}">✕</span>`;
            }
            pill.querySelector(".preview-pill-remove").addEventListener("click", (e) => {
                appState.uploadedFiles.splice(parseInt(e.target.dataset.idx), 1);
                renderAttachmentPills();
            });
            DOM.attachmentPreviewBar.appendChild(pill);
        });
    }

    function setupDragAndDrop() {
        const dropZone = document.querySelector(".main-container");
        if(!dropZone) return;
        ['dragenter', 'dragover'].forEach(name => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.style.opacity = "0.8"; }, false));
        ['dragleave', 'drop'].forEach(name => dropZone.addEventListener(name, (e) => { e.preventDefault(); dropZone.style.opacity = "1"; }, false));
        dropZone.addEventListener('drop', (e) => { if (e.dataTransfer.files.length > 0) handleSelectedFiles(e.dataTransfer.files); });
    }

    function registerEventHandlers() {
        if (DOM.loginBtn) {
            DOM.loginBtn.addEventListener("click", () => {
                const val = DOM.usernameInput.value.trim();
                if (!val) return alert("একটি নাম প্রদান করুন।");
                localStorage.setItem(STORAGE_KEYS.USER_SESSION, val);
                checkAuthentication();
            });
        }

        if(DOM.sendBtn) DOM.sendBtn.addEventListener("click", processIncomingUserPrompt);
        if(DOM.userInput) {
            DOM.userInput.addEventListener("keydown", (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); processIncomingUserPrompt(); } });
            DOM.userInput.addEventListener("input", autoResizeTextArea);
        }
        if(DOM.stopGenerationBtn) DOM.stopGenerationBtn.addEventListener("click", () => { if (appState.abortController) appState.abortController.abort(); });
        if(DOM.mobileMenuBtn) DOM.mobileMenuBtn.addEventListener("click", () => DOM.sidebarPanel.classList.toggle("mobile-open"));
        if(DOM.newChatBtn) DOM.newChatBtn.addEventListener("click", createNewConversation);
        if(DOM.sidebarNewChatBtn) DOM.sidebarNewChatBtn.addEventListener("click", createNewConversation);
        if(DOM.searchChatInput) DOM.searchChatInput.addEventListener("input", (e) => renderChatHistoryList(e.target.value));

        if(DOM.wallpaperBtn) setupPanelToggle(DOM.wallpaperBtn, DOM.wallpaperPanel, DOM.closeWallpaper);
        if(DOM.settingsBtn) setupPanelToggle(DOM.settingsBtn, DOM.settingsPanel, DOM.closeSettings);
        if(DOM.profileBtn) setupPanelToggle(DOM.profileBtn, DOM.profilePanel, DOM.closeProfile);

        if(DOM.themeBtn) DOM.themeBtn.addEventListener("click", toggleThemeMode);
        if(DOM.themeSwitchBtn) DOM.themeSwitchBtn.addEventListener("click", toggleThemeMode);
        if(DOM.clearChatBtn) {
            DOM.clearChatBtn.addEventListener("click", () => {
                if (confirm("সব মেসেজ মুছবেন?") && appState.conversations[appState.activeChatId]) {
                    appState.conversations[appState.activeChatId].messages = [];
                    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
                    loadActiveChatUI();
                }
            });
        }

        if(DOM.exportChatBtn) {
            DOM.exportChatBtn.addEventListener("click", () => {
                const chat = appState.conversations[appState.activeChatId];
                if (!chat || chat.messages.length === 0) return alert("কোনো মেসেজ নেই।");
                let txt = `=== TBP AI Log ===\nTitle: ${chat.title}\n\n`;
                chat.messages.forEach(m => txt += `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}\n`);
                const blob = new Blob([txt], { type: "text/plain;charset=utf-8" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = `chat_log.txt`;
                a.click();
            });
        }

        const logoutAction = () => { if (confirm("লগআউট করবেন?")) { localStorage.removeItem(STORAGE_KEYS.USER_SESSION); checkAuthentication(); } };
        if(DOM.logoutBtn) DOM.logoutBtn.addEventListener("click", logoutAction);
        if(DOM.panelLogoutBtn) DOM.panelLogoutBtn.addEventListener("click", logoutAction);

        if(DOM.attachBtn) DOM.attachBtn.addEventListener("click", () => DOM.hiddenFileInput.click());
        if(DOM.cameraBtn) DOM.cameraBtn.addEventListener("click", () => DOM.hiddenCameraInput.click());
        if(DOM.hiddenFileInput) DOM.hiddenFileInput.addEventListener("change", (e) => handleSelectedFiles(e.target.files));
        if(DOM.hiddenCameraInput) DOM.hiddenCameraInput.addEventListener("change", (e) => handleSelectedFiles(e.target.files));

        DOM.galleryThumbs.forEach(t => t.addEventListener("click", (e) => {
            appState.activeWallpaper = e.target.dataset.wall;
            localStorage.setItem(STORAGE_KEYS.WALLPAPER, appState.activeWallpaper);
            applyVisualThemes();
        }));

        if(DOM.customWallpaperInput) {
            DOM.customWallpaperInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) {
                    const r = new FileReader();
                    r.onload = (evt) => { appState.activeWallpaper = evt.target.result; localStorage.setItem(STORAGE_KEYS.WALLPAPER, appState.activeWallpaper); applyVisualThemes(); };
                    r.readAsDataURL(e.target.files[0]);
                }
            });
        }

        if(DOM.changeAvatarBtn) DOM.changeAvatarBtn.addEventListener("click", () => DOM.profileAvatarInput.click());
        if(DOM.profileAvatarInput) {
            DOM.profileAvatarInput.addEventListener("change", (e) => {
                if (e.target.files.length > 0) {
                    const r = new FileReader();
                    r.onload = (evt) => { appState.userAvatar = evt.target.result; syncAvatarUI(); };
                    r.readAsDataURL(e.target.files[0]);
                }
            });
        }

        if(DOM.saveProfileBtn) {
            DOM.saveProfileBtn.addEventListener("click", () => {
                const n = DOM.editProfileName.value.trim();
                if (n) {
                    appState.currentUser = n;
                    localStorage.setItem(STORAGE_KEYS.USER_SESSION, n);
                    localStorage.setItem(STORAGE_KEYS.PROFILE_AVATAR, appState.userAvatar);
                    alert("প্রোফাইল আপডেটেড!");
                    DOM.profilePanel.style.display = "none";
                    loadActiveChatUI();
                }
            });
        }

        if (voiceRecognitionInstance && DOM.voiceBtn) {
            DOM.voiceBtn.addEventListener("click", () => { DOM.voiceBtn.classList.add("active-state"); voiceRecognitionInstance.start(); });
            voiceRecognitionInstance.onresult = (e) => { DOM.userInput.value += e.results[0][0].transcript; autoResizeTextArea(); };
            voiceRecognitionInstance.onend = () => DOM.voiceBtn.classList.remove("active-state");
        }
    }

    function setupPanelToggle(trigger, panel, closeBtn) {
        if(!trigger || !panel || !closeBtn) return;
        trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            const show = panel.style.display === "block";
            if(DOM.wallpaperPanel) DOM.wallpaperPanel.style.display = "none"; 
            if(DOM.settingsPanel) DOM.settingsPanel.style.display = "none"; 
            if(DOM.profilePanel) DOM.profilePanel.style.display = "none";
            panel.style.display = show ? "none" : "block";
        });
        closeBtn.addEventListener("click", () => panel.style.display = "none");
        document.addEventListener("click", (e) => { if (!panel.contains(e.target) && e.target !== trigger) panel.style.display = "none"; });
    }

    function processIncomingUserPrompt() {
        const text = DOM.userInput.value.trim();
        if (!text && appState.uploadedFiles.length === 0) return;
        const activeChat = appState.conversations[appState.activeChatId];
        if (!activeChat) return;

        const newMsg = {
            role: "user",
            content: text || "Uploaded Payload",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            files: [...appState.uploadedFiles]
        };
        activeChat.messages.push(newMsg);
        appendMessageToDOM("user", newMsg.content, newMsg.timestamp, activeChat.messages.length - 1, newMsg.files);

        DOM.userInput.value = ""; appState.uploadedFiles = []; renderAttachmentPills(); autoResizeTextArea();
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(appState.conversations));
        dispatchAIReplySequence();
       function toggleThemeMode() { 
        appState.isDarkMode = !appState.isDarkMode; 
        localStorage.setItem(STORAGE_KEYS.THEME, appState.isDarkMode); 
        applyVisualThemes(); 
    }

    function autoResizeTextArea() { 
        if(DOM.userInput) { 
            DOM.userInput.style.height = "auto"; 
            DOM.userInput.style.height = DOM.userInput.scrollHeight + "px"; 
        } 
    }

    function escapeHTML(str) { 
        return str.replace(/[&<>'"]/g, t => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[t] || t)); 
    }
           window.addEventListener("resize", () => { 
        if(DOM.mobileMenuBtn) DOM.mobileMenuBtn.style.display = window.innerWidth > 768 ? "none" : "block"; 
        if (window.innerWidth > 768 && DOM.sidebarPanel) DOM.sidebarPanel.classList.remove("mobile-open"); 
    });

    if (window.innerWidth <= 768 && DOM.mobileMenuBtn) DOM.mobileMenuBtn.style.display = "block";

    document.addEventListener("DOMContentLoaded", initApp);
})();
