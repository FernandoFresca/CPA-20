/**
 * StorageManager - Gerencia o armazenamento local (localStorage)
 * Responsável por salvar e recuperar dados do simulado
 */

const StorageManager = {
    // Chaves para armazenamento
    KEYS: {
        USER_DATA: 'cpa10_userData',
        QUIZ_STATE: 'cpa10_quizState',
        QUIZ_RESULTS: 'cpa10_quizResults',
        RANKING_DATA: 'cpa10_rankingData'
    },

    /**
     * Salva dados no localStorage
     * @param {string} key - Chave para armazenamento
     * @param {any} data - Dados a serem armazenados
     */
    save: function(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Erro ao salvar dados:', error);
            return false;
        }
    },

    /**
     * Recupera dados do localStorage
     * @param {string} key - Chave para recuperação
     * @param {any} defaultValue - Valor padrão caso não exista dados
     * @returns {any} - Dados recuperados ou valor padrão
     */
    get: function(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Erro ao recuperar dados:', error);
            return defaultValue;
        }
    },

    /**
     * Remove dados do localStorage
     * @param {string} key - Chave para remoção
     */
    remove: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Erro ao remover dados:', error);
            return false;
        }
    },

    /**
     * Salva dados do usuário
     * @param {Object} userData - Dados do usuário
     */
    saveUserData: function(userData) {
        return this.save(this.KEYS.USER_DATA, userData);
    },

    /**
     * Recupera dados do usuário
     * @returns {Object} - Dados do usuário
     */
    getUserData: function() {
        return this.get(this.KEYS.USER_DATA, {});
    },

    /**
     * Salva estado atual do simulado
     * @param {Object} quizState - Estado do simulado
     */
    saveQuizState: function(quizState) {
        return this.save(this.KEYS.QUIZ_STATE, quizState);
    },

    /**
     * Recupera estado atual do simulado
     * @returns {Object} - Estado do simulado
     */
    getQuizState: function() {
        return this.get(this.KEYS.QUIZ_STATE, null);
    },

    /**
     * Salva resultados do simulado
     * @param {Object} results - Resultados do simulado
     */
    saveQuizResults: function(results) {
        return this.save(this.KEYS.QUIZ_RESULTS, results);
    },

    /**
     * Recupera resultados do simulado
     * @returns {Object} - Resultados do simulado
     */
    getQuizResults: function() {
        return this.get(this.KEYS.QUIZ_RESULTS, null);
    },

    /**
     * Salva dados do ranking
     * @param {Array} rankingData - Dados do ranking
     */
    saveRankingData: function(rankingData) {
        return this.save(this.KEYS.RANKING_DATA, rankingData);
    },

    /**
     * Recupera dados do ranking
     * @returns {Array} - Dados do ranking
     */
    getRankingData: function() {
        return this.get(this.KEYS.RANKING_DATA, []);
    },

    /**
     * Adiciona uma entrada ao ranking
     * @param {Object} entry - Entrada do ranking (nome, pontuação, data)
     */
    addRankingEntry: function(entry) {
        const ranking = this.getRankingData();
        ranking.push(entry);
        
        // Ordena o ranking por pontuação (maior para menor)
        ranking.sort((a, b) => b.score - a.score);
        
        return this.saveRankingData(ranking);
    },

    /**
     * Limpa todos os dados do simulado
     */
    clearAllData: function() {
        this.remove(this.KEYS.QUIZ_STATE);
        this.remove(this.KEYS.QUIZ_RESULTS);
    }
};
