/**
 * Aplicação principal do Simulado CPA-10
 * Responsável por inicializar e coordenar todos os componentes
 */

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa os gerenciadores
    ResultsManager.init();
    RankingManager.init();
    
    // Verifica se há um simulado em andamento
    const savedState = StorageManager.getQuizState();
    if (savedState && !savedState.finished) {
        // Pergunta ao usuário se deseja continuar o simulado
        if (confirm('Você tem um simulado em andamento. Deseja continuar?')) {
            // Inicializa os elementos do DOM
            QuizEngine.elements = {
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
            
            // Restaura o estado do simulado
            QuizEngine.restoreState();
        } else {
            // Limpa o estado salvo
            StorageManager.remove(StorageManager.KEYS.QUIZ_STATE);
        }
    }
    
    // Configura o formulário de início
    const startForm = document.getElementById('start-form');
    startForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        // Obtém o nome do usuário
        const userName = document.getElementById('user-name').value.trim();
        
        // Valida o nome
        if (!userName) {
            alert('Por favor, digite seu nome completo.');
            return;
        }
        
        // Dados do usuário
        const userData = {
            name: userName,
            startTime: new Date().toISOString()
        };
        
        // Inicializa o simulado
        const initialized = await QuizEngine.init(userData);
        
        if (initialized) {
            // Inicia o simulado
            QuizEngine.startQuiz();
        }
    });
    
    // Verifica se há resultados para exibir
    const savedResults = StorageManager.getQuizResults();
    if (savedResults) {
        // Adiciona botão para ver resultados anteriores
        const viewResultsButton = document.createElement('button');
        viewResultsButton.className = 'btn btn-secondary';
        viewResultsButton.textContent = 'Ver Resultados Anteriores';
        viewResultsButton.style.marginTop = '1rem';
        
        viewResultsButton.addEventListener('click', () => {
            ResultsManager.showResults();
        });
        
        startForm.appendChild(viewResultsButton);
    }
});

/**
 * Funções utilitárias
 */

// Função para embaralhar um array
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Função para formatar o tempo
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        secs.toString().padStart(2, '0')
    ].join(':');
}

// Função para mostrar uma página específica
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
    }
}
