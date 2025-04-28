/**
 * QuizEngine - Gerencia o simulado
 * Responsável pela lógica principal do simulado
 */

const QuizEngine = {
    // Estado do simulado
    state: {
        currentQuestion: 0,
        answers: [],
        started: false,
        finished: false
    },
    
    // Elementos do DOM
    elements: {
        quizPage: null,
        questionCounter: null,
        questionText: null,
        options: null,
        prevButton: null,
        nextButton: null,
        finishButton: null,
        questionDots: null,
        userInfo: null
    },
    
    /**
     * Inicializa o simulado
     * @param {Object} userData - Dados do usuário
     */
    init: async function(userData) {
        // Inicializa o banco de questões
        const questionsLoaded = await QuestionBank.init();
        if (!questionsLoaded) {
            alert('Erro ao carregar o banco de questões. Por favor, recarregue a página.');
            return false;
        }
        
        // Seleciona 50 questões aleatórias
        QuestionBank.selectRandomQuestions(50);
        
        // Inicializa o estado do simulado
        this.state = {
            currentQuestion: 0,
            answers: Array(QuestionBank.selectedQuestions.length).fill(null),
            started: false,
            finished: false
        };
        
        // Salva os dados do usuário
        StorageManager.saveUserData(userData);
        
        // Inicializa os elementos do DOM
        this.elements = {
            quizPage: document.getElementById('quiz-page'),
            questionCounter: document.getElementById('question-counter'),
            questionText: document.getElementById('question-text'),
            options: document.querySelectorAll('.option'),
            prevButton: document.getElementById('prev-button'),
            nextButton: document.getElementById('next-button'),
            finishButton: document.getElementById('finish-button'),
            questionDots: document.getElementById('question-dots'),
            userInfo: document.getElementById('user-info')
        };
        
        // Inicializa o temporizador
        Timer.init(
            document.getElementById('timer-display'),
            this.finishQuiz.bind(this)
        );
        
        // Configura os eventos
        this.setupEvents();
        
        // Exibe o nome do usuário
        this.elements.userInfo.textContent = userData.name;
        
        // Cria os indicadores de questões
        this.createQuestionDots();
        
        // Carrega a primeira questão
        this.loadQuestion(0);
        
        // Salva o estado inicial
        this.saveState();
        
        return true;
    },
    
    /**
     * Configura os eventos dos elementos
     */
    setupEvents: function() {
        // Evento para as opções
        this.elements.options.forEach(option => {
            option.addEventListener('click', () => {
                const optionLetter = option.getAttribute('data-option');
                this.selectAnswer(optionLetter);
            });
        });
        
        // Evento para o botão anterior
        this.elements.prevButton.addEventListener('click', () => {
            this.navigateQuestion(-1);
        });
        
        // Evento para o botão próximo
        this.elements.nextButton.addEventListener('click', () => {
            this.navigateQuestion(1);
        });
        
        // Evento para o botão finalizar
        this.elements.finishButton.addEventListener('click', () => {
            this.showConfirmationModal();
        });
        
        // Eventos para o modal de confirmação
        document.getElementById('confirm-finish').addEventListener('click', () => {
            this.finishQuiz();
            this.hideConfirmationModal();
        });
        
        document.getElementById('cancel-finish').addEventListener('click', () => {
            this.hideConfirmationModal();
        });
    },
    
    /**
     * Cria os indicadores de questões (pontos)
     */
    createQuestionDots: function() {
        this.elements.questionDots.innerHTML = '';
        
        for (let i = 0; i < QuestionBank.selectedQuestions.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            
            // Adiciona evento de clique para navegar para a questão
            dot.addEventListener('click', () => {
                this.loadQuestion(i);
            });
            
            this.elements.questionDots.appendChild(dot);
        }
    },
    
    /**
     * Atualiza os indicadores de questões
     */
    updateQuestionDots: function() {
        const dots = this.elements.questionDots.querySelectorAll('.dot');
        
        dots.forEach((dot, index) => {
            // Remove todas as classes
            dot.classList.remove('active', 'answered');
            
            // Adiciona classe para questão atual
            if (index === this.state.currentQuestion) {
                dot.classList.add('active');
            }
            
            // Adiciona classe para questões respondidas
            if (this.state.answers[index] !== null) {
                dot.classList.add('answered');
            }
        });
    },
    
    /**
     * Carrega uma questão específica
     * @param {number} index - Índice da questão
     */
    loadQuestion: function(index) {
        if (index < 0 || index >= QuestionBank.selectedQuestions.length) {
            console.error(`Índice de questão inválido: ${index}`);
            return;
        }
        
        // Atualiza o índice da questão atual
        this.state.currentQuestion = index;
        
        // Obtém a questão
        const question = QuestionBank.getQuestion(index);
        if (!question) return;
        
        // Atualiza o contador de questões
        this.elements.questionCounter.textContent = `Questão ${index + 1} de ${QuestionBank.selectedQuestions.length}`;
        
        // Atualiza o texto da questão
        this.elements.questionText.textContent = question.question;
        
        // Atualiza as opções
        this.elements.options.forEach(option => {
            const optionLetter = option.getAttribute('data-option');
            const optionText = option.querySelector('.option-text');
            
            optionText.textContent = question.options[optionLetter];
            
            // Remove a classe 'selected' de todas as opções
            option.classList.remove('selected');
            
            // Adiciona a classe 'selected' à opção selecionada
            if (this.state.answers[index] === optionLetter) {
                option.classList.add('selected');
            }
        });
        
        // Atualiza os botões de navegação
        this.updateNavigationButtons();
        
        // Atualiza os indicadores de questões
        this.updateQuestionDots();
    },
    
    /**
     * Atualiza os botões de navegação
     */
    updateNavigationButtons: function() {
        // Desabilita o botão anterior na primeira questão
        this.elements.prevButton.disabled = this.state.currentQuestion === 0;
        
        // Desabilita o botão próximo na última questão
        this.elements.nextButton.disabled = this.state.currentQuestion === QuestionBank.selectedQuestions.length - 1;
    },
    
    /**
     * Seleciona uma resposta para a questão atual
     * @param {string} answer - Letra da resposta selecionada
     */
    selectAnswer: function(answer) {
        // Atualiza a resposta no estado
        this.state.answers[this.state.currentQuestion] = answer;
        
        // Atualiza a interface
        this.elements.options.forEach(option => {
            const optionLetter = option.getAttribute('data-option');
            
            option.classList.remove('selected');
            
            if (optionLetter === answer) {
                option.classList.add('selected');
            }
        });
        
        // Atualiza os indicadores de questões
        this.updateQuestionDots();
        
        // Salva o estado
        this.saveState();
        
        // Avança para a próxima questão automaticamente (se não for a última)
        if (this.state.currentQuestion < QuestionBank.selectedQuestions.length - 1) {
            setTimeout(() => {
                this.navigateQuestion(1);
            }, 500);
        }
    },
    
    /**
     * Navega entre as questões
     * @param {number} direction - Direção da navegação (-1 para anterior, 1 para próxima)
     */
    navigateQuestion: function(direction) {
        const newIndex = this.state.currentQuestion + direction;
        
        if (newIndex >= 0 && newIndex < QuestionBank.selectedQuestions.length) {
            this.loadQuestion(newIndex);
        }
    },
    
    /**
     * Inicia o simulado
     */
    startQuiz: function() {
        if (this.state.started) return;
        
        this.state.started = true;
        Timer.start();
        
        // Exibe a página do simulado
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        this.elements.quizPage.classList.add('active');
        
        // Salva o estado
        this.saveState();
    },
    
    /**
     * Finaliza o simulado
     */
    finishQuiz: function() {
        if (this.state.finished) return;
        
        // Pausa o temporizador
        Timer.pause();
        
        // Marca o simulado como finalizado
        this.state.finished = true;
        
        // Calcula os resultados
        const results = this.calculateResults();
        
        // Salva os resultados
        StorageManager.saveQuizResults(results);
        
        // Adiciona ao ranking
        this.addToRanking(results);
        
        // Limpa o estado do simulado
        StorageManager.remove(StorageManager.KEYS.QUIZ_STATE);
        
        // Exibe os resultados
        ResultsManager.showResults(results);
    },
    
    /**
     * Calcula os resultados do simulado
     * @returns {Object} - Objeto com os resultados
     */
    calculateResults: function() {
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;
        
        const wrongQuestions = [];
        
        // Verifica cada resposta
        this.state.answers.forEach((answer, index) => {
            if (answer === null) {
                unansweredCount++;
            } else {
                const isCorrect = QuestionBank.checkAnswer(index, answer);
                
                if (isCorrect) {
                    correctCount++;
                } else {
                    wrongCount++;
                    
                    // Adiciona à lista de questões erradas
                    wrongQuestions.push({
                        index,
                        question: QuestionBank.getQuestion(index),
                        userAnswer: answer,
                        correctAnswer: QuestionBank.getCorrectAnswer(index)
                    });
                }
            }
        });
        
        // Questões não respondidas são consideradas erradas
        wrongCount += unansweredCount;
        
        // Calcula a aprovação (mínimo de 35 acertos)
        const approved = correctCount >= 35;
        
        return {
            correctCount,
            wrongCount,
            unansweredCount,
            totalQuestions: QuestionBank.selectedQuestions.length,
            approved,
            wrongQuestions,
            timeSpent: Timer.getElapsedTime(),
            date: new Date().toISOString()
        };
    },
    
    /**
     * Adiciona o resultado ao ranking
     * @param {Object} results - Resultados do simulado
     */
    addToRanking: function(results) {
        const userData = StorageManager.getUserData();
        
        const rankingEntry = {
            name: userData.name,
            score: results.correctCount,
            date: results.date
        };
        
        StorageManager.addRankingEntry(rankingEntry);
    },
    
    /**
     * Salva o estado atual do simulado
     */
    saveState: function() {
        const state = {
            currentQuestion: this.state.currentQuestion,
            answers: this.state.answers,
            started: this.state.started,
            finished: this.state.finished,
            remainingTime: Timer.getRemainingTime(),
            questions: QuestionBank.getAllSelectedQuestions()
        };
        
        StorageManager.saveQuizState(state);
    },
    
    /**
     * Restaura um estado salvo do simulado
     * @returns {boolean} - Verdadeiro se o estado foi restaurado com sucesso
     */
    restoreState: function() {
        const savedState = StorageManager.getQuizState();
        
        if (!savedState || savedState.finished) {
            return false;
        }
        
        // Restaura as questões
        if (savedState.questions && savedState.questions.length > 0) {
            QuestionBank.selectedQuestions = savedState.questions;
        } else {
            return false;
        }
        
        // Restaura o estado
        this.state.currentQuestion = savedState.currentQuestion || 0;
        this.state.answers = savedState.answers || Array(QuestionBank.selectedQuestions.length).fill(null);
        this.state.started = savedState.started || false;
        this.state.finished = savedState.finished || false;
        
        // Restaura o temporizador
        if (savedState.remainingTime) {
            Timer.init(
                document.getElementById('timer-display'),
                this.finishQuiz.bind(this),
                savedState.remainingTime
            );
        }
        
        // Cria os indicadores de questões
        this.createQuestionDots();
        
        // Carrega a questão atual
        this.loadQuestion(this.state.currentQuestion);
        
        // Se o simulado já estava iniciado, reinicia o temporizador
        if (this.state.started && !this.state.finished) {
            Timer.start();
            
            // Exibe a página do simulado
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            this.elements.quizPage.classList.add('active');
        }
        
        return true;
    },
    
    /**
     * Exibe o modal de confirmação
     */
    showConfirmationModal: function() {
        const modal = document.getElementById('confirmation-modal');
        modal.classList.add('active');
    },
    
    /**
     * Esconde o modal de confirmação
     */
    hideConfirmationModal: function() {
        const modal = document.getElementById('confirmation-modal');
        modal.classList.remove('active');
    }
};
