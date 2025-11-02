import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.NODE_ENV === "test" ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL

// Configure postgres with connection options
const sql = postgres(connectionString, {
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30
})

// Verify database connection on startup (only in non-test environment)
if (process.env.NODE_ENV !== 'test') {
    setTimeout(async () => {
        try {
            await sql`SELECT 1`;
            console.log('Connected to the database successfully!');
        } catch (error) {
            console.log('⚠️  Database connection will be established on first query');
        }
    }, 100);
}

const createUser = async (name, email, password) => {
    try {
        const res = await sql`
        INSERT INTO users (name, email, password_hash)
        VALUES (${name}, ${email}, ${password})
        RETURNING id, name, email
    `;
        if (!res) {
            return "error";
        }
    } catch (error) {
        // Only log non-duplicate key errors in test environment
        if (process.env.NODE_ENV !== 'test' || error.code !== '23505') {
            console.error("Error creating user:", error);
        }
        return "error";
    }
    return "success";
}


const getUserCredentials = async (email) => {
    try {
        const user = await sql`
        SELECT *
        FROM users
        WHERE email = ${email} LIMIT 1
    `;
        if (user && user.length > 0) return user[0];
        return null;
    }
    catch (error) {
        console.error("Error fetching user credentials:", error);
        return null;
    }
}

const getUserById = async (userId) => {
    try {
        const user = await sql`
        SELECT id, name, email
        FROM users
        WHERE id = ${userId} LIMIT 1
    `;
        if (user && user.length > 0) return user[0];
        return null;
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        return null;
    }
};

const updateUserProfile = async (userId, name, email) => {
    try {
        const user = await sql`
        UPDATE users
        SET name = ${name}, email = ${email}
        WHERE id = ${userId}
        RETURNING id, name, email
    `;
        if (user && user.length > 0) return user[0];
        return null;
    } catch (error) {
        // Only log non-duplicate key errors in test environment
        if (process.env.NODE_ENV !== 'test' || error.code !== '23505') {
            console.error("Error updating user profile:", error);
        }
        return null;
    }
};

const updateUserPassword = async (userId, newPasswordHash) => {
    try {
        const result = await sql`
        UPDATE users
        SET password_hash = ${newPasswordHash}
        WHERE id = ${userId}
        RETURNING id
    `;
        if (result && result.length > 0) return true;
        return false;
    } catch (error) {
        console.error("Error updating password:", error);
        return false;
    }
};

const deleteUser = async (userId) => {
    try {
        // First delete all notes belonging to the user
        await sql`
        DELETE FROM notes
        WHERE user_id = ${userId}
    `;

        // Then delete the user
        const result = await sql`
        DELETE FROM users
        WHERE id = ${userId}
        RETURNING id
    `;
        if (result && result.length > 0) return true;
        return false;
    } catch (error) {
        console.error("Error deleting user:", error);
        return false;
    }
};

export const queries = {
    getUserCredentials,
    createUser,
    getUserById,
    updateUserProfile,
    updateUserPassword,
    deleteUser
};