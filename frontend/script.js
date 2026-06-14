// =====================================
// TBP AI v3.0
// Professional Script
// Part 1 - Setup
// =====================================

// Backend URL
const API_URL = "https://tbp-ai-v2.onrender.com/chat";

// Elements
const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const typing = document.getElementById("typing");

const newChatBtn = document.getElementById("newChatBtn");
const themeBtn = document.getElementById("themeBtn");

const wallpaperBtn = document.getElementById("wallpaperBtn");
const wallpaperPanel = document.getElementById("wallpaperPanel");
const closeWallpaper = document.getElementById("closeWallpaper");

const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

// Conversation Memory
let messages = [];

// ==========================
// Add Message
// ==========================

function addMessage(text, sender){

    const wrapper = document.createElement("div");

    wrapper.className = sender + " message";

    const bubble = document.createElement("div");

    bubble.className = "bubble";

    bubble.innerHTML = text;

    wrapper.appendChild(bubble);

    chatBox.appendChild(wrapper);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// ==========================
// Typing
// ==========================

function showTyping(){

    typing.style.display = "block";

}

function hideTyping(){

    typing.style.display = "none";

}
// =====================================
// TBP AI v3.0
// Part 2 - Send Message
// =====================================

async function sendMessage(){

    const text = userInput.value.trim();

    if(!text) return;

    addMessage(text,"user");

    messages.push({
        role:"user",
        content:text
    });

    userInput.value="";

    showTyping();

    try{

        const response = await fetch(API_URL,{

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({

                message:text,

                history:messages

            })

        });

        const data = await response.json();

        hideTyping();

        const reply =
            data.reply ||
            "⚠️ কোনো উত্তর পাওয়া যায়নি।";

        addMessage(reply,"bot");

        messages.push({

            role:"assistant",

            content:reply

        });

        localStorage.setItem(
            "tbp_messages",
            JSON.stringify(messages)
        );

    }

    catch(error){

        hideTyping();

        addMessage(
            "❌ Server-এর সাথে সংযোগ করা যাচ্ছে না।",
            "bot"
        );

        console.error(error);

    }

}

// Send Button

sendBtn.addEventListener("click",sendMessage);

// Enter Key

userInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

});
// =====================================
// TBP AI v3.0
// Part 3 - Theme, Login, Wallpaper
// =====================================

// ---------- Login ----------

const savedUser = localStorage.getItem("tbp_username");

if(savedUser){

    loginScreen.style.display="none";

}

loginBtn.addEventListener("click",()=>{

    const name=usernameInput.value.trim();

    if(!name){

        alert("আপনার নাম লিখুন");

        return;

    }

    localStorage.setItem("tbp_username",name);

    loginScreen.style.display="none";

    addMessage(`👋 স্বাগতম <b>${name}</b>!`,"bot");

});

// ---------- Theme ----------

const savedTheme=localStorage.getItem("tbp_theme");

if(savedTheme==="light"){

    document.body.classList.add("light");

}

themeBtn.addEventListener("click",()=>{

    document.body.classList.toggle("light");

    localStorage.setItem(

        "tbp_theme",

        document.body.classList.contains("light")

        ? "light"

        : "dark"

    );

});

// ---------- New Chat ----------

newChatBtn.addEventListener("click",()=>{

    if(!confirm("নতুন Chat শুরু করবেন?")) return;

    messages=[];

    chatBox.innerHTML="";

    localStorage.removeItem("tbp_messages");

    addMessage("👋 নতুন Chat শুরু হয়েছে।","bot");

});

// ---------- Load Old Chat ----------

const oldChat=localStorage.getItem("tbp_messages");

if(oldChat){

    messages=JSON.parse(oldChat);

    chatBox.innerHTML="";

    messages.forEach(msg=>{

        addMessage(

            msg.content,

            msg.role==="user" ? "user" : "bot"

        );

    });

}

// ---------- Wallpaper ----------

if(wallpaperBtn){

    wallpaperBtn.onclick=()=>{

        wallpaperPanel.style.display="flex";

    };

}

if(closeWallpaper){

    closeWallpaper.onclick=()=>{

        wallpaperPanel.style.display="none";

    };

}

document.querySelectorAll(".wallpaper").forEach(item=>{

    item.onclick=()=>{

        const wall=item.dataset.wall;

        document.body.style.backgroundImage=

        `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url(${wall})`;

        document.body.style.backgroundSize="cover";

        document.body.style.backgroundPosition="center";

        localStorage.setItem("tbp_wallpaper",wall);

        wallpaperPanel.style.display="none";

    };

});

const savedWallpaper=localStorage.getItem("tbp_wallpaper");

if(savedWallpaper){

    document.body.style.backgroundImage=

    `linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)),url(${savedWallpaper})`;

    document.body.style.backgroundSize="cover";

    document.body.style.backgroundPosition="center";

}
