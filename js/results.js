/**
 * ResultsManager - Gerencia os resultados do simulado
 * Responsável por exibir e processar os resultados
 */

const ResultsManager = {
    // Elementos do DOM
    elements: {
        resultsPage: null,
        scoreValue: null,
        approvalStatus: null,
        correctAnswers: null,
        wrongAnswers: null,
        timeSpent: null,
        reviewButton: null,
        restartButton: null,
        rankingButton: null,
        reviewContainer: null,
        reviewPage: null,
        backToResultsButton: null
    },
    
    /**
     * Inicializa o gerenciador de resultados
     */
    init: function() {
        // Inicializa os elementos do DOM
        this.elements = {
            resultsPage: document.getElementById('results-page'),
            scoreValue: document.getElementById('score-value'),
            approvalStatus: document.getElementById('approval-status'),
            correctAnswers: document.getElementById('correct-answers'),
            wrongAnswers: document.getElementById('wrong-answers'),
            timeSpent: document.getElementById('time-spent'),
            reviewButton: document.getElementById('review-button'),
            restartButton: document.getElementById('restart-button'),
            rankingButton: document.getElementById('ranking-button'),
            reviewContainer: document.getElementById('review-container'),
            reviewPage: document.getElementById('review-page'),
            backToResultsButton: document.getElementById('back-to-results')
        };
        
        // Configura os eventos
        this.setupEvents();
    },
    
    /**
     * Configura os eventos dos elementos
     */
    setupEvents: function() {
        // Evento para o botão de revisão
        this.elements.reviewButton.addEventListener('click', () => {
            this.showReview();
        });
        
        // Evento para o botão de reiniciar
        this.elements.restartButton.addEventListener('click', () => {
            this.restartQuiz();
        });
        
        // Evento para o botão de ranking
        this.elements.rankingButton.addEventListener('click', () => {
            this.showRanking();
        });
        
        // Evento para o botão de voltar aos resultados
        this.elements.backToResultsButton.addEventListener('click', () => {
            this.showResults();
        });
    },
    
    /**
     * Exibe os resultados do simulado
     * @param {Object} results - Resultados do simulado
     */
    showResults: function(results = null) {
        // Se não foram fornecidos resultados, tenta recuperar do armazenamento
        if (!results) {
            results = StorageManager.getQuizResults();
            if (!results) {
                console.error('Nenhum resultado disponível para exibir');
                return;
            }
        }
        
        // Atualiza os elementos com os resultados
        this.elements.scoreValue.textContent = results.correctCount;
        this.elements.correctAnswers.textContent = results.correctCount;
        this.elements.wrongAnswers.textContent = results.wrongCount;
        this.elements.timeSpent.textContent = Timer.formatTime(results.timeSpent);
        
        // Atualiza o status de aprovação
        if (results.approved) {
            this.elements.approvalStatus.textContent = 'APROVADO';
            this.elements.approvalStatus.className = 'approval-status approved';
        } else {
            this.elements.approvalStatus.textContent = 'REPROVADO';
            this.elements.approvalStatus.className = 'approval-status failed';
        }
        
        // Exibe a página de resultados
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        this.elements.resultsPage.classList.add('active');
    },
    
    /**
     * Exibe a revisão das questões erradas
     */
    showReview: function() {
        const results = StorageManager.getQuizResults();
        if (!results || !results.wrongQuestions) {
            console.error('Nenhuma questão errada disponível para revisão');
            return;
        }
        
        // Limpa o container de revisão
        this.elements.reviewContainer.innerHTML = '';
        
        // Se não houver questões erradas
        if (results.wrongQuestions.length === 0) {
            const message = document.createElement('div');
            message.className = 'review-message';
            message.textContent = 'Parabéns! Você não errou nenhuma questão.';
            this.elements.reviewContainer.appendChild(message);
        } else {
            // Cria os elementos para cada questão errada
            results.wrongQuestions.forEach((item, index) => {
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                
                // Número e texto da questão
                const questionText = document.createElement('div');
                questionText.className = 'review-question';
                questionText.textContent = `${index + 1}. ${item.question.question}`;
                reviewItem.appendChild(questionText);
                
                // Opções
                const optionsContainer = document.createElement('div');
                optionsContainer.className = 'review-options';
                
                // Cria cada opção
                for (const [letter, text] of Object.entries(item.question.options)) {
                    const option = document.createElement('div');
                    
                    // Determina a classe da opção
                    if (letter === item.correctAnswer.toLowerCase()) {
                        option.className = 'review-option correct';
                    } else if (letter === item.userAnswer.toLowerCase()) {
                        option.className = 'review-option incorrect';
                    } else {
                        option.className = 'review-option';
                    }
                    
                    // Letra da opção
                    const optionLetter = document.createElement('span');
                    optionLetter.className = 'review-option-letter';
                    optionLetter.textContent = letter.toUpperCase();
                    option.appendChild(optionLetter);
                    
                    // Texto da opção
                    const optionText = document.createElement('span');
                    optionText.className = 'review-option-text';
                    optionText.textContent = text;
                    option.appendChild(optionText);
                    
                    optionsContainer.appendChild(option);
                }
                
                reviewItem.appendChild(optionsContainer);
                
                // Explicação
                const explanation = document.createElement('div');
                explanation.className = 'review-explanation';
                explanation.innerHTML = `<strong>Resposta correta:</strong> ${item.correctAnswer.toUpperCase()}`;
                reviewItem.appendChild(explanation);
                
                this.elements.reviewContainer.appendChild(reviewItem);
            });
        }
        
        // Exibe a página de revisão
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        this.elements.reviewPage.classList.add('active');
    },
    
    /**
     * Reinicia o simulado
     */
    restartQuiz: function() {
        // Limpa o estado do simulado
        StorageManager.clearAllData();
        
        // Recarrega a página
        window.location.reload();
    },
    
    /**
     * Exibe o ranking
     */
    showRanking: function() {
        // Delega para o gerenciador de ranking
        RankingManager.showRanking();
    }
};
