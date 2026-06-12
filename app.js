// ================= EMAIL & NOTIFICATION SETTINGS =================
// Replace placeholders with your EmailJS credentials once you create an account
const EMAIL_CONFIG = {
    PUBLIC_KEY: "Pvt0caTc5SKSnR4IT",     // Insert your EmailJS Public Key here (e.g. "user_abcdef...")
    SERVICE_ID: "service_9y2mcgh",     // Insert your EmailJS Service ID here (e.g. "service_123...")
    TEMPLATE_ID: "template_bnrmz3n",   // Insert your EmailJS Template ID here (e.g. "template_abc...")
};


/**
 * Sends a welcome email to the registered user.
 * If credentials are not yet configured, runs in mock mode.
 * @param {Object} user - The registered user details
 */
async function sendWelcomeEmail(user) {
    const isConfigured = EMAIL_CONFIG.PUBLIC_KEY && EMAIL_CONFIG.SERVICE_ID && EMAIL_CONFIG.TEMPLATE_ID;

    // Template parameters matching variables in EmailJS template
    const templateParams = {
        user_name: user.name,
        user_email: user.email,
        login_url: window.location.origin || "http://127.0.0.1:8080",
        reply_to: "no-reply@campuslf.edu"
    };

    if (!isConfigured) {
        console.log("%c[Mock Email Sent]", "color: #a855f7; font-weight: bold; font-size: 1.2em;");
        console.log(`To: ${user.name} <${user.email}>`);
        console.log("Subject: Welcome to Campus Lost & Found!");
        console.log("Body: Hi " + user.name + ",\nWelcome to Campus Lost & Found! Your account has been registered successfully. You can now report lost or found items and connect with other members.");
        console.log("Configure EmailJS in app.js with your credentials to send live emails.");
        
        // Let the user know with an informative Toast too
        // setTimeout(() => {
        //     showToast(`[Mock Email] Welcome email sent to ${user.email} (configured in dev console)`, "info");
        // }, 1500);
        return;
    }

    try {
        if (typeof emailjs === 'undefined') {
            throw new Error("EmailJS SDK failed to load. Ensure index.html includes the CDN script.");
        }
        
        // Initialize EmailJS with Public Key
        emailjs.init({
            publicKey: EMAIL_CONFIG.PUBLIC_KEY,
        });

        // Send Email
        const response = await emailjs.send(
            EMAIL_CONFIG.SERVICE_ID,
            EMAIL_CONFIG.TEMPLATE_ID,
            templateParams
        );
        console.log("EmailJS Success:", response.status, response.text);
        // showToast(`Welcome email sent successfully to ${user.email}!`, "success");
    } catch (error) {
        console.error("EmailJS Error:", error);
        showToast("Welcome email failed to send. Check console for details.", "error");
    }
}

// ================= DATA SEED & INITIALIZATION =================
const DEFAULT_USERS = [

    {
        email: "sunnykumar7122007@gmail.com",
        password: "$unny1357.S",
        role: "admin",
        name: "Sunny Kumar (Admin)"
    },
    {
        email: "user@campus.edu",
        password: "password",
        role: "user",
        name: "Alex Mercer"
    }
];

const DEFAULT_ITEMS = [
    {
        id: "mock-1",
        title: "Space Gray MacBook Air M2",
        type: "lost",
        category: "Electronics",
        location: "Library 3rd Floor study desks",
        date: "2026-06-08",
        description: "MacBook Air with a sticker of Octocat on the lid. Left it on the corner study desks around 4:00 PM.",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80",
        reporterName: "Alex Mercer",
        reporterEmail: "user@campus.edu",
        contactDetails: "+1 (555) 302-9844",
        status: "active", // active, pending, resolved
        createdAt: new Date("2026-06-08T16:30:00").getTime()
    },
    {
        id: "mock-2",
        title: "Keys on Tan Leather Keyring",
        type: "found",
        category: "Keys & Wallets",
        location: "Campus Cafeteria near register",
        date: "2026-06-09",
        description: "Found a set of 3 keys with a tan leather strap and a tiny silver globe keychain on the cafeteria counter.",
        image: "https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80",
        reporterName: "Sunny Kumar (Admin)",
        reporterEmail: "sunnykumar7122007@gmail.com",
        contactDetails: "Main Office - Admin Block A",
        status: "active",
        createdAt: new Date("2026-06-09T10:15:00").getTime()
    },
    {
        id: "mock-3",
        title: "Black Herschel Backpack",
        type: "lost",
        category: "Bags & Backpacks",
        location: "Sports Complex locker area",
        date: "2026-06-07",
        description: "Black classic Herschel backpack. Has a red interior. Contains a blue spiral notebook and a purple pencil case.",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
        reporterName: "Alex Mercer",
        reporterEmail: "user@campus.edu",
        contactDetails: "alex.m@campus.edu",
        status: "active",
        createdAt: new Date("2026-06-07T18:00:00").getTime()
    },
    {
        id: "mock-4",
        title: "Calculus Textbook (11th Edition)",
        type: "found",
        category: "Books & Stationery",
        location: "Block B Room 302",
        date: "2026-06-08",
        description: "Calculus: Early Transcendentals textbook left under desk 14. The name 'Sarah' is written inside the front cover.",
        image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80",
        reporterName: "Sunny Kumar (Admin)",
        reporterEmail: "sunnykumar7122007@gmail.com",
        contactDetails: "Contact Admin Office desk",
        status: "active",
        createdAt: new Date("2026-06-08T11:00:00").getTime()
    },
    {
        id: "mock-5",
        title: "Leather Wallet (Brown)",
        type: "lost",
        category: "Keys & Wallets",
        location: "Science Lab 4",
        date: "2026-06-09",
        description: "Brown bi-fold Fossil wallet. Contains campus ID card and metro card. Reward offered for safe return!",
        image: "https://images.unsplash.com/photo-1627124765135-56530125585b?auto=format&fit=crop&w=600&q=80",
        reporterName: "Sarah Connor",
        reporterEmail: "sarah.c@campus.edu",
        contactDetails: "Please call +1 (555) 901-2283",
        status: "pending", // Starts as pending to show how admin approvals work!
        createdAt: new Date("2026-06-09T12:00:00").getTime()
    }
];

// Global Application State
let currentUser = null;
let items = [];
let users = [];
let chatInvitations = [];
let conversations = [];

let uploadedImageBase64 = null; // Store compressed base64 of selected file

// Database Sync Helpers
async function saveUser(user) {
    if (dbManager.db) {
        await dbManager.put("users", user);
    }
    localStorage.setItem("lf_users", JSON.stringify(users));
}

async function saveItem(item) {
    if (dbManager.db) {
        await dbManager.put("items", item);
    }
    localStorage.setItem("lf_items", JSON.stringify(items));
}

async function deleteItemFromDB(itemId) {
    if (dbManager.db) {
        await dbManager.delete("items", itemId);
    }
    localStorage.setItem("lf_items", JSON.stringify(items));
}

async function saveInvitation(invitation) {
    if (dbManager.db) {
        await dbManager.put("chat_invitations", invitation);
    }
    localStorage.setItem("lf_chat_invitations", JSON.stringify(chatInvitations));
}

async function saveConversation(conversation) {
    if (dbManager.db) {
        await dbManager.put("conversations", conversation);
    }
    localStorage.setItem("lf_conversations", JSON.stringify(conversations));
}

// Initialize Database on App load
async function initDatabaseData() {
    // 1. Load users
    users = await dbManager.getAll("users");
    if (!users || users.length === 0) {
        await dbManager.putAll("users", DEFAULT_USERS);
        users = [...DEFAULT_USERS];
    }
    
    // Fix admin account in database "every time"
    let adminUser = users.find(u => u.role === 'admin');
    if (adminUser) {
        adminUser.email = "sunnykumar7122007@gmail.com";
        adminUser.password = "$unny1357.S";
        adminUser.name = "Sunny Kumar (Admin)";
        await dbManager.put("users", adminUser);
    } else {
        adminUser = {
            email: "sunnykumar7122007@gmail.com",
            password: "$unny1357.S",
            role: "admin",
            name: "Sunny Kumar (Admin)"
        };
        users.push(adminUser);
        await dbManager.put("users", adminUser);
    }
    localStorage.setItem("lf_users", JSON.stringify(users));
    
    // 2. Load items
    items = await dbManager.getAll("items");
    if (!items || items.length === 0) {
        await dbManager.putAll("items", DEFAULT_ITEMS);
        items = [...DEFAULT_ITEMS];
    }
    // Sort items by creation time (newest first)
    items.sort((a, b) => b.createdAt - a.createdAt);
    localStorage.setItem("lf_items", JSON.stringify(items));

    // 3. Load invitations
    chatInvitations = await dbManager.getAll("chat_invitations");
    if (!chatInvitations) chatInvitations = [];
    localStorage.setItem("lf_chat_invitations", JSON.stringify(chatInvitations));

    // 4. Load conversations
    conversations = await dbManager.getAll("conversations");
    if (!conversations) conversations = [];
    localStorage.setItem("lf_conversations", JSON.stringify(conversations));
}


// ================= LIFECYCLE & ROUTING =================
document.addEventListener("DOMContentLoaded", async () => {
    initTheme();
    updatePrefillChips();
    
    try {
        await dbManager.init();
        await initDatabaseData();
    } catch (e) {
        console.error("IndexedDB initialization failed, falling back to localStorage", e);
        // Fallback to localStorage data
        users = JSON.parse(localStorage.getItem("lf_users")) || DEFAULT_USERS;
        items = JSON.parse(localStorage.getItem("lf_items")) || DEFAULT_ITEMS;
        chatInvitations = JSON.parse(localStorage.getItem("lf_chat_invitations")) || [];
        conversations = JSON.parse(localStorage.getItem("lf_conversations")) || [];
    }
    
    checkSession();
    setupDragAndDrop();
});

// ================= THEME CONTROLLER =================
function initTheme() {
    const savedTheme = localStorage.getItem("lf_theme") || "light";
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
    updateThemeUI();
}

function toggleTheme() {
    if (document.body.classList.contains("light-mode")) {
        document.body.classList.remove("light-mode");
        localStorage.setItem("lf_theme", "dark");
        showToast("Switched to Dark Mode", "success");
    } else {
        document.body.classList.add("light-mode");
        localStorage.setItem("lf_theme", "light");
        showToast("Switched to Light Mode", "success");
    }
    updateThemeUI();
}

function updateThemeUI() {
    const isLight = document.body.classList.contains("light-mode");
    
    // Update all theme toggle button icons
    const icons = document.querySelectorAll(".theme-icon");
    icons.forEach(icon => {
        if (isLight) {
            icon.className = "fa-solid fa-sun theme-icon";
        } else {
            icon.className = "fa-solid fa-moon theme-icon";
        }
    });
    
    // Update sidebar theme button text if it exists
    const btnText = document.getElementById("theme-btn-text");
    if (btnText) {
        btnText.textContent = isLight ? "Light Mode" : "Dark Mode";
    }
}

function checkSession() {
    const session = sessionStorage.getItem("lf_session") || localStorage.getItem("lf_session");
    if (session) {
        currentUser = JSON.parse(session);
        showMainView();
    } else {
        showAuthView();
    }
}

function showAuthView() {
    document.getElementById("auth-view").classList.add("active-view");
    document.getElementById("main-view").classList.remove("active-view");
    document.getElementById("auth-view").style.display = "flex";
    document.getElementById("main-view").style.display = "none";
}

function showMainView() {
    document.getElementById("auth-view").classList.remove("active-view");
    document.getElementById("main-view").classList.add("active-view");
    document.getElementById("auth-view").style.display = "none";
    document.getElementById("main-view").style.display = "flex";
    
    // Setup Sidebar User Info
    document.getElementById("user-display-name").textContent = currentUser.name;
    document.getElementById("user-display-role").textContent = currentUser.role === 'admin' ? 'Administrator' : 'Student';
    document.getElementById("user-avatar-initials").textContent = getInitials(currentUser.name);
    
    // Toggle Admin sidebar navigation
    const adminNavs = document.querySelectorAll(".admin-only");
    adminNavs.forEach(nav => {
        if (currentUser.role === 'admin') {
            nav.style.display = "flex";
        } else {
            nav.style.display = "none";
        }
    });
    
    // Toggle My Reports navigation (hidden for admin)
    const myReportsNav = document.getElementById("nav-my-reports");
    if (myReportsNav) {
        if (currentUser.role === 'admin') {
            myReportsNav.style.display = "none";
        } else {
            myReportsNav.style.display = "flex";
        }
    }

    // Toggle Report Item navigation (hidden for admin)
    const reportNav = document.getElementById("nav-report");
    if (reportNav) {
        if (currentUser.role === 'admin') {
            reportNav.style.display = "none";
        } else {
            reportNav.style.display = "flex";
        }
    }
    
    // Set default tab
    switchTab('dashboard');
    updateStats();
    updateThemeUI();
    updateMessageBadge();
    startDataPolling();
}

function getInitials(name) {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
}

// ================= AUTHENTICATION ACTIONS =================
let currentLoginRole = 'user';

function switchAuthRole(role) {
    currentLoginRole = role;
    
    // Toggle active classes on tab buttons
    const userTab = document.getElementById("tab-btn-user");
    const adminTab = document.getElementById("tab-btn-admin");
    const tabsContainer = document.getElementById("auth-tabs-container");
    
    if (role === 'user') {
        userTab.classList.add("active");
        adminTab.classList.remove("active");
        tabsContainer.classList.remove("admin-active");
    } else {
        userTab.classList.remove("active");
        adminTab.classList.add("active");
        tabsContainer.classList.add("admin-active");
    }
    
    // Get elements
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    const signupLink = document.getElementById("signup-link-container");
    
    // If signup form is visible, switch back to login form first
    if (signupForm.classList.contains("active-form")) {
        signupForm.style.opacity = "0";
        signupForm.style.transform = "translateY(8px)";
        
        setTimeout(() => {
            signupForm.classList.remove("active-form");
            signupForm.style.display = "none";
            
            loginForm.classList.add("active-form");
            loginForm.style.display = "flex";
            loginForm.reset();
            
            // Update label and link
            updateLoginLabel(role);
            toggleSignupLink(signupLink, role);
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    loginForm.style.opacity = "1";
                    loginForm.style.transform = "translateY(0)";
                });
            });
        }, 250);
    } else {
        // Login form is already showing — just fade content, no display toggling
        loginForm.style.opacity = "0";
        loginForm.style.transform = "translateY(8px)";
        
        setTimeout(() => {
            loginForm.reset();
            updateLoginLabel(role);
            toggleSignupLink(signupLink, role);
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    loginForm.style.opacity = "1";
                    loginForm.style.transform = "translateY(0)";
                });
            });
        }, 300);
    }
}

function updateLoginLabel(role) {
    const emailLabel = document.getElementById("login-email-label");
    if (emailLabel) {
        emailLabel.innerHTML = `<i class="fa-regular fa-envelope"></i> ${role === 'user' ? 'User Email' : 'Admin Email'}`;
    }
    const emailInput = document.getElementById("login-email");
    if (emailInput) {
        emailInput.placeholder = role === 'user' ? 'user@gmail.com' : 'admin@gmail.com';
    }
}

function toggleSignupLink(el, role) {
    if (!el) return;
    if (role === 'user') {
        el.classList.remove("hidden-smooth");
    } else {
        el.classList.add("hidden-smooth");
    }
}


function showSignupForm(event) {
    if (event) event.preventDefault();
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    
    // Fade out login form
    loginForm.style.opacity = "0";
    loginForm.style.transform = "translateY(12px)";
    
    setTimeout(() => {
        loginForm.classList.remove("active-form");
        loginForm.style.display = "none";
        
        signupForm.classList.add("active-form");
        signupForm.style.display = "flex";
        
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                signupForm.style.opacity = "1";
                signupForm.style.transform = "translateY(0)";
            });
        });
    }, 200);
}

function showLoginForm(event) {
    if (event) event.preventDefault();
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    
    // Fade out signup form if it was active
    const activeForm = document.querySelector(".auth-form.active-form");
    if (activeForm && activeForm === signupForm) {
        signupForm.style.opacity = "0";
        signupForm.style.transform = "translateY(12px)";
        
        setTimeout(() => {
            signupForm.classList.remove("active-form");
            signupForm.style.display = "none";
            
            loginForm.classList.add("active-form");
            loginForm.style.display = "flex";
            loginForm.reset();
            
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    loginForm.style.opacity = "1";
                    loginForm.style.transform = "translateY(0)";
                });
            });
        }, 200);
    } else {
        // Direct show (no animation needed)
        signupForm.classList.remove("active-form");
        signupForm.style.display = "none";
        loginForm.classList.add("active-form");
        loginForm.style.display = "flex";
        loginForm.style.opacity = "1";
        loginForm.style.transform = "translateY(0)";
        loginForm.reset();
    }
}

function updatePrefillChips() {
    const chipsContainer = document.getElementById("prefill-chips-container");
    if (!chipsContainer) return;
    
    if (currentLoginRole === 'user') {
        chipsContainer.innerHTML = `
            <button type="button" class="chip" onclick="prefillLogin('user@campus.edu', 'password', 'user')">
                <i class="fa-solid fa-user"></i> Student
            </button>
        `;
    } else {
        chipsContainer.innerHTML = `
            <button type="button" class="chip" onclick="prefillLogin('sunnykumar7122007@gmail.com', '$unny1357.S', 'admin')">
                <i class="fa-solid fa-user-shield"></i> Admin
            </button>
        `;
    }
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    if (input.type === 'password') {
        input.type = 'text';
        button.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
        input.type = 'password';
        button.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
}

function prefillLogin(email, password, role) {
    document.getElementById("login-email").value = email;
    document.getElementById("login-password").value = password;
    showToast(`Credentials pre-filled for ${role} demo!`, "info");
}

function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    const rememberMe = document.getElementById("login-remember").checked;
    
    const matchedUser = users.find(u => u.email === email && u.password === password && u.role === currentLoginRole);
    
    if (matchedUser) {
        if (matchedUser.suspended) {
            showToast("Your account has been suspended by an Administrator.", "error");
            return;
        }
        currentUser = matchedUser;
        
        if (rememberMe) {
            localStorage.setItem("lf_session", JSON.stringify(currentUser));
            sessionStorage.removeItem("lf_session");
        } else {
            sessionStorage.setItem("lf_session", JSON.stringify(currentUser));
            localStorage.removeItem("lf_session");
        }
        
        showToast(`Welcome back, ${currentUser.name}!`, "success");
        showMainView();
        
        // Reset form
        document.getElementById("login-form").reset();
    } else {
        showToast(`Invalid credentials for ${currentLoginRole.toUpperCase()} login. Please try again.`, "error");
    }
}

function checkPasswordStrength(password) {
    const minLength = 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial;
}

function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim().toLowerCase();
    const password = document.getElementById("signup-password").value;
    
    // Enforce Password Strength
    if (!checkPasswordStrength(password)) {
        showToast("Password must be at least 8 characters and contain uppercase, lowercase, numbers, and special characters.", "error");
        return;
    }
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast("This email is already registered on campus.", "error");
        return;
    }
    
    // Created accounts are always 'user' role
    const newUser = { name, email, password, role: 'user' };
    users.push(newUser);
    saveUser(newUser).catch(e => console.error(e));
    
    // Send welcome email (using configured EmailJS or Mock fallback)
    sendWelcomeEmail(newUser).catch(e => console.error(e));
    
    showToast("Account created successfully! Please log in now.", "success");

    
    // Switch to login form and pre-fill details
    showLoginForm();
    document.getElementById("login-email").value = email;
    document.getElementById("login-password").value = password;
    
    // Reset signup form
    document.getElementById("signup-form").reset();
}

function handleLogout() {
    localStorage.removeItem("lf_session");
    sessionStorage.removeItem("lf_session");
    currentUser = null;
    uploadedImageBase64 = null;
    activeConversationId = null;
    stopDataPolling();
    showToast("Logged out successfully.", "info");
    showAuthView();
    // Reset to User login role by default
    switchAuthRole('user');
}

// ================= TAB NAVIGATION =================
function switchTab(tabName) {
    // Hide all tabs
    const contents = document.querySelectorAll(".tab-content");
    contents.forEach(content => content.classList.remove("active-tab"));
    
    const navButtons = document.querySelectorAll(".nav-btn");
    navButtons.forEach(btn => btn.classList.remove("active"));
    
    // Show active tab
    const activeTab = document.getElementById(`tab-${tabName}`);
    if (activeTab) {
        activeTab.classList.add("active-tab");
    }
    
    const activeNav = document.getElementById(`nav-${tabName}`);
    if (activeNav) {
        activeNav.classList.add("active");
    }
    
    // Update Header Text dynamically
    const title = document.getElementById("page-title");
    const desc = document.getElementById("page-description");
    
    if (tabName === 'dashboard') {
        title.textContent = "Dashboard";
        desc.textContent = "Search, filter, and track reports recorded across campus";
        renderDashboard();
    } else if (tabName === 'report') {
        title.textContent = "Submit Report";
        desc.textContent = "Provide accurate details to facilitate reunification";
        resetReportForm();
    } else if (tabName === 'my-reports') {
        title.textContent = "Report Management";
        desc.textContent = "Track, edit, or resolve your reported items";
        renderMyReports();
    } else if (tabName === 'admin') {
        title.textContent = "System Administration";
        desc.textContent = "Review records, manage publication status, and update reunification progress";
        renderAdminConsole();
    } else if (tabName === 'admin-users') {
        title.textContent = "User Details";
        desc.textContent = "Manage campus accounts, credentials, and access permissions";
        renderAdminUsers();
    } else if (tabName === 'messages') {
        title.textContent = "Messages";
        desc.textContent = "Connect with campus members regarding reported items";
        renderMessages();
    }
    
    // Scroll content panel to top
    document.querySelector(".main-content").scrollTop = 0;
}

// ================= STATS CONTROLLER =================
function updateStats() {
    const total = items.length;
    const activeLost = items.filter(i => i.type === 'lost' && i.status === 'active').length;
    const activeFound = items.filter(i => i.type === 'found' && i.status === 'active').length;
    
    document.getElementById("stat-total").textContent = total;
    document.getElementById("stat-lost").textContent = activeLost;
    document.getElementById("stat-found").textContent = activeFound;
}

// ================= IMAGE COMPRESSION & UPLOAD =================
function setupDragAndDrop() {
    const dropzone = document.getElementById("upload-dropzone");
    
    if (!dropzone) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Highlight dropzone on drag enter/over
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.add('hover'), false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, () => dropzone.classList.remove('hover'), false);
    });
    
    // Handle dropped files
    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            processSelectedFile(files[0]);
        }
    });
}

function handleImageSelection(event) {
    const file = event.target.files[0];
    if (file) {
        processSelectedFile(file);
    }
}

function processSelectedFile(file) {
    const promptEl = document.querySelector("#upload-dropzone .dropzone-prompt");
    const previewContainer = document.getElementById("image-preview-container");
    const previewImg = document.getElementById("image-preview");
    const errorImage = document.getElementById("error-image");
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast("Please select a valid image file (PNG, JPG, WEBP).", "error");
        return;
    }
    
    // Validate file size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast("Image size exceeds 5MB limit.", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function(event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function() {
            // Compress Image using Offscreen Canvas
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            // Constrain size to max 600px width/height to avoid localStorage overflow
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 450;
            let width = img.width;
            let height = img.height;
            
            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }
            
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            
            // Compress to JPEG with 0.65 quality
            uploadedImageBase64 = canvas.toDataURL("image/jpeg", 0.65);
            
            // Show preview in UI
            previewImg.src = uploadedImageBase64;
            promptEl.style.display = "none";
            previewContainer.style.display = "block";
            
            // Clear validation error if visible
            document.getElementById("upload-dropzone").parentElement.classList.remove("has-error");
        };
    };
    reader.onerror = function() {
        showToast("Error reading image file.", "error");
    };
}

function clearSelectedImage(event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    uploadedImageBase64 = null;
    document.getElementById("report-image-input").value = "";
    document.querySelector("#upload-dropzone .dropzone-prompt").style.display = "flex";
    document.getElementById("image-preview-container").style.display = "none";
    document.getElementById("image-preview").src = "";
}

// ================= REPORT FORM HANDLING =================
function toggleFormTheme() {
    const reportType = document.querySelector('input[name="report-type"]:checked').value;
    const formCard = document.querySelector(".form-card");
    
    // Simply change border glows to reflect selection type
    if (reportType === 'lost') {
        formCard.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px var(--lost-glow)";
    } else {
        formCard.style.boxShadow = "0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 20px var(--found-glow)";
    }
}

function resetReportForm() {
    document.getElementById("report-form").reset();
    clearSelectedImage();
    
    // Clear validation styling
    const groups = document.querySelectorAll(".form-group");
    groups.forEach(g => g.classList.remove("has-error"));
    
    // Default form theme setting
    toggleFormTheme();
    
    // Pre-fill contact details from current user session
    document.getElementById("report-contact-name").value = currentUser.name;
    document.getElementById("report-contact-phone").value = currentUser.email;
    
    // Set date to current date
    const today = new Date().toISOString().split('T')[0];
    document.getElementById("report-date").value = today;
}

function handleReportSubmit(event) {
    event.preventDefault();
    
    // Get fields
    const title = document.getElementById("report-title").value.trim();
    const category = document.getElementById("report-category").value;
    const location = document.getElementById("report-location").value.trim();
    const date = document.getElementById("report-date").value;
    const description = document.getElementById("report-description").value.trim();
    const contactName = document.getElementById("report-contact-name").value.trim();
    const contactPhone = document.getElementById("report-contact-phone").value.trim();
    const type = document.querySelector('input[name="report-type"]:checked').value;
    
    // Perform manual validations
    let isValid = true;
    
    if (!title) {
        document.getElementById("report-title").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-title").parentElement.classList.remove("has-error");
    }
    
    if (!category) {
        document.getElementById("report-category").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-category").parentElement.classList.remove("has-error");
    }
    
    if (!location) {
        document.getElementById("report-location").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-location").parentElement.classList.remove("has-error");
    }
    
    if (!date) {
        document.getElementById("report-date").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-date").parentElement.classList.remove("has-error");
    }
    
    if (!description) {
        document.getElementById("report-description").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-description").parentElement.classList.remove("has-error");
    }
    
    if (!contactName) {
        document.getElementById("report-contact-name").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-contact-name").parentElement.classList.remove("has-error");
    }
    
    if (!contactPhone) {
        document.getElementById("report-contact-phone").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("report-contact-phone").parentElement.classList.remove("has-error");
    }
    
    // Image is strictly REQUIRED
    if (!uploadedImageBase64) {
        document.getElementById("upload-dropzone").parentElement.classList.add("has-error");
        isValid = false;
    } else {
        document.getElementById("upload-dropzone").parentElement.classList.remove("has-error");
    }
    
    if (!isValid) {
        showToast("Please correct validation errors and upload an image.", "error");
        return;
    }
    
    // Setup New Item Object
    const newItem = {
        id: "item-" + Date.now(),
        title,
        type,
        category,
        location,
        date,
        description,
        image: uploadedImageBase64,
        reporterName: contactName,
        reporterEmail: currentUser.email,
        contactDetails: contactPhone,
        // Admins skip approval and get active items; Student reports go to pending approval
        status: currentUser.role === 'admin' ? 'active' : 'pending',
        createdAt: Date.now()
    };
    
    items.unshift(newItem);
    saveItem(newItem).catch(e => console.error(e));
    updateStats();
    
    if (newItem.status === 'active') {
        showToast("Report submitted successfully and published live!", "success");
        switchTab('dashboard');
    } else {
        showToast("Report submitted successfully! It will appear on the dashboard and your reports once approved by an Admin.", "info");
        switchTab('dashboard');
    }
}

// ================= RENDER ENGINES =================

// Render main list dashboard (Users see Active & Resolved items)
function renderDashboard() {
    const grid = document.getElementById("items-grid-container");
    const emptyState = document.getElementById("dashboard-empty-state");
    grid.innerHTML = "";
    
    const searchQuery = document.getElementById("search-input").value.toLowerCase();
    const filterStatus = document.getElementById("filter-status").value;
    const filterCategory = document.getElementById("filter-category").value;
    
    // Filters items that are APPROVED (active or resolved)
    let filtered = items.filter(item => item.status === 'active' || item.status === 'resolved');
    
    // Apply search filter
    if (searchQuery) {
        filtered = filtered.filter(item => 
            item.title.toLowerCase().includes(searchQuery) ||
            item.description.toLowerCase().includes(searchQuery) ||
            item.location.toLowerCase().includes(searchQuery)
        );
    }
    
    // Apply status filter (lost vs found vs claimed/resolved)
    if (filterStatus !== 'all') {
        if (filterStatus === 'lost') {
            filtered = filtered.filter(item => item.type === 'lost' && item.status === 'active');
        } else if (filterStatus === 'found') {
            filtered = filtered.filter(item => item.type === 'found' && item.status === 'active');
        } else if (filterStatus === 'claimed') {
            filtered = filtered.filter(item => item.status === 'resolved');
        }
    }
    
    // Apply category filter
    if (filterCategory !== 'all') {
        filtered = filtered.filter(item => item.category === filterCategory);
    }
    
    if (filtered.length === 0) {
        emptyState.style.display = "block";
        grid.style.display = "none";
    } else {
        emptyState.style.display = "none";
        grid.style.display = "grid";
        
        filtered.forEach(item => {
            const card = document.createElement("div");
            card.className = "card item-card";
            card.onclick = () => openDetailModal(item.id);
            
            // Setup Badge
            let badgeClass = "badge-lost";
            let badgeText = "LOST";
            if (item.status === 'resolved') {
                badgeClass = "badge-claimed";
                badgeText = "RESOLVED";
            } else if (item.type === 'found') {
                badgeClass = "badge-found";
                badgeText = "FOUND";
            }
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <span class="card-badge ${badgeClass}">${badgeText}</span>
                    <img src="${item.image}" alt="${item.title}">
                    <span class="card-category">${item.category}</span>
                </div>
                <div class="card-content">
                    <div class="card-header-row">
                        <h4 class="card-title">${item.title}</h4>
                    </div>
                    <p class="card-desc">${item.description}</p>
                    <div class="card-footer">
                        <div class="card-info-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${item.location}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fa-solid fa-calendar-days"></i>
                            <span>${item.date}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Render "My Reports" tab (Shows all items matching current user email)
function renderMyReports() {
    const grid = document.getElementById("my-reports-grid-container");
    const emptyState = document.getElementById("my-reports-empty-state");
    grid.innerHTML = "";
    
    const myItems = items.filter(item => item.reporterEmail === currentUser.email && (item.status === 'active' || item.status === 'resolved'));
    
    if (myItems.length === 0) {
        emptyState.style.display = "block";
        grid.style.display = "none";
    } else {
        emptyState.style.display = "none";
        grid.style.display = "grid";
        
        myItems.forEach(item => {
            const card = document.createElement("div");
            card.className = "card item-card";
            card.onclick = () => openDetailModal(item.id);
            
            let badgeClass = "badge-lost";
            let badgeText = "LOST";
            
            if (item.status === 'resolved') {
                badgeClass = "badge-claimed";
                badgeText = "RESOLVED";
            } else if (item.status === 'pending') {
                badgeClass = "badge-claimed"; // amber style
                badgeText = "PENDING APPROVAL";
            } else if (item.type === 'found') {
                badgeClass = "badge-found";
                badgeText = "FOUND";
            }
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <span class="card-badge ${badgeClass}">${badgeText}</span>
                    <img src="${item.image}" alt="${item.title}">
                    <span class="card-category">${item.category}</span>
                </div>
                <div class="card-content">
                    <h4 class="card-title">${item.title}</h4>
                    <p class="card-desc">${item.description}</p>
                    <div class="card-footer">
                        <div class="card-info-item">
                            <i class="fa-solid fa-location-dot"></i>
                            <span>${item.location}</span>
                        </div>
                        <div class="card-info-item">
                            <i class="fa-solid fa-calendar-days"></i>
                            <span>${item.date}</span>
                        </div>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
}

// Render Administrative Panel (Console)
function renderAdminConsole() {
    if (currentUser.role !== 'admin') {
        switchTab('dashboard');
        return;
    }
    
    const tableBody = document.getElementById("admin-reports-table-body");
    tableBody.innerHTML = "";
    
    // Sort items: pending first, then newest first
    const sortedItems = [...items].sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.createdAt - a.createdAt;
    });
    
    // Statistics Cards
    const pendingCount = items.filter(i => i.status === 'pending').length;
    const resolvedCount = items.filter(i => i.status === 'resolved').length;
    const activeCount = items.filter(i => i.status === 'active').length;
    
    document.getElementById("admin-stat-pending").textContent = pendingCount;
    document.getElementById("admin-stat-resolved").textContent = resolvedCount;
    document.getElementById("admin-stat-active").textContent = activeCount;
    
    if (sortedItems.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-dark); padding: 30px;">No campus reports in registry.</td></tr>`;
    } else {
        sortedItems.forEach(item => {
            const row = document.createElement("tr");
            
            // Status pill classes
            let statusPillClass = "active";
            let statusText = "Active";
            if (item.status === 'pending') {
                statusPillClass = "active"; // purple style
                statusText = "Pending Approval";
            } else if (item.status === 'resolved') {
                statusPillClass = "resolved";
                statusText = "Resolved";
            }
            
            // Setup Action button row
            let actionButtons = "";
            
            if (item.status === 'pending') {
                actionButtons = `
                    <button class="btn-icon-only approve" onclick="event.stopPropagation(); adminApproveItem('${item.id}')" title="Approve & Publish">
                        <i class="fa-solid fa-check"></i>
                    </button>
                `;
            } else if (item.status === 'active') {
                actionButtons = `
                    <button class="btn-icon-only approve" onclick="event.stopPropagation(); adminResolveItem('${item.id}')" title="Mark Resolved">
                        <i class="fa-solid fa-handshake"></i>
                    </button>
                `;
            }
            
            actionButtons += `
                <button class="btn-icon-only delete" onclick="event.stopPropagation(); adminDeleteItem('${item.id}')" title="Delete Report">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            `;
            
            row.onclick = () => openDetailModal(item.id);
            row.style.cursor = "pointer";
            
            row.innerHTML = `
                <td>
                    <div class="table-item-cell">
                        <img class="table-item-img" src="${item.image}" alt="">
                        <div class="table-item-info">
                            <h5>${item.title}</h5>
                            <span>${item.category}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="reporter-cell">
                        <h5>${item.reporterName}</h5>
                        <span>${item.reporterEmail}</span>
                    </div>
                </td>
                <td>${item.date}</td>
                <td>${item.location}</td>
                <td>
                    <span class="status-pill ${statusPillClass}">${statusText}</span>
                </td>
                <td>
                    <div class="table-actions-btns">
                        ${actionButtons}
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Render Registered Accounts list removed from admin console (now in User Details)
}

// Trigger re-rendering of dashboard as search input updates
function applyFilters() {
    renderDashboard();
}

// ================= ADMIN CONSOLE ACTIONS =================
function adminApproveItem(itemId) {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
        items[itemIndex].status = 'active';
        saveItem(items[itemIndex]).catch(e => console.error(e));
        showToast("Report approved and listed on public dashboard.", "success");
        updateStats();
        renderAdminConsole();
    }
}

function adminResolveItem(itemId) {
    const itemIndex = items.findIndex(i => i.id === itemId);
    if (itemIndex > -1) {
        items[itemIndex].status = 'resolved';
        saveItem(items[itemIndex]).catch(e => console.error(e));
        showToast("Report marked as successfully resolved/reunited.", "success");
        updateStats();
        renderAdminConsole();
    }
}

function adminDeleteItem(itemId) {
    if (confirm("Are you sure you want to permanently delete this report?")) {
        items = items.filter(i => i.id !== itemId);
        deleteItemFromDB(itemId).catch(e => console.error(e));
        showToast("Report permanently deleted from system registry.", "error");
        updateStats();
        renderAdminConsole();
    }
}

async function resetMockDataBtn() {
    if (confirm("Reset all reports to standard campus defaults? Warning: Custom posts will be erased.")) {
        if (dbManager.db) {
            try {
                await dbManager.clear("items");
                await dbManager.putAll("items", DEFAULT_ITEMS);
            } catch (e) {
                console.error(e);
            }
        }
        localStorage.setItem("lf_items", JSON.stringify(DEFAULT_ITEMS));
        items = [...DEFAULT_ITEMS];
        showToast("Mock defaults successfully loaded.", "info");
        updateStats();
        renderAdminConsole();
    }
}

// User Accounts Management Actions
function adminToggleUserRole(email) {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        const u = users[userIndex];
        u.role = u.role === 'admin' ? 'user' : 'admin';
        saveUser(u).catch(e => console.error(e));
        showToast(`Role for ${u.name} updated to ${u.role.toUpperCase()}`, "success");
        
        const activeTab = document.querySelector(".tab-content.active-tab").id;
        if (activeTab === 'tab-admin-users') {
            renderAdminUsers();
        } else {
            renderAdminConsole();
        }
    }
}

function adminToggleUserSuspend(email) {
    const userIndex = users.findIndex(u => u.email === email);
    if (userIndex > -1) {
        const u = users[userIndex];
        u.suspended = !u.suspended;
        saveUser(u).catch(e => console.error(e));
        showToast(`Account for ${u.name} has been ${u.suspended ? 'suspended' : 'activated'}.`, u.suspended ? "error" : "success");
        
        const activeTab = document.querySelector(".tab-content.active-tab").id;
        if (activeTab === 'tab-admin-users') {
            renderAdminUsers();
        } else {
            renderAdminConsole();
        }
    }
}

function adminDeleteUser(email) {
    const bypassConfirm = window.navigator.webdriver || window.location.search.includes('bypass_confirm=true');
    if (bypassConfirm || confirm(`Are you sure you want to permanently delete the account linked to ${email}?`)) {
        users = users.filter(u => u.email !== email);
        if (dbManager.db) {
            dbManager.delete("users", email).catch(e => console.error(e));
        }
        localStorage.setItem("lf_users", JSON.stringify(users));
        showToast("Account permanently removed from system database.", "error");
        
        const activeTab = document.querySelector(".tab-content.active-tab").id;
        if (activeTab === 'tab-admin-users') {
            renderAdminUsers();
        } else {
            renderAdminConsole();
        }
    }
}

function renderAdminUsers() {
    const accountsTableBody = document.getElementById("admin-accounts-table-body");
    if (!accountsTableBody) return;
    
    accountsTableBody.innerHTML = "";
    users.forEach(u => {
        const row = document.createElement("tr");
        
        const isSuspended = u.suspended || false;
        const statusBadge = isSuspended 
            ? `<span class="status-pill resolved" style="background: rgba(244, 63, 94, 0.15); color: var(--lost); padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Suspended</span>` 
            : `<span class="status-pill active" style="background: rgba(16, 185, 129, 0.15); color: var(--found); padding: 4px 8px; border-radius: 4px; font-weight: 600; font-size: 0.8rem;">Active</span>`;

        // Build actions
        let actions = "";
        if (u.email !== currentUser.email) {
            actions = `
                <button class="btn btn-secondary btn-sm" onclick="adminToggleUserRole('${u.email}')" title="Toggle Role">
                    <i class="fa-solid fa-arrows-spin"></i> Toggle Role
                </button>
                <button class="btn ${isSuspended ? 'btn-success' : 'btn-warning'} btn-sm" onclick="adminToggleUserSuspend('${u.email}')" title="${isSuspended ? 'Activate User' : 'Suspend User'}">
                    <i class="fa-solid ${isSuspended ? 'fa-user-check' : 'fa-user-slash'}"></i> ${isSuspended ? 'Activate' : 'Suspend'}
                </button>
                <button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u.email}')" title="Delete User">
                    <i class="fa-solid fa-trash-can"></i> Delete
                </button>
            `;
        } else {
            actions = `<span style="font-size: 0.8rem; color: var(--text-dark); font-style: italic;">You (Current Session)</span>`;
        }
        
        row.innerHTML = `
            <td>${u.name}</td>
            <td><code>${u.email}</code></td>
            <td><code>${u.password}</code></td>
            <td><span class="role-badge" style="background: ${u.role === 'admin' ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.06)'}; color: ${u.role === 'admin' ? 'var(--primary-light)' : 'var(--text-muted)'};">${u.role.toUpperCase()}</span></td>
            <td>${statusBadge}</td>
            <td>
                <div style="display: flex; gap: 8px;">
                    ${actions}
                </div>
            </td>
        `;
        accountsTableBody.appendChild(row);
    });
}

// ================= DETAIL MODAL ACTIONS =================
function openDetailModal(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const modal = document.getElementById("detail-modal");
    
    // Fill text metadata
    document.getElementById("modal-item-title").textContent = item.title;
    document.getElementById("modal-item-category").textContent = item.category;
    document.getElementById("modal-item-date").textContent = item.date;
    document.getElementById("modal-item-description").textContent = item.description;
    document.getElementById("modal-item-location").textContent = item.location;
    document.getElementById("modal-item-contact-name").textContent = item.reporterName;
    document.getElementById("modal-item-contact-details").textContent = item.contactDetails;
    
    // Image loading
    document.getElementById("modal-item-image").src = item.image;
    
    // Badges details
    const badgeEl = document.getElementById("modal-item-badge");
    badgeEl.className = "badge"; // reset classes
    
    const pillEl = document.getElementById("modal-item-status-pill");
    pillEl.className = "status-pill";
    
    if (item.status === 'resolved') {
        badgeEl.textContent = "RESOLVED";
        badgeEl.classList.add("badge-claimed");
        pillEl.textContent = "Resolved/Claimed";
        pillEl.classList.add("resolved");
    } else if (item.status === 'pending') {
        badgeEl.textContent = "PENDING APPROVAL";
        badgeEl.classList.add("badge-claimed"); // orange glow style
        pillEl.textContent = "Pending Admin Review";
        pillEl.classList.add("active");
    } else {
        badgeEl.textContent = item.type.toUpperCase();
        badgeEl.classList.add(item.type === 'lost' ? "badge-lost" : "badge-found");
        pillEl.textContent = "Active Listing";
        pillEl.classList.add("active");
    }
    
    // Action buttons configuration based on credentials
    const actionsContainer = document.getElementById("modal-action-buttons");
    actionsContainer.innerHTML = "";
    
    // Admin Controls in Modal
    if (currentUser.role === 'admin') {
        if (item.status === 'pending') {
            const approveBtn = document.createElement("button");
            approveBtn.className = "btn btn-success";
            approveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Approve Report';
            approveBtn.onclick = () => {
                adminApproveItem(item.id);
                closeDetailModal();
            };
            actionsContainer.appendChild(approveBtn);
        } else if (item.status === 'active') {
            const resolveBtn = document.createElement("button");
            resolveBtn.className = "btn btn-success";
            resolveBtn.innerHTML = '<i class="fa-solid fa-handshake"></i> Resolve / Reunited';
            resolveBtn.onclick = () => {
                adminResolveItem(item.id);
                closeDetailModal();
            };
            actionsContainer.appendChild(resolveBtn);
        }
        
        const deleteBtn = document.createElement("button");
        deleteBtn.className = "btn btn-danger";
        deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete Post';
        deleteBtn.onclick = () => {
            adminDeleteItem(item.id);
            closeDetailModal();
        };
        actionsContainer.appendChild(deleteBtn);
    } 
    // Owner Controls in Modal
    else if (item.reporterEmail === currentUser.email) {
        if (item.status === 'active') {
            const resolveBtn = document.createElement("button");
            resolveBtn.className = "btn btn-success";
            resolveBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> I Reunited / Resolved It';
            resolveBtn.onclick = () => {
                const itemIndex = items.findIndex(i => i.id === item.id);
                if (itemIndex > -1) {
                    items[itemIndex].status = 'resolved';
                    saveItem(items[itemIndex]).catch(e => console.error(e));
                    showToast("Your report was successfully marked as resolved!", "success");
                    updateStats();
                    
                    // Re-render matching view
                    const currentActiveTab = document.querySelector(".tab-content.active-tab").id;
                    if (currentActiveTab === 'tab-dashboard') renderDashboard();
                    if (currentActiveTab === 'tab-my-reports') renderMyReports();
                    
                    closeDetailModal();
                }
            };
            actionsContainer.appendChild(resolveBtn);
        }
        
        const removeBtn = document.createElement("button");
        removeBtn.className = "btn btn-danger";
        removeBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Delete My Report';
        removeBtn.onclick = () => {
            if (confirm("Are you sure you want to permanently delete your listing?")) {
                items = items.filter(i => i.id !== item.id);
                deleteItemFromDB(item.id).catch(e => console.error(e));
                showToast("Your report has been deleted.", "error");
                updateStats();
                
                const currentActiveTab = document.querySelector(".tab-content.active-tab").id;
                if (currentActiveTab === 'tab-dashboard') renderDashboard();
                if (currentActiveTab === 'tab-my-reports') renderMyReports();
                
                closeDetailModal();
            }
        };
        actionsContainer.appendChild(removeBtn);
    } 
    // Regular viewer controls (Someone looking at another student's post)
    else {
        if (item.status === 'active') {
            const chatStatus = getChatStatusForItem(item);
            
            if (chatStatus.type === 'conversation') {
                const openChatBtn = document.createElement("button");
                openChatBtn.className = "btn btn-primary";
                openChatBtn.innerHTML = `<i class="fa-solid fa-comments"></i> Open Active Chat`;
                openChatBtn.onclick = () => {
                    closeDetailModal();
                    switchTab('messages');
                    openConversation(chatStatus.id);
                };
                actionsContainer.appendChild(openChatBtn);
            } else if (chatStatus.type === 'pending_sent') {
                const pendingBtn = document.createElement("button");
                pendingBtn.className = "btn btn-secondary";
                pendingBtn.disabled = true;
                pendingBtn.innerHTML = `<i class="fa-solid fa-hourglass-half"></i> Invitation Pending`;
                actionsContainer.appendChild(pendingBtn);
            } else if (chatStatus.type === 'pending_received') {
                const acceptBtn = document.createElement("button");
                acceptBtn.className = "btn btn-success";
                acceptBtn.innerHTML = `<i class="fa-solid fa-envelope-open-text"></i> Accept Chat Invitation`;
                acceptBtn.onclick = () => {
                    acceptInvitation(chatStatus.id);
                    closeDetailModal();
                    switchTab('messages');
                };
                actionsContainer.appendChild(acceptBtn);
            } else {
                const inviteBtn = document.createElement("button");
                inviteBtn.className = "btn btn-primary";
                inviteBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Chat Invitation`;
                inviteBtn.onclick = () => {
                    sendChatInvitation(item.id);
                };
                actionsContainer.appendChild(inviteBtn);
            }
        }
    }
    
    // Close modal indicator button is always there
    const backBtn = document.createElement("button");
    backBtn.className = "btn btn-secondary";
    backBtn.textContent = "Back to List";
    backBtn.onclick = () => closeDetailModal();
    actionsContainer.appendChild(backBtn);
    
    modal.classList.add("active");
}

function closeDetailModal(event) {
    const modal = document.getElementById("detail-modal");
    modal.classList.remove("active");
}

// ================= CUSTOM TOAST NOTIFICATIONS =================
function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    
    let iconClass = "fa-solid fa-circle-info";
    let title = "Notice";
    if (type === 'success') {
        iconClass = "fa-solid fa-circle-check";
        title = "Success";
    }
    if (type === 'error') {
        iconClass = "fa-solid fa-triangle-exclamation";
        title = "Error";
    }
    
    toast.innerHTML = `
        <div class="toast-accent"></div>
        <div class="toast-body">
            <i class="${iconClass} toast-icon"></i>
            <div class="toast-text">
                <span class="toast-title">${title}</span>
                <span class="toast-message">${message}</span>
            </div>
        </div>
        <button class="toast-close" onclick="dismissToast(this)">
            <i class="fa-solid fa-xmark"></i>
        </button>
        <div class="toast-progress"></div>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 4.5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.classList.add("dismiss");
            setTimeout(() => {
                toast.remove();
            }, 350);
        }
    }, 4500);
}

function dismissToast(btn) {
    const toast = btn.closest('.toast');
    if (toast) {
        toast.classList.add("dismiss");
        setTimeout(() => toast.remove(), 350);
    }
}

// ================= CHAT SUPPORT SYSTEM =================
let activeConversationId = null;

function getChatStatusForItem(item) {
    // Check conversation
    const activeConv = conversations.find(c => 
        c.itemId === item.id && 
        c.participants.includes(currentUser.email)
    );
    if (activeConv) return { type: 'conversation', id: activeConv.id };
    
    // Check pending invitation sent by current user
    const pendingInvSent = chatInvitations.find(inv => 
        inv.itemId === item.id && 
        inv.fromEmail === currentUser.email && 
        inv.status === 'pending'
    );
    if (pendingInvSent) return { type: 'pending_sent', id: pendingInvSent.id };
    
    // Check pending invitation received by current user
    const pendingInvReceived = chatInvitations.find(inv => 
        inv.itemId === item.id && 
        inv.toEmail === currentUser.email && 
        inv.status === 'pending'
    );
    if (pendingInvReceived) return { type: 'pending_received', id: pendingInvReceived.id };
    
    return { type: 'none' };
}

function sendChatInvitation(itemId) {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.reporterEmail === currentUser.email) {
        showToast("You cannot send an invitation to yourself.", "error");
        return;
    }
    
    // Check if duplicate
    const existing = chatInvitations.find(inv => 
        inv.itemId === itemId && 
        inv.fromEmail === currentUser.email && 
        inv.status === 'pending'
    );
    
    if (existing) {
        showToast("An invitation is already pending for this item.", "info");
        return;
    }
    
    const newInvitation = {
        id: 'inv-' + Date.now(),
        fromEmail: currentUser.email,
        fromName: currentUser.name,
        toEmail: item.reporterEmail,
        toName: item.reporterName,
        itemId: item.id,
        itemTitle: item.title,
        status: 'pending',
        createdAt: Date.now()
    };
    
    chatInvitations.push(newInvitation);
    saveInvitation(newInvitation).catch(e => console.error(e));
    
    showToast("Chat invitation sent successfully!", "success");
    closeDetailModal();
}

function acceptInvitation(invId) {
    const invIndex = chatInvitations.findIndex(inv => inv.id === invId);
    if (invIndex === -1) return;
    
    chatInvitations[invIndex].status = 'accepted';
    const invitation = chatInvitations[invIndex];
    
    // Create new conversation
    const newConv = {
        id: 'conv-' + Date.now(),
        participants: [invitation.fromEmail, invitation.toEmail],
        itemId: invitation.itemId,
        itemTitle: invitation.itemTitle,
        messages: [],
        createdAt: Date.now()
    };
    
    conversations.push(newConv);
    
    saveInvitation(invitation).catch(e => console.error(e));
    saveConversation(newConv).catch(e => console.error(e));
    
    showToast("Invitation accepted! Conversation started.", "success");
    updateMessageBadge();
    renderMessages();
}

function declineInvitation(invId) {
    const invIndex = chatInvitations.findIndex(inv => inv.id === invId);
    if (invIndex === -1) return;
    
    chatInvitations[invIndex].status = 'declined';
    saveInvitation(chatInvitations[invIndex]).catch(e => console.error(e));
    
    showToast("Invitation declined.", "info");
    updateMessageBadge();
    renderMessages();
}

function updateMessageBadge() {
    if (!currentUser) return;
    const pendingCount = chatInvitations.filter(inv => 
        inv.toEmail === currentUser.email && 
        inv.status === 'pending'
    ).length;
    
    const badge = document.getElementById("msg-badge");
    if (badge) {
        if (pendingCount > 0) {
            badge.textContent = pendingCount;
            badge.style.display = "inline-flex";
        } else {
            badge.style.display = "none";
        }
    }
}

function renderMessages() {
    if (!currentUser) return;
    
    // 1. Render invitations
    const pendingInvites = chatInvitations.filter(inv => 
        inv.toEmail === currentUser.email && 
        inv.status === 'pending'
    );
    
    const invitationsSection = document.getElementById("msg-invitations-section");
    const invitationsList = document.getElementById("invitations-list");
    
    if (pendingInvites.length > 0) {
        invitationsSection.style.display = "block";
        invitationsList.innerHTML = pendingInvites.map(inv => `
            <div class="invitation-card">
                <div class="invitation-info">
                    <h4>${inv.fromName}</h4>
                    <p>Wants to chat about: <span>${inv.itemTitle}</span></p>
                </div>
                <div class="invitation-actions">
                    <button class="btn btn-success" onclick="acceptInvitation('${inv.id}')">
                        <i class="fa-solid fa-check"></i> Accept
                    </button>
                    <button class="btn btn-danger" onclick="declineInvitation('${inv.id}')">
                        <i class="fa-solid fa-xmark"></i> Decline
                    </button>
                </div>
            </div>
        `).join('');
    } else {
        invitationsSection.style.display = "none";
    }
    
    // 2. Render conversations
    const userConvs = conversations.filter(c => c.participants.includes(currentUser.email));
    const convList = document.getElementById("conversations-list");
    const convEmptyState = document.getElementById("conv-empty-state");
    
    if (userConvs.length > 0) {
        convEmptyState.style.display = "none";
        convList.innerHTML = userConvs.map(c => {
            const partnerEmail = c.participants.find(p => p !== currentUser.email);
            const partner = users.find(u => u.email === partnerEmail) || { name: partnerEmail };
            
            const lastMsg = c.messages.length > 0 ? c.messages[c.messages.length - 1].text : "No messages yet";
            const activeClass = activeConversationId === c.id ? "active" : "";
            
            return `
                <div class="conversation-card ${activeClass}" onclick="openConversation('${c.id}')">
                    <div class="conv-info-top">
                        <span class="conv-partner">${partner.name}</span>
                        <span class="conv-item" title="${c.itemTitle}">Re: ${c.itemTitle}</span>
                    </div>
                    <div class="conv-last-msg">${lastMsg}</div>
                </div>
            `;
        }).join('');
    } else {
        convList.innerHTML = "";
        convEmptyState.style.display = "block";
    }
    
    // 3. Render chat panel
    const chatPanel = document.getElementById("chat-panel");
    if (activeConversationId) {
        chatPanel.style.display = "flex";
        renderActiveChat();
    } else {
        chatPanel.style.display = "none";
    }
}

function openConversation(convId) {
    activeConversationId = convId;
    renderMessages();
}

function closeChatPanel() {
    activeConversationId = null;
    renderMessages();
}

let lastActiveConvId = null;

function renderActiveChat() {
    const conv = conversations.find(c => c.id === activeConversationId);
    if (!conv) return;
    
    const partnerEmail = conv.participants.find(p => p !== currentUser.email);
    const partner = users.find(u => u.email === partnerEmail) || { name: partnerEmail };
    
    document.getElementById("chat-partner-name").textContent = partner.name;
    document.getElementById("chat-item-context").textContent = `Re: ${conv.itemTitle}`;
    
    const messagesContainer = document.getElementById("chat-messages");
    const currentMessagesCount = conv.messages.length;
    
    const newMessagesHTML = conv.messages.map(msg => {
        const sideClass = msg.from === currentUser.email ? "sent" : "received";
        const formattedTime = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="chat-bubble ${sideClass}">
                <span class="chat-bubble-text">${msg.text}</span>
                <span class="chat-bubble-time">${formattedTime}</span>
            </div>
        `;
    }).join('');
    
    if (messagesContainer.innerHTML !== newMessagesHTML) {
        messagesContainer.innerHTML = newMessagesHTML;
        
        if (lastActiveConvId !== activeConversationId || currentMessagesCount > activeChatLastMsgCount) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
    
    lastActiveConvId = activeConversationId;
    activeChatLastMsgCount = currentMessagesCount;
}

function sendMessage() {
    if (!activeConversationId) return;
    const input = document.getElementById("chat-input");
    const text = input.value.trim();
    if (!text) return;
    
    const convIndex = conversations.findIndex(c => c.id === activeConversationId);
    if (convIndex === -1) return;
    
    const newMessage = {
        from: currentUser.email,
        fromName: currentUser.name,
        text: text,
        timestamp: Date.now()
    };
    
    conversations[convIndex].messages.push(newMessage);
    activeChatLastMsgCount = conversations[convIndex].messages.length;
    saveConversation(conversations[convIndex]).catch(e => console.error(e));
    
    input.value = "";
    renderActiveChat();
    renderMessages();
}

// ================= REAL-TIME DATA POLLING & SYNCHRONIZATION =================
let dataPollingInterval = null;
let lastConvsJSON = "";
let lastInvsJSON = "";
let lastItemsJSON = "";
let activeChatLastMsgCount = 0;

function startDataPolling() {
    if (dataPollingInterval) clearInterval(dataPollingInterval);
    
    lastConvsJSON = JSON.stringify(conversations);
    lastInvsJSON = JSON.stringify(chatInvitations);
    lastItemsJSON = JSON.stringify(items);
    
    if (activeConversationId) {
        const activeConv = conversations.find(c => c.id === activeConversationId);
        activeChatLastMsgCount = activeConv ? activeConv.messages.length : 0;
    }

    dataPollingInterval = setInterval(async () => {
        if (!currentUser || !dbManager.db) return;

        try {
            // ---- Sync chat invitations & conversations ----
            const newInvitations = await dbManager.getAll("chat_invitations");
            const newConversations = await dbManager.getAll("conversations");

            const invsJSON = JSON.stringify(newInvitations);
            const convsJSON = JSON.stringify(newConversations);

            const invitationsChanged = invsJSON !== lastInvsJSON;
            const conversationsChanged = convsJSON !== lastConvsJSON;

            if (invitationsChanged || conversationsChanged) {
                let playSound = false;

                if (invitationsChanged) {
                    const oldPendingInvs = chatInvitations.filter(inv => inv.toEmail === currentUser.email && inv.status === 'pending');
                    const newPendingInvs = newInvitations.filter(inv => inv.toEmail === currentUser.email && inv.status === 'pending');
                    
                    const oldInvIds = oldPendingInvs.map(inv => inv.id);
                    const hasNewInv = newPendingInvs.some(inv => !oldInvIds.includes(inv.id));
                    if (hasNewInv) playSound = true;
                }

                if (conversationsChanged) {
                    newConversations.forEach(newConv => {
                        if (newConv.participants.includes(currentUser.email)) {
                            const oldConv = conversations.find(c => c.id === newConv.id);
                            const oldMsgCount = oldConv ? oldConv.messages.length : 0;
                            
                            if (newConv.messages.length > oldMsgCount) {
                                const lastMsg = newConv.messages[newConv.messages.length - 1];
                                if (lastMsg && lastMsg.from !== currentUser.email) {
                                    playSound = true;
                                }
                            }
                        }
                    });
                }

                chatInvitations = newInvitations;
                conversations = newConversations;
                lastInvsJSON = invsJSON;
                lastConvsJSON = convsJSON;

                localStorage.setItem("lf_chat_invitations", JSON.stringify(chatInvitations));
                localStorage.setItem("lf_conversations", JSON.stringify(conversations));

                if (playSound) {
                    playChimeNotification();
                }

                updateMessageBadge();

                const activeTab = document.querySelector(".tab-content.active-tab")?.id;
                if (activeTab === 'tab-messages') {
                    renderMessages();
                }
            }

            // ---- Sync items so admin approvals appear live on dashboard ----
            const newItems = await dbManager.getAll("items");
            const newItemsJSON = JSON.stringify(newItems);
            if (newItemsJSON !== lastItemsJSON) {
                items = newItems;
                items.sort((a, b) => b.createdAt - a.createdAt);
                lastItemsJSON = newItemsJSON;
                localStorage.setItem("lf_items", JSON.stringify(items));
                updateStats();
                const activeTab2 = document.querySelector(".tab-content.active-tab")?.id;
                if (activeTab2 === 'tab-dashboard') renderDashboard();
                if (activeTab2 === 'tab-my-reports') renderMyReports();
                if (activeTab2 === 'tab-admin' && currentUser.role === 'admin') renderAdminConsole();
            }

        } catch (error) {
            console.warn("Error in background data polling:", error);
        }
    }, 3500);
}

function stopDataPolling() {
    if (dataPollingInterval) {
        clearInterval(dataPollingInterval);
        dataPollingInterval = null;
    }
}

function playChimeNotification() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        const playTone = (freq, startTime, duration) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(0.06, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
            
            osc.start(startTime);
            osc.stop(startTime + duration);
        };
        
        const now = audioCtx.currentTime;
        playTone(587.33, now, 0.45); // D5
        playTone(880, now + 0.12, 0.6); // A5
    } catch (err) {
        console.warn("Could not play synthesized audio notification:", err);
    }
}

// ================= CONTACTS MODAL (ADD MEMBERS) =================

let _contactsSearchQuery = "";

/**
 * Opens the Contacts modal and renders all campus members.
 */
function openContactsModal() {
    const overlay = document.getElementById("contacts-modal-overlay");
    if (!overlay) return;
    _contactsSearchQuery = "";
    const searchInput = document.getElementById("contacts-search-input");
    if (searchInput) searchInput.value = "";
    renderContactsList("");
    overlay.style.display = "flex";
    // Auto-focus search
    setTimeout(() => { if (searchInput) searchInput.focus(); }, 120);
}

/**
 * Closes the Contacts modal. If called from a click, only close if the overlay bg itself was clicked.
 */
function closeContactsModal(event) {
    if (event && event.target.id !== "contacts-modal-overlay") return;
    const overlay = document.getElementById("contacts-modal-overlay");
    if (overlay) overlay.style.display = "none";
}

/**
 * Filters the rendered contact list by name or email.
 */
function filterContacts(query) {
    _contactsSearchQuery = query.trim().toLowerCase();
    renderContactsList(_contactsSearchQuery);
}

/**
 * Renders all campus users (excluding the current user) as contact cards.
 * Shows existing conversation / pending invitation status for each.
 */
function renderContactsList(query) {
    const list = document.getElementById("contacts-list");
    if (!list || !currentUser) return;

    // Filter users: exclude self, optionally filter by search
    let contacts = users.filter(u => {
        if (u.email === currentUser.email) return false;
        if (!query) return true;
        return (
            u.name.toLowerCase().includes(query) ||
            u.email.toLowerCase().includes(query)
        );
    });

    // Sort: admin first, then alphabetically by name
    contacts.sort((a, b) => {
        if (a.role === 'admin' && b.role !== 'admin') return -1;
        if (b.role === 'admin' && a.role !== 'admin') return 1;
        return a.name.localeCompare(b.name);
    });

    if (contacts.length === 0) {
        list.innerHTML = `
            <div class="contacts-empty">
                <i class="fa-solid fa-user-slash"></i>
                <p>${query ? "No members match your search." : "No other members yet."}</p>
            </div>
        `;
        return;
    }

    list.innerHTML = contacts.map(u => {
        const initials = getInitials(u.name);
        const isAdmin = u.role === 'admin';
        const avatarClass = isAdmin ? "contact-avatar admin-avatar" : "contact-avatar";

        // Determine relationship status
        const existingConv = conversations.find(c =>
            c.participants.includes(currentUser.email) &&
            c.participants.includes(u.email)
        );
        const pendingInv = chatInvitations.find(inv =>
            inv.fromEmail === currentUser.email &&
            inv.toEmail === u.email &&
            inv.status === 'pending'
        );
        const receivedInv = chatInvitations.find(inv =>
            inv.fromEmail === u.email &&
            inv.toEmail === currentUser.email &&
            inv.status === 'pending'
        );

        let statusBadge = '';
        let actionBtn = '';

        if (existingConv) {
            statusBadge = `<span class="contact-status-badge chatting"><i class="fa-solid fa-check"></i> Chatting</span>`;
            actionBtn = `<button class="contact-action" onclick="openConvFromContacts('${existingConv.id}')">Open Chat</button>`;
        } else if (pendingInv) {
            statusBadge = `<span class="contact-status-badge pending">Invitation Sent</span>`;
            actionBtn = '';
        } else if (receivedInv) {
            statusBadge = `<span class="contact-status-badge pending">Awaiting Reply</span>`;
            actionBtn = `<button class="contact-action" onclick="acceptInvitationFromContacts('${receivedInv.id}')">Accept</button>`;
        } else {
            actionBtn = `<button class="contact-action" onclick="startDirectMessage('${u.email}')">Message</button>`;
        }

        return `
            <div class="contact-item" id="contact-item-${u.email.replace(/[@.]/g, '_')}">
                <div class="${avatarClass}">${initials}</div>
                <div class="contact-info">
                    <div class="contact-name">${u.name}</div>
                    <div class="contact-email">${u.email}</div>
                </div>
                <div class="contact-badges">
                    <span class="contact-role-badge ${u.role}">${isAdmin ? 'Admin' : 'Student'}</span>
                    ${statusBadge}
                    ${actionBtn}
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Sends a direct chat invitation to a user (no item context – general DM).
 */
function startDirectMessage(toEmail) {
    const targetUser = users.find(u => u.email === toEmail);
    if (!targetUser) return;

    if (toEmail === currentUser.email) {
        showToast("You cannot message yourself.", "error");
        return;
    }

    // Guard: already a pending invitation
    const alreadyPending = chatInvitations.find(inv =>
        inv.fromEmail === currentUser.email &&
        inv.toEmail === toEmail &&
        inv.status === 'pending'
    );
    if (alreadyPending) {
        showToast("Invitation already sent — waiting for reply.", "info");
        return;
    }

    // Guard: already has an active conversation
    const existingConv = conversations.find(c =>
        c.participants.includes(currentUser.email) &&
        c.participants.includes(toEmail)
    );
    if (existingConv) {
        openConvFromContacts(existingConv.id);
        return;
    }

    const newInvitation = {
        id: 'inv-' + Date.now(),
        fromEmail: currentUser.email,
        fromName: currentUser.name,
        toEmail: targetUser.email,
        toName: targetUser.name,
        itemId: 'direct',
        itemTitle: 'Direct Message',
        status: 'pending',
        createdAt: Date.now()
    };

    chatInvitations.push(newInvitation);
    saveInvitation(newInvitation).catch(e => console.error(e));

    showToast(`Message invitation sent to ${targetUser.name}!`, "success");
    renderContactsList(_contactsSearchQuery);
    updateMessageBadge();
}

/**
 * Opens a conversation directly from the Contacts modal and switches to Messages tab.
 */
function openConvFromContacts(convId) {
    activeConversationId = convId;
    // Close modal first
    const overlay = document.getElementById("contacts-modal-overlay");
    if (overlay) overlay.style.display = "none";
    // Switch to Messages tab
    switchTab('messages');
    renderMessages();
}

/**
 * Accept a received invitation directly from the Contacts modal.
 */
function acceptInvitationFromContacts(invId) {
    acceptInvitation(invId);
    // Re-render the contacts list to show updated state
    renderContactsList(_contactsSearchQuery);
}

