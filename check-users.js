const turso = require('./turso');

async function checkUsers() {
    try {
        const result = await turso.execute('SELECT * FROM users');
        console.log("----- USERS IN DATABASE -----");
        result.rows.forEach(user => {
            console.log(`- ${user.name} (${user.email}) | Role: ${user.role}`);
        });
    } catch (e) {
        console.error("Error fetching users:", e);
    }
}

checkUsers();
