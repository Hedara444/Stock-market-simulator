// src/data-access/adminRepository.js
const db = require('../helpers/dbHelper');
const IAdminRepository = require('../interfaces/IAdminRepository');

class AdminRepository extends IAdminRepository {
    async findAdminByUsername(username) {
        const sql = 'SELECT id, username FROM admins WHERE username = $1';
        const result = await db.query(sql, [username]);
        return result.rows[0];
    }

    async createAdmin(username) {
        const sql = 'INSERT INTO admins (username) VALUES ($1) RETURNING id, username';
        const result = await db.query(sql, [username]);
        return result.rows[0];
    }
}

module.exports = new AdminRepository();