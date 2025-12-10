// src/interfaces/IAdminRepository.js
class IAdminRepository {
    async findAdminByUsername(username) {
        throw new Error('IAdminRepository.findAdminByUsername not implemented');
    }

    async createAdmin(username) {
        throw new Error('IAdminRepository.createAdmin not implemented');
    }
}

module.exports = IAdminRepository;