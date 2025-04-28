/**
 * UserProfileManager - Gerencia a página de perfil do usuário e histórico de simulados
 * Responsável por exibir e atualizar informações do perfil e histórico de simulados
 */

const UserProfileManager = {
    // Elementos do DOM
    elements: {
        profilePage: null,
        profileName: null,
        profileEmail: null,
        profileAvatar: null,
        totalSimulations: null,
        averageScore: null,
        totalApprovals: null,
        simulationsHistory: null,
        emptyHistory: null,
        startNewSimulationBtn: null
    },
    
    /**
     * Inicializa o gerenciador de perfil do usuário
     */
    init: function() {
        // Inicializa os elementos do DOM
        this.elements = {
            profilePage: document.getElementById('profile-page'),
            profileName: document.getElementById('profile-name'),
            profileEmail: document.getElementById('profile-email'),
            profileAvatar: document.getElementById('profile-avatar'),
            totalSimulations: document.getElementById('total-simulations'),
            averageScore: document.getElementById('average-score'),
            totalApprovals: document.getElementById('total-approvals'),
            simulationsHistory: document.getElementById('simulations-history'),
            emptyHistory: document.querySelector('.empty-history'),
            startNewSimulationBtn: document.getElementById('start-new-simulation')
        };
        
        // Inicializa os listeners de eventos
        this.initEventListeners();
    },
    
    /**
     * Inicializa os listeners de eventos
     */
    initEventListeners: function() {
        // Botão para iniciar novo simulado
        if (this.elements.startNewSimulationBtn) {
            this.elements.startNewSimulationBtn.addEventListener('click', () => {
                showPage('home-page');
            });
        }
    },
    
    /**
     * Atualiza a página de perfil com os dados do usuário atual
     */
    updateProfile: function() {
        // Verifica se o usuário está logado
        if (!AuthManager.isLoggedIn || !AuthManager.currentUser) {
            return;
        }
        
        const user = AuthManager.currentUser;
        
        // Atualiza os dados básicos
        if (this.elements.profileName) this.elements.profileName.textContent = user.name;
        if (this.elements.profileEmail) this.elements.profileEmail.textContent = user.email;
        
        // Iniciais para o avatar
        if (this.elements.profileAvatar) {
            const initials = user.name
                .split(' ')
                .map(name => name[0])
                .join('')
                .substring(0, 2)
                .toUpperCase();
            
            this.elements.profileAvatar.textContent = initials;
        }
        
        // Atualiza o histórico de simulados
        this.updateSimulationsHistory();
    },
    
    /**
     * Atualiza o histórico de simulados
     */
    updateSimulationsHistory: function() {
        // Verifica se o usuário está logado
        if (!AuthManager.isLoggedIn || !AuthManager.currentUser) {
            return;
        }
        
        // Obtém o histórico de simulados
        const simulations = AuthManager.getUserHistory();
        
        // Atualiza as estatísticas
        if (this.elements.totalSimulations) {
            this.elements.totalSimulations.textContent = simulations.length;
        }
        
        if (this.elements.averageScore && simulations.length > 0) {
            const totalScore = simulations.reduce((sum, sim) => sum + sim.score, 0);
            const average = Math.round((totalScore / simulations.length) * 2); // Multiplica por 2 para obter percentual
            this.elements.averageScore.textContent = `${average}%`;
        } else if (this.elements.averageScore) {
            this.elements.averageScore.textContent = '0%';
        }
        
        if (this.elements.totalApprovals) {
            const approvals = simulations.filter(sim => sim.approved).length;
            this.elements.totalApprovals.textContent = approvals;
        }
        
        // Atualiza o histórico de simulados
        if (this.elements.simulationsHistory) {
            // Limpa o conteúdo atual (exceto a mensagem de histórico vazio)
            while (this.elements.simulationsHistory.firstChild) {
                if (this.elements.simulationsHistory.firstChild.classList && 
                    this.elements.simulationsHistory.firstChild.classList.contains('empty-history')) {
                    break;
                }
                this.elements.simulationsHistory.removeChild(this.elements.simulationsHistory.firstChild);
            }
            
            // Mostra ou esconde a mensagem de histórico vazio
            if (this.elements.emptyHistory) {
                this.elements.emptyHistory.style.display = simulations.length === 0 ? 'block' : 'none';
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
                                this.reviewSimulation(simulation);
                            });
                        }
                        
                        // Adiciona o item ao histórico
                        this.elements.simulationsHistory.insertBefore(clone, this.elements.emptyHistory);
                    }
                });
            }
        }
    },
    
    /**
     * Abre a revisão de um simulado específico
     * @param {Object} simulation - Dados do simulado
     */
    reviewSimulation: function(simulation) {
        if (simulation) {
            // Passa os dados para o gerenciador de resultados
            ResultsManager.reviewHistorySimulation(simulation);
        }
    },
    
    /**
     * Adiciona um simulado ao histórico do usuário atual
     * @param {Object} simulationData - Dados do simulado
     */
    addSimulationToHistory: function(simulationData) {
        // Verifica se o usuário está logado
        if (!AuthManager.isLoggedIn || !AuthManager.currentUser) {
            // Se não estiver logado, mostra o modal de convite para criar conta
            this.showInviteRegisterModal(simulationData);
            return false;
        }
        
        // Salva o simulado no histórico
        const saved = AuthManager.saveSimulationToHistory(simulationData);
        
        // Atualiza a página de perfil se estiver visível
        if (saved && this.elements.profilePage && this.elements.profilePage.classList.contains('active')) {
            this.updateProfile();
        }
        
        return saved;
    },
    
    /**
     * Mostra o modal de convite para criar conta
     * @param {Object} simulationData - Dados do simulado para salvar após criar conta
     */
    showInviteRegisterModal: function(simulationData) {
        // Salva os dados do simulado temporariamente
        if (simulationData) {
            StorageManager.saveQuizResults(simulationData);
        }
        
        // Mostra o modal
        const modal = document.getElementById('invite-register-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },
    
    /**
     * Mostra a página de perfil do usuário
     */
    showProfilePage: function() {
        // Verifica se o usuário está logado
        if (!AuthManager.isLoggedIn || !AuthManager.currentUser) {
            // Se não estiver logado, mostra o modal de login
            AuthManager.showLoginModal();
            return;
        }
        
        // Mostra a página de perfil
        showPage('profile-page');
        
        // Atualiza os dados do perfil
        this.updateProfile();
    }
};
