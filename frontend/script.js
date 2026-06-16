/* ==========================================
   TBP AI v3.1 Stable
   Part 1 - Global Style + Variables
========================================== */

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
}

:root{

    --bg:#0b1220;
    --surface:#111827;
    --card:rgba(17,24,39,.88);

    --primary:#10a37f;
    --secondary:#2563eb;

    --text:#ffffff;
    --muted:#9ca3af;

    --border:rgba(255,255,255,.08);

    --shadow:0 10px 30px rgba(0,0,0,.35);

    --radius:22px;

}

html{

    scroll-behavior:smooth;

}

body{

    font-family:"Poppins",sans-serif;

    color:var(--text);

    background:
    linear-gradient(rgba(5,10,20,.82),rgba(5,10,20,.82)),
    url("wallpapers/wall1.jpg");

    background-size:cover;
    background-position:center;
    background-attachment:fixed;

    width:100%;
    height:100vh;

    overflow:hidden;

}

/* App */

.app{

    width:100%;
    height:100vh;

    display:flex;
    flex-direction:column;

}

/* Scrollbar */

::-webkit-scrollbar{

    width:6px;

}

::-webkit-scrollbar-thumb{

    background:var(--primary);

    border-radius:30px;

}

/* Button */

button{

    font-family:inherit;

    cursor:pointer;

    transition:.25s;

}

/* Input */

input,
textarea{

    font-family:inherit;

    outline:none;

    border:none;

}

/* Glass */

.glass{

    background:var(--card);

    backdrop-filter:blur(18px);

    border:1px solid var(--border);

        }
/* ==========================================
   Part 2 - Login Screen + Premium Header
========================================== */

/* ---------- Login Screen ---------- */

.login-screen{

    position:fixed;
    inset:0;

    display:flex;
    align-items:center;
    justify-content:center;

    background:rgba(5,10,20,.92);

    backdrop-filter:blur(15px);

    z-index:9999;

}

.login-card{

    width:92%;
    max-width:380px;

    padding:30px;

    border-radius:26px;

    background:rgba(17,24,39,.90);

    border:1px solid rgba(255,255,255,.08);

    box-shadow:0 20px 50px rgba(0,0,0,.45);

    text-align:center;

}

.login-logo{

    width:85px;
    height:85px;

    margin:auto;

    border-radius:50%;

    display:flex;
    align-items:center;
    justify-content:center;

    font-size:40px;

    background:linear-gradient(135deg,#10a37f,#2563eb);

    box-shadow:0 0 25px rgba(16,163,127,.35);

}

.login-card h1{

    margin-top:18px;

    font-size:28px;

}

.login-card p{

    margin:10px 0 22px;

    color:var(--muted);

}

.login-card input{

    width:100%;

    padding:15px 18px;

    margin-bottom:16px;

    border-radius:14px;

    background:#0f172a;

    color:#fff;

    font-size:15px;

}

.login-card button{

    width:100%;

    padding:15px;

    border:none;

    border-radius:14px;

    font-size:16px;

    font-weight:600;

    color:#fff;

    background:linear-gradient(135deg,#10a37f,#2563eb);

}

.login-card button:hover{

    transform:translateY(-2px);

}

/* ---------- Premium Header ---------- */

.header{

    position:sticky;
    top:0;
    z-index:100;

    display:flex;
    justify-content:space-between;
    align-items:center;

    padding:15px 18px;

    background:rgba(17,24,39,.88);

    backdrop-filter:blur(18px);

    border-bottom:1px solid rgba(255,255,255,.08);

}

.header-left{

    display:flex;
    align-items:center;
    gap:14px;

}

.ai-logo{

    width:52px;
    height:52px;

    border-radius:50%;

    display:flex;
    align-items:center;
    justify-content:center;

    font-size:24px;

    background:linear-gradient(135deg,#10a37f,#2563eb);

    box-shadow:0 0 20px rgba(16,163,127,.35);

}

.header-title h2{

    font-size:20px;

    font-weight:700;

}

.header-title span{

    display:block;

    margin-top:3px;

    color:var(--muted);

    font-size:12px;

}

.header-right{

    display:flex;

    gap:10px;

}

.top-btn{

    width:42px;
    height:42px;

    border:none;

    border-radius:50%;

    background:#1f2937;

    color:#fff;

    font-size:18px;

}

.top-btn:hover{

    background:#10a37f;

    transform:scale(1.08);

        }
