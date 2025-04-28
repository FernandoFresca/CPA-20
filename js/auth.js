/**
 * AuthManager - Gerencia autenticação e contas de usuário
 * Responsável por registro, login, logout e gerenciamento de usuários
 */

const AuthManager = {
    // Chaves para armazenamento
    KEYS: {
        USERS: 'cpa10_users',
        CURRENT_USER: 'cpa10_currentUser',
        USER_HISTORY_PREFIX: 'cpa10_userHistory_'
    },
    
    // Estado atual
    currentUser: null,
    isLoggedIn: false,
    
    /**
     * Inicializa o gerenciador de autenticação
     */
    init: function() {
        // Verifica se há um usuário logado
        this.checkAuthState();
        
        // Inicializa os listeners de eventos
        this.initEventListeners();
        
        // Atualiza a UI baseado no estado de autenticação
        this.updateUI();
    },
    
    /**
     * Verifica o estado atual de autenticação
     */
    checkAuthState: function() {
        const savedUser = localStorage.getItem(this.KEYS.CURRENT_USER);
        
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.isLoggedIn = true;
                console.log('Usuário logado:', this.currentUser.name);
            } catch (error) {
                console.error('Erro ao verificar estado de autenticação:', error);
                this.logout();
            }
        } else {
            this.isLoggedIn = false;
            this.currentUser = null;
        }
        
        return this.isLoggedIn;
    },
    
    /**
     * Inicializa os listeners de eventos para os componentes de autenticação
     */
    initEventListeners: function() {
        // Botões de header
        const createAccountBtn = document.getElementById('create-account-btn-header');
        const loginAccountBtn = document.getElementById('login-account-btn-header');
        const userProfileBtn = document.getElementById('user-profile-btn');
        const logoutBtn = document.getElementById('logout-button');
        
        if (createAccountBtn) {
            createAccountBtn.addEventListener('click', () => this.showRegisterModal());
        }
        
        if (loginAccountBtn) {
            loginAccountBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        if (userProfileBtn) {
            userProfileBtn.addEventListener('click', () => this.showProfilePage());
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.logout());
        }
        
        // Formulário de login
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('login-email').value;
                const password = document.getElementById('login-password').value;
                this.login(email, password);
            });
        }
        
        // Formulário de registro
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = document.getElementById('register-name').value;
                const email = document.getElementById('register-email').value;
                const password = document.getElementById('register-password').value;
                const confirmPassword = document.getElementById('register-confirm-password').value;
                
                this.register(name, email, password, confirmPassword);
            });
        }
        
        // Formulário de recuperação de senha
        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('recovery-email').value;
                this.resetPassword(email);
            });
        }
        
        // Botões de navegação entre modais
        const switchToRegisterBtn = document.getElementById('switch-to-register');
        const switchToLoginBtn = document.getElementById('switch-to-login');
        const forgotPasswordBtn = document.getElementById('forgot-password-btn');
        const backToLoginBtn = document.getElementById('back-to-login');
        
        if (switchToRegisterBtn) {
            switchToRegisterBtn.addEventListener('click', () => {
                this.hideModal('login-modal');
                this.showRegisterModal();
            });
        }
        
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', () => {
                this.hideModal('register-modal');
                this.showLoginModal();
            });
        }
        
        if (forgotPasswordBtn) {
            forgotPasswordBtn.addEventListener('click', () => {
                this.hideModal('login-modal');
                this.showModal('recovery-modal');
            });
        }
        
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.hideModal('recovery-modal');
                this.showLoginModal();
            });
        }
        
        // Botões de fechar modal
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });
        
        // Botões do modal de convite para criar conta
        const createAccountInviteBtn = document.getElementById('create-account-btn');
        const loginAccountInviteBtn = document.getElementById('login-account-btn');
        const skipAccountBtn = document.getElementById('skip-account-btn');
        
        if (createAccountInviteBtn) {
            createAccountInviteBtn.addEventListener('click', () => {
                this.hideModal('invite-register-modal');
                this.showRegisterModal();
            });
        }
        
        if (loginAccountInviteBtn) {
            loginAccountInviteBtn.addEventListener('click', () => {
                this.hideModal('invite-register-modal');
                this.showLoginModal();
            });
        }
        
        if (skipAccountBtn) {
            skipAccountBtn.addEventListener('click', () => {
                this.hideModal('invite-register-modal');
            });
        }
        
        // Botão para iniciar novo simulado na página de perfil
        const startNewSimulationBtn = document.getElementById('start-new-simulation');
        if (startNewSimulationBtn) {
            startNewSimulationBtn.addEventListener('click', () => {
                showPage('home-page');
            });
        }
        
        // Botões de login/registro com Google
        const googleLoginBtn = document.getElementById('google-login-btn');
        const googleRegisterBtn = document.getElementById('google-register-btn');
        
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => this.loginWithGoogle());
        }
        
        if (googleRegisterBtn) {
            googleRegisterBtn.addEventListener('click', () => this.loginWithGoogle());
        }
    },
    
    /**
     * Atualiza a interface baseada no estado de autenticação
     */
    updateUI: function() {
        const createAccountBtnHeader = document.getElementById('create-account-btn-header');
        const loginAccountBtnHeader = document.getElementById('login-account-btn-header');
        const userProfileBtn = document.getElementById('user-profile-btn');
        const userNameDisplay = document.getElementById('user-name-display');
        
        if (this.isLoggedIn && this.currentUser) {
            // Usuário está logado
            if (createAccountBtnHeader) createAccountBtnHeader.style.display = 'none';
            if (loginAccountBtnHeader) loginAccountBtnHeader.style.display = 'none';
            if (userProfileBtn) {
                userProfileBtn.style.display = 'flex';
                if (userNameDisplay) {
                    userNameDisplay.textContent = this.currentUser.name.split(' ')[0]; // Primeiro nome
                }
            }
            
            // Atualiza a página de perfil se estiver visível
            this.updateProfilePage();
        } else {
            // Usuário não está logado
            if (createAccountBtnHeader) createAccountBtnHeader.style.display = 'block';
            if (loginAccountBtnHeader) loginAccountBtnHeader.style.display = 'block';
            if (userProfileBtn) userProfileBtn.style.display = 'none';
        }
    },
    
    /**
     * Registra um novo usuário
     * @param {string} name - Nome completo
     * @param {string} email - Email
     * @param {string} password - Senha
     * @param {string} confirmPassword - Confirmação de senha
     */
    register: function(name, email, password, confirmPassword) {
        // Validações
        if (!name || !email || !password || !confirmPassword) {
            this.showError('register-error', 'Todos os campos são obrigatórios.');
            return false;
        }
        
        if (password !== confirmPassword) {
            this.showError('register-error', 'As senhas não coincidem.');
            return false;
        }
        
        if (password.length < 6) {
            this.showError('register-error', 'A senha deve ter pelo menos 6 caracteres.');
            return false;
        }
        
        // Verifica se o email já está em uso
        const users = this.getAllUsers();
        if (users.some(user => user.email === email)) {
            this.showError('register-error', 'Este email já está em uso.');
            return false;
        }
        
        // Cria o novo usuário
        const newUser = {
            id: this.generateUUID(),
            name: name,
            email: email,
            password: this.hashPassword(password), // Em produção, usar bcrypt ou similar
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };
        
        // Adiciona o usuário à lista
        users.push(newUser);
        localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
        
        // Faz login com o novo usuário
        this.setCurrentUser(newUser);
        
        // Fecha o modal de registro
        this.hideModal('register-modal');
        
        // Atualiza a UI
        this.updateUI();
        
        // Verifica se há resultados pendentes para salvar
        this.checkPendingResults();
        
        return true;
    },
    
    /**
     * Realiza login de um usuário
     * @param {string} email - Email
     * @param {string} password - Senha
     */
    login: function(email, password) {
        if (!email || !password) {
            this.showError('login-error', 'Email e senha são obrigatórios.');
            return false;
        }
        
        // Busca o usuário pelo email
        const users = this.getAllUsers();
        const user = users.find(user => user.email === email);
        
        if (!user) {
            this.showError('login-error', 'Email não encontrado.');
            return false;
        }
        
        // Verifica a senha
        if (user.password !== this.hashPassword(password)) {
            this.showError('login-error', 'Senha incorreta.');
            return false;
        }
        
        // Atualiza o último login
        user.lastLogin = new Date().toISOString();
        this.updateUser(user);
        
        // Define o usuário atual
        this.setCurrentUser(user);
        
        // Fecha o modal de login
        this.hideModal('login-modal');
        
        // Atualiza a UI
        this.updateUI();
        
        // Verifica se há resultados pendentes para salvar
        this.checkPendingResults();
        
        return true;
    },
    
    /**
     * Login com Google (simulado)
     */
    loginWithGoogle: function() {
        // Em um ambiente real, usaríamos a API do Google
        // Aqui vamos simular um login bem-sucedido
        
        alert('Em um ambiente de produção, isso abriria a autenticação do Google. Para fins de demonstração, vamos simular um login bem-sucedido.');
        
        const randomId = Math.floor(Math.random() * 10000);
        const googleUser = {
            id: this.generateUUID(),
            name: `Usuário Google ${randomId}`,
            email: `usuario${randomId}@gmail.com`,
            password: this.hashPassword(this.generateUUID()), // Senha aleatória
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            googleAuth: true
        };
        
        // Verifica se o usuário já existe
        const users = this.getAllUsers();
        const existingUser = users.find(user => user.email === googleUser.email);
        
        if (existingUser) {
            // Atualiza o último login
            existingUser.lastLogin = new Date().toISOString();
            this.updateUser(existingUser);
            this.setCurrentUser(existingUser);
        } else {
            // Adiciona o novo usuário
            users.push(googleUser);
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            this.setCurrentUser(googleUser);
        }
        
        // Fecha os modais
        this.hideModal('login-modal');
        this.hideModal('register-modal');
        
        // Atualiza a UI
        this.updateUI();
        
        // Verifica se há resultados pendentes para salvar
        this.checkPendingResults();
        
        return true;
    },
    
    /**
     * Realiza logout do usuário atual
     */
    logout: function() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        this.currentUser = null;
        this.isLoggedIn = false;
        
        // Atualiza a UI
        this.updateUI();
        
        // Volta para a página inicial
        showPage('home-page');
        
        return true;
    },
    
    /**
     * Inicia o processo de recuperação de senha
     * @param {string} email - Email do usuário
     */
    resetPassword: function(email) {
        if (!email) {
            this.showError('recovery-error', 'Por favor, informe seu email.');
            return false;
        }
        
        // Verifica se o email existe
        const users = this.getAllUsers();
        const user = users.find(user => user.email === email);
        
        if (!user) {
            this.showError('recovery-error', 'Email não encontrado.');
            return false;
        }
        
        // Em um ambiente real, enviaríamos um email com instruções
        // Aqui vamos simular uma recuperação bem-sucedida
        
        // Gera uma nova senha aleatória
        const newPassword = Math.random().toString(36).slice(-8);
        
        // Atualiza a senha do usuário
        user.password = this.hashPassword(newPassword);
        this.updateUser(user);
        
        // Mostra a mensagem de sucesso
        const successElement = document.getElementById('recovery-success');
        if (successElement) {
            successElement.textContent = `Uma nova senha foi gerada: ${newPassword}. Em um ambiente real, enviaríamos instruções por email.`;
            successElement.classList.remove('hidden');
        }
        
        // Esconde a mensagem de erro se estiver visível
        const errorElement = document.getElementById('recovery-error');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        return true;
    },
    
    /**
     * Obtém todos os usuários registrados
     * @returns {Array} Lista de usuários
     */
    getAllUsers: function() {
        const usersJson = localStorage.getItem(this.KEYS.USERS);
        return usersJson ? JSON.parse(usersJson) : [];
    },
    
    /**
     * Atualiza os dados de um usuário
     * @param {Object} user - Dados do usuário
     */
    updateUser: function(user) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === user.id);
        
        if (index !== -1) {
            users[index] = user;
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));
            
            // Se for o usuário atual, atualiza também
            if (this.currentUser && this.currentUser.id === user.id) {
                this.setCurrentUser(user);
            }
            
            return true;
        }
        
        return false;
    },
    
    /**
     * Define o usuário atual (logado)
     * @param {Object} user - Dados do usuário
     */
    setCurrentUser: function(user) {
        this.currentUser = user;
        this.isLoggedIn = true;
        localStorage.setItem(this.KEYS.CURRENT_USER, JSON.stringify(user));
    },
    
    /**
     * Obtém o usuário atual
     * @returns {Object|null} Usuário atual ou null se não estiver logado
     */
    getCurrentUser: function() {
        return this.currentUser;
    },
    
    /**
     * Verifica se há resultados pendentes para salvar
     */
    checkPendingResults: function() {
        const pendingResults = StorageManager.getQuizResults();
        
        if (pendingResults && this.isLoggedIn) {
            // Pergunta se deseja salvar os resultados na conta
            if (confirm('Deseja salvar o resultado do seu último simulado na sua conta?')) {
                this.saveSimulationToHistory(pendingResults);
                StorageManager.remove(StorageManager.KEYS.QUIZ_RESULTS);
            }
        }
    },
    
    /**
     * Salva um simulado no histórico do usuário
     * @param {Object} simulationData - Dados do simulado
     */
    saveSimulationToHistory: function(simulationData) {
        if (!this.isLoggedIn || !this.currentUser) {
            return false;
        }
        
        const userId = this.currentUser.id;
        const historyKey = `${this.KEYS.USER_HISTORY_PREFIX}${userId}`;
        
        // Obtém o histórico atual
        let history = localStorage.getItem(historyKey);
        history = history ? JSON.parse(history) : { userId, simulations: [] };
        
        // Adiciona o novo simulado
        const simulationWithId = {
            ...simulationData,
            id: this.generateUUID(),
            date: new Date().toISOString()
        };
        
        history.simulations.unshift(simulationWithId); // Adiciona no início (mais recente primeiro)
        
        // Salva o histórico atualizado
        localStorage.setItem(historyKey, JSON.stringify(history));
        
        // Atualiza a página de perfil se estiver visível
        this.updateProfilePage();
        
        return true;
    },
    
    /**
     * Obtém o histórico de simulados do usuário atual
     * @returns {Array} Lista de simulados
     */
    getUserHistory: function() {
        if (!this.isLoggedIn || !this.currentUser) {
            return [];
        }
        
        const userId = this.currentUser.id;
        const historyKey = `${this.KEYS.USER_HISTORY_PREFIX}${userId}`;
        
        const history = localStorage.getItem(historyKey);
        return history ? JSON.parse(history).simulations : [];
    },
    
    /**
     * Atualiza a página de perfil com os dados do usuário atual
     */
    updateProfilePage: function() {
        if (!this.isLoggedIn || !this.currentUser) {
            return;
        }
        
        // Elementos do perfil
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileAvatar = document.getElementById('profile-avatar');
        const totalSimulations = document.getElementById('total-simulations');
        const averageScore = document.getElementById('average-score');
        const totalApprovals = document.getElementById('total-approvals');
        const simulationsHistory = document.getElementById('simulations-history');
        const emptyHistory = document.querySelector('.empty-history');
        
        // Atualiza os dados básicos
        if (profileName) profileName.textContent = this.currentUser.name;
        if (profileEmail) profileEmail.textContent = this.currentUser.email;
        
        // Iniciais para o avatar
        if (profileAvatar) {
            const initials = this.currentUser.name
                .split(' ')
                .map(name => name[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            
            profileAvatar.textContent = initials;
        }
        
        // Obtém o histórico de simulados
        const simulations = this.getUserHistory();
        
        // Atualiza as estatísticas
        if (totalSimulations) totalSimulations.textContent = simulations.length;
        
        if (averageScore && simulations.length > 0) {
            const totalScore = simulations.reduce((sum, sim) => sum + sim.score, 0);
            const average = Math.round((totalScore / simulations.length) * 2); // Multiplica por 2 para obter percentual
            averageScore.textContent = `${average}%`;
        } else if (averageScore) {
            averageScore.textContent = '0%';
        }
        
        if (totalApprovals) {
            const approvals = simulations.filter(sim => sim.approved).length;
            totalApprovals.textContent = approvals;
        }
        
        // Atualiza o histórico de simulados
        if (simulationsHistory) {
            // Limpa o conteúdo atual
            while (simulationsHistory.firstChild) {
                if (simulationsHistory.firstChild.classList && simulationsHistory.firstChild.classList.contains('empty-history')) {
                    break;
                }
                simulationsHistory.removeChild(simulationsHistory.firstChild);
            }
            
            // Mostra ou esconde a mensagem de histórico vazio
            if (emptyHistory) {
                emptyHistory.style.display = simulations.length === 0 ? 'block' : 'none';
            }
            
            // Adiciona os itens do histórico
            if (simulations.length > 0) {
                const template = document.getElementById('simulation-history-item-template');
                
                simulations.forEach(simulation => {
                    if (template) {
                        const clone = document.importNode(template.content, true);
                        
                        // Formata a data
                        const date = new Date(simulation.date);
                        const formattedDate = date.toLocaleDateString('pt-BR');
                        const formattedTime = date.toLocaleTimeString('pt-BR');
                        
                        // Preenche os dados
                        clone.querySelector('.simulation-date').textContent = formattedDate;
                        clone.querySelector('.simulation-time').textContent = formattedTime;
                        
                        const statusElement = clone.querySelector('.simulation-status');
                        if (statusElement) {
                            statusElement.textContent = simulation.approved ? 'Aprovado' : 'Reprovado';
                            statusElement.classList.add(simulation.approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800');
                        }
                        
                        clone.querySelector('.simulation-correct').textContent = `${simulation.correctAnswers}/50`;
                        clone.querySelector('.simulation-wrong').textContent = `${simulation.wrongAnswers}/50`;
                        clone.querySelector('.simulation-time-spent').textContent = simulation.timeSpent;
                        
                        // Adiciona o ID do simulado ao botão de revisão
                        const reviewButton = clone.querySelector('.review-simulation-btn');
                        if (reviewButton) {
                            reviewButton.dataset.simulationId = simulation.id;
                            reviewButton.addEventListener('click', () => {
                                this.reviewSimulation(simulation.id);
                            });
                        }
                        
                        // Adiciona o item ao histórico
                        simulationsHistory.insertBefore(clone, emptyHistory);
                    }
                });
            }
        }
    },
    
    /**
     * Abre a revisão de um simulado específico
     * @param {string} simulationId - ID do simulado
     */
    reviewSimulation: function(simulationId) {
        const simulations = this.getUserHistory();
        const simulation = simulations.find(sim => sim.id === simulationId);
        
        if (simulation) {
            // Passa os dados para o gerenciador de resultados
            ResultsManager.reviewHistorySimulation(simulation);
        }
    },
    
    /**
     * Mostra um modal
     * @param {string} modalId - ID do modal
     */
    showModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Esconde um modal
     * @param {string} modalId - ID do modal
     */
    hideModal: function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Mostra o modal de login
     */
    showLoginModal: function() {
        this.showModal('login-modal');
        
        // Limpa mensagens de erro
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
    /**
     * Mostra o modal de registro
     */
    showRegisterModal: function() {
        this.showModal('register-modal');
        
        // Limpa mensagens de erro
        const errorElement = document.getElementById('register-error');
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
    /**
     * Mostra a página de perfil do usuário
     */
    showProfilePage: function() {
        if (this.isLoggedIn) {
            showPage('profile-page');
            this.updateProfilePage();
        } else {
            this.showLoginModal();
        }
    },
    
    /**
     * Mostra uma mensagem de erro
     * @param {string} elementId - ID do elemento de erro
     * @param {string} message - Mensagem de erro
     */
    showError: function(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
    },
    
    /**
     * Gera um UUID v4
     * @returns {string} UUID gerado
     */
    generateUUID: function() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * Cria um hash simples da senha
     * Em produção, usar bcrypt ou similar
     * @param {string} password - Senha
     * @returns {string} Hash da senha
     */
    hashPassword: function(password) {
        // Implementação simples para demonstração
        // Em produção, usar bcrypt ou similar
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converte para 32bit integer
        }
        return hash.toString(36);
    }
};
