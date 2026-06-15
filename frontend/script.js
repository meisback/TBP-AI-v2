// =====================================
// TBP AI v3.0 Pro
// Part 1 - Setup + Login + Theme
// =====================================

// ===== Backend API =====
const API_URL = "https://tbp-ai-v2.onrender.com/chat";

// ===== Elements =====
const loginScreen = document.getElementById("loginScreen");
const loginBtn = document.getElementById("loginBtn");
const usernameInput = document.getElementById("username");

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

const themeBtn = document.getElementById("themeBtn");
const newChatBtn = document.getElementById("newChatBtn");

const typing = document.getElementById("typing");

// ===== Memory =====
let messages = [];

// =====================================
// Login System
// =====================================

const savedUser = localStorage.getItem("tbp_username");

if(savedUser){

loginScreen.style.display="none";

}

loginBtn.addEventListener("click",()=>{

const name = usernameInput.value.trim();

if(!name){

    alert("আপনার নাম লিখুন");

    return;

}

localStorage.setItem("tbp_username",name);

loginScreen.style.display="none";

});

// =====================================
// Theme
// =====================================

const savedTheme = localStorage.getItem("tbp_theme");

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

// =====================================
// Helper Functions
// =====================================

function showTyping(){

typing.style.display="block";

}

function hideTyping(){

typing.style.display="none";

}

function scrollBottom(){

chatBox.scrollTop=chatBox.scrollHeight;

}

function saveChat(){

localStorage.setItem(

    "tbp_messages",

    JSON.stringify(messages)

);

}
// =====================================
// TBP AI v3.0 Pro
// Professional addMessage()
// =====================================

function addMessage(text, sender){

    const message = document.createElement("div");
    message.className = sender + " message";

    const avatar = document.createElement("div");
    avatar.className = "avatar";

    avatar.innerHTML =
        sender === "user"
        ? "👤"
        : "🤖";

    const bubble = document.createElement("div");
    bubble.className = "bubble";

    bubble.innerHTML = text;

    const info = document.createElement("div");
    info.className = "message-info";

    const time = new Date().toLocaleTimeString([],{
        hour:"2-digit",
        minute:"2-digit"
    });

    const copyBtn = document.createElement("button");
    copyBtn.className = "copy-btn";
    copyBtn.innerHTML = "📋";

    copyBtn.onclick = async ()=>{

        try{

            await navigator.clipboard.writeText(text);

            copyBtn.innerHTML="✅";

            setTimeout(()=>{

                copyBtn.innerHTML="📋";

            },1500);

        }catch{

            alert("Copy Failed");

        }

    };

    info.innerHTML =
        "<span>"+time+"</span>";

    info.appendChild(copyBtn);

    bubble.appendChild(info);

    if(sender==="user"){

        message.appendChild(bubble);

        message.appendChild(avatar);

    }else{

        message.appendChild(avatar);

        message.appendChild(bubble);

    }

    chatBox.appendChild(message);

    scrollBottom();

}

// Send Message
async function sendMessage(){

const text = userInput.value.trim();

if(!text) return;

addMessage(text,"user");

messages.push({
    role:"user",
    content:text
});

saveChat();

userInput.value="";
userInput.style.height="54px";

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

    saveChat();

}catch(error){

    hideTyping();

    addMessage(

        "❌ সার্ভারের সাথে সংযোগ করা যাচ্ছে না।",

        "bot"

    );

    console.error(error);

}

}

// Send Button
sendBtn.addEventListener(

"click",

sendMessage

);

// Enter Key
userInput.addEventListener(

"keydown",

function(e){

    if(e.key==="Enter" && !e.shiftKey){

        e.preventDefault();

        sendMessage();

    }

}

);
// =====================================
// Part 3 - Wallpaper + Settings +
// Profile + Chat History + Logout
// =====================================

// ===== Panels =====
const wallpaperPanel = document.getElementById("wallpaperPanel");
const settingsPanel = document.getElementById("settingsPanel");
const profilePanel = document.getElementById("profilePanel");

const wallpaperBtn = document.getElementById("wallpaperBtn");
const settingsBtn = document.getElementById("settingsBtn");
const profileBtn = document.getElementById("profileBtn");

const closeWallpaper = document.getElementById("closeWallpaper");
const closeSettings = document.getElementById("closeSettings");
const closeProfile = document.getElementById("closeProfile");

const openWallpaperBtn = document.getElementById("openWallpaperBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ===== Wallpaper =====
if(wallpaperBtn){
wallpaperBtn.onclick=()=>wallpaperPanel.style.display="flex";
}

if(openWallpaperBtn){
openWallpaperBtn.onclick=()=>{
settingsPanel.style.display="none";
wallpaperPanel.style.display="flex";
};
}

if(closeWallpaper){
closeWallpaper.onclick=()=>wallpaperPanel.style.display="none";
}

document.querySelectorAll(".wallpaper").forEach(item=>{

item.onclick=()=>{

    const img=item.dataset.wall;

    document.body.style.background=
    `linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.82)),url(${img})`;

    document.body.style.backgroundSize="cover";
    document.body.style.backgroundPosition="center";
    document.body.style.backgroundAttachment="fixed";

    localStorage.setItem("tbp_wallpaper",img);

    wallpaperPanel.style.display="none";

};

});

const savedWallpaper=localStorage.getItem("tbp_wallpaper");

if(savedWallpaper){

document.body.style.background=
`linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.82)),url(${savedWallpaper})`;

document.body.style.backgroundSize="cover";
document.body.style.backgroundPosition="center";
document.body.style.backgroundAttachment="fixed";

}

// ===== Settings =====
if(settingsBtn){
settingsBtn.onclick=()=>settingsPanel.style.display="flex";
}

if(closeSettings){
closeSettings.onclick=()=>settingsPanel.style.display="none";
}

// ===== Profile =====
if(profileBtn){
profileBtn.onclick=()=>{

    const name=localStorage.getItem("tbp_username")||"Guest";

    document.getElementById("profileName").textContent=name;

    profilePanel.style.display="flex";

};

}

if(closeProfile){
closeProfile.onclick=()=>profilePanel.style.display="none";
}

// ===== Chat History =====
const savedMessages=localStorage.getItem("tbp_messages");

if(savedMessages){

messages=JSON.parse(savedMessages);

chatBox.innerHTML="";

messages.forEach(msg=>{

    addMessage(

        msg.content,

        msg.role==="user" ? "user" : "bot"

    );

});

}

// ===== New Chat =====
if(newChatBtn){

newChatBtn.onclick=()=>{

    if(confirm("নতুন Chat শুরু করবেন?")){

        messages=[];

        localStorage.removeItem("tbp_messages");

        chatBox.innerHTML="";

    }

};

}

// ===== Clear Chat =====
if(clearChatBtn){

clearChatBtn.onclick=()=>{

    messages=[];

    localStorage.removeItem("tbp_messages");

    chatBox.innerHTML="";

    settingsPanel.style.display="none";

};

}

// ===== Logout =====
if(logoutBtn){

logoutBtn.onclick=()=>{

    localStorage.removeItem("tbp_username");

    location.reload();

};

}

// ===== Auto Resize =====
userInput.addEventListener("input",()=>{

userInput.style.height="54px";

userInput.style.height=userInput.scrollHeight+"px";

});
