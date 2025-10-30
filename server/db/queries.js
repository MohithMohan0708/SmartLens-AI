import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL
const sql = postgres(connectionString)

async function verifyConnection() {
    try {
        const result = await sql`SELECT 1`
        console.log('Connected to the database successfully!')
    } catch (error) {
        console.error('Connection failed:', error)
    }
}

verifyConnection()

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
        console.error("Error creating user:", error);
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
        if (user) return user[0];
    }
    catch (error) {
        console.error("Error fetching user credentials:", error);
        return null;
    }
    return null;
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

export const queries = { getUserCredentials, createUser, getUserById };