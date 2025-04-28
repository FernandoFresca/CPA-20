/**
 * Integração do sistema de contas com o simulador CPA-10 existente
 * Este arquivo modifica o simulador para trabalhar com o sistema de contas de usuário
 */

// Modificações no ResultsManager para integrar com o sistema de contas
const originalShowResults = ResultsManager.showResults;
ResultsManager.showResults = function() {
    // Chama a função original
    originalShowResults.call(this);
    
    // Verifica se o usuário está logado
    if (AuthManager.isLoggedIn) {
        // Salva o resultado no histórico do usuário
        UserProfileManager.addSimulationToHistory(this.currentResults);
    } else {
        // Mostra o modal de convite para criar conta
        UserProfileManager.showInviteRegisterModal(this.currentResults);
    }
};

// Adiciona método para revisar simulados do histórico
ResultsManager.reviewHistorySimulation = function(simulation) {
    // Configura os resultados para revisão
    this.currentResults = simulation;
    
    // Prepara a revisão
    this.prepareReview();
    
    // Mostra a página de revisão
    showPage('review-page');
};

// Modificações no QuizEngine para integrar com o sistema de contas
const originalInit = QuizEngine.init;
QuizEngine.init = function(userData) {
    // Se o usuário estiver logado, usa os dados da conta
    if (AuthManager.isLoggedIn) {
        userData = {
            name: AuthManager.currentUser.name,
            startTime: new Date().toISOString()
        };
    }
    
    // Chama a função original
    return originalInit.call(this, userData);
};

// Modificações no RankingManager para integrar com o sistema de contas
const originalAddEntry = RankingManager.addEntry;
RankingManager.addEntry = function(entry) {
    // Se o usuário estiver logado, usa o nome da conta
    if (AuthManager.isLoggedIn) {
        entry.name = AuthManager.currentUser.name;
    }
    
    // Chama a função original
    return originalAddEntry.call(this, entry);
};

// Função para atualizar o header com os botões de conta
function updateHeaderWithAccountButtons() {
    const header = document.querySelector('header nav');
    
    if (!header) return;
    
    // Remove os botões existentes
    const existingButtons = header.querySelectorAll('button');
    existingButtons.forEach(button => {
        if (button.id !== 'view-ranking-button') {
            button.remove();
        }
    });
    
    // Adiciona os botões de conta
    const createAccountBtn = document.createElement('button');
    createAccountBtn.id = 'create-account-btn-header';
    createAccountBtn.className = 'btn btn-ghost';
    createAccountBtn.textContent = 'Criar Conta';
    createAccountBtn.addEventListener('click', () => AuthManager.showRegisterModal());
    
    const loginAccountBtn = document.createElement('button');
    loginAccountBtn.id = 'login-account-btn-header';
    loginAccountBtn.className = 'btn btn-outline';
    loginAccountBtn.textContent = 'Acessar Conta';
    loginAccountBtn.addEventListener('click', () => AuthManager.showLoginModal());
    
    const userProfileBtn = document.createElement('button');
    userProfileBtn.id = 'user-profile-btn';
    userProfileBtn.className = 'btn btn-outline flex items-center gap-2';
    userProfileBtn.innerHTML = `
        <div class="w-6 h-6 rounded-full bg-[#F8F8F8] flex items-center justify-center text-xs font-bold text-[#F53838]" id="header-avatar"></div>
        <span id="user-name-display">Usuário</span>
    `;
    userProfileBtn.style.display = 'none'; // Inicialmente oculto
    userProfileBtn.addEventListener('click', () => UserProfileManager.showProfilePage());
    
    // Adiciona os botões ao header
    header.appendChild(createAccountBtn);
    header.appendChild(loginAccountBtn);
    header.appendChild(userProfileBtn);
}

// Função para adicionar os modais de autenticação ao DOM
function addAuthModalsToDOM() {
    // Carrega o conteúdo dos modais
    fetch('auth-components.html')
        .then(response => response.text())
        .then(html => {
            // Cria um elemento temporário para analisar o HTML
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            
            // Adiciona cada modal ao body
            const modals = tempDiv.querySelectorAll('.modal');
            modals.forEach(modal => {
                document.body.appendChild(modal);
            });
            
            // Adiciona a página de perfil ao container principal
            const profilePage = tempDiv.querySelector('#profile-page');
            if (profilePage) {
                const container = document.querySelector('.container');
                if (container) {
                    container.appendChild(profilePage);
                }
            }
            
            // Inicializa o AuthManager e UserProfileManager após adicionar os componentes
            AuthManager.init();
            UserProfileManager.init();
        })
        .catch(error => {
            console.error('Erro ao carregar os componentes de autenticação:', error);
        });
}

// Inicializa a integração quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Atualiza o header com os botões de conta
    updateHeaderWithAccountButtons();
    
    // Adiciona os modais de autenticação ao DOM
    addAuthModalsToDOM();
    
    // Modifica o formulário de início para permitir login/registro
    const startForm = document.getElementById('start-form');
    if (startForm) {
        const formTitle = document.createElement('h3');
        formTitle.className = 'text-[#2B2B2B] text-xl font-semibold mb-4';
        formTitle.textContent = 'Iniciar Simulado';
        startForm.insertBefore(formTitle, startForm.firstChild);
        
        const accountMessage = document.createElement('p');
        accountMessage.className = 'text-[#5A5A5A] text-sm mt-4 text-center';
        accountMessage.innerHTML = 'Crie uma <a href="#" class="text-[#F53838] hover:underline" id="create-account-link">conta</a> ou <a href="#" class="text-[#F53838] hover:underline" id="login-account-link">faça login</a> para salvar seu histórico de simulados.';
        startForm.appendChild(accountMessage);
        
        // Adiciona os listeners de eventos
        document.getElementById('create-account-link').addEventListener('click', (e) => {
            e.preventDefault();
            AuthManager.showRegisterModal();
        });
        
        document.getElementById('login-account-link').addEventListener('click', (e) => {
            e.preventDefault();
            AuthManager.showLoginModal();
        });
    }
    
    // Modifica o botão de iniciar simulado no header
    const headerStartButton = document.getElementById('header-start-button');
    if (headerStartButton) {
        headerStartButton.addEventListener('click', () => {
            showPage('home-page');
            
            // Se o usuário estiver logado, preenche o campo de nome
            if (AuthManager.isLoggedIn) {
                const userNameInput = document.getElementById('user-name');
                if (userNameInput) {
                    userNameInput.value = AuthManager.currentUser.name;
                }
            }
        });
    }
});
