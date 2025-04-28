/**
 * QuestionBank - Gerencia o banco de questões
 * Responsável por carregar e manipular as questões do simulado
 */

const QuestionBank = {
    // Armazena todas as questões carregadas
    questions: [],
    
    // Armazena as questões selecionadas para o simulado atual
    selectedQuestions: [],
    
    /**
     * Inicializa o banco de questões
     * @returns {Promise} - Promise que resolve quando as questões são carregadas
     */
    init: async function() {
        try {
            const response = await fetch('data/questions.json');
            if (!response.ok) {
                throw new Error('Erro ao carregar o banco de questões');
            }
            
            this.questions = await response.json();
            console.log(`Banco de questões carregado: ${this.questions.length} questões disponíveis`);
            return true;
        } catch (error) {
            console.error('Erro ao inicializar o banco de questões:', error);
            return false;
        }
    },
    
    /**
     * Seleciona questões aleatórias para o simulado
     * @param {number} count - Número de questões a serem selecionadas
     * @returns {Array} - Array com as questões selecionadas
     */
    selectRandomQuestions: function(count = 50) {
        // Verifica se temos questões suficientes
        if (this.questions.length < count) {
            console.warn(`Número insuficiente de questões. Solicitado: ${count}, Disponível: ${this.questions.length}`);
            count = this.questions.length;
        }
        
        // Cria uma cópia do array de questões para não modificar o original
        const shuffled = [...this.questions];
        
        // Embaralha as questões usando o algoritmo Fisher-Yates
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        
        // Seleciona as primeiras 'count' questões
        this.selectedQuestions = shuffled.slice(0, count);
        
        return this.selectedQuestions;
    },
    
    /**
     * Obtém uma questão específica pelo índice
     * @param {number} index - Índice da questão
     * @returns {Object} - Objeto da questão
     */
    getQuestion: function(index) {
        if (index < 0 || index >= this.selectedQuestions.length) {
            console.error(`Índice de questão inválido: ${index}`);
            return null;
        }
        
        return this.selectedQuestions[index];
    },
    
    /**
     * Obtém todas as questões selecionadas
     * @returns {Array} - Array com todas as questões selecionadas
     */
    getAllSelectedQuestions: function() {
        return this.selectedQuestions;
    },
    
    /**
     * Verifica se uma resposta está correta
     * @param {number} questionIndex - Índice da questão
     * @param {string} answer - Resposta selecionada
     * @returns {boolean} - Verdadeiro se a resposta estiver correta
     */
    checkAnswer: function(questionIndex, answer) {
        const question = this.getQuestion(questionIndex);
        if (!question) return false;
        
        return question.correct_answer.toLowerCase() === answer.toLowerCase();
    },
    
    /**
     * Obtém a resposta correta para uma questão
     * @param {number} questionIndex - Índice da questão
     * @returns {string} - Letra da resposta correta
     */
    getCorrectAnswer: function(questionIndex) {
        const question = this.getQuestion(questionIndex);
        if (!question) return null;
        
        return question.correct_answer;
    }
};
