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
        login_url: window.location.origin || "http://127.0.0.1:8081",
        reply_to: "no-reply@campuslf.edu"
    };

    if (!isConfigured) {
        console.log("%c[Mock Email Sent]", "color: #a855f7; font-weight: bold; font-size: 1.2em;");
        console.log(`To: ${user.name} <${user.email}>`);
        console.log("Subject: Welcome to Campus Lost & Found!");
        console.log("Body: Hi " + user.name + ",\nWelcome to Campus Lost & Found! Your account has been registered successfully. You can now report lost or found items and connect with other members.");
        console.log("Configure EmailJS in email.js with your credentials to send live emails.");
        
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
