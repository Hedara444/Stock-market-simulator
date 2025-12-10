// src/interfaces/IStockRepository.js
class IStockRepository {
    async getAllStocksWithControls() {
        throw new Error('IStockRepository.getAllStocksWithControls not implemented');
    }

    async bulkInsertStockValues(stockDataList) {
        throw new Error('IStockRepository.bulkInsertStockValues not implemented');
    }

    async createStock(ticker, name, initialPrice, controls) {
        throw new Error('IStockRepository.createStock not implemented');
    }

    async getStocksList() {
        throw new Error('IStockRepository.getStocksList not implemented');
    }

    async getStockById(id) {
        throw new Error('IStockRepository.getStockById not implemented');
    }

    async updateStockControls(id, controls) {
        throw new Error('IStockRepository.updateStockControls not implemented');
    }

    async toggleStockActiveStatus(id, isActive) {
        throw new Error('IStockRepository.toggleStockActiveStatus not implemented');
    }
}

module.exports = IStockRepository;