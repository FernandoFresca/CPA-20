/**
 * PasswordRecoveryManager - Gerencia a funcionalidade de recuperação de senha
 * Responsável por processar solicitações de recuperação de senha e gerar novas senhas
 */

const PasswordRecoveryManager = {
    // Chaves para armazenamento
    KEYS: {
        RECOVERY_TOKENS: 'cpa10_recoveryTokens'
    },
    
    /**
     * Inicializa o gerenciador de recuperação de senha
     */
    init: function() {
        // Inicializa os listeners de eventos
        this.initEventListeners();
    },
    
    /**
     * Inicializa os listeners de eventos
     */
    initEventListeners: function() {
        // Formulário de recuperação de senha
        const recoveryForm = document.getElementById('recovery-form');
        if (recoveryForm) {
            recoveryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('recovery-email').value;
                this.requestPasswordReset(email);
            });
        }
        
        // Botão para voltar ao login
        const backToLoginBtn = document.getElementById('back-to-login');
        if (backToLoginBtn) {
            backToLoginBtn.addEventListener('click', () => {
                this.hideRecoveryModal();
                AuthManager.showLoginModal();
            });
        }
    },
    
    /**
     * Solicita a recuperação de senha
     * @param {string} email - Email do usuário
     */
    requestPasswordReset: function(email) {
        if (!email) {
            this.showError('Por favor, informe seu email.');
            return false;
        }
        
        // Verifica se o email existe
        const users = AuthManager.getAllUsers();
        const user = users.find(user => user.email === email);
        
        if (!user) {
            this.showError('Email não encontrado.');
            return false;
        }
        
        // Gera um token de recuperação
        const token = this.generateToken();
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora
        
        // Salva o token
        const recoveryTokens = this.getRecoveryTokens();
        recoveryTokens[token] = {
            userId: user.id,
            email: user.email,
            expiresAt: expiresAt.toISOString()
        };
        
        this.saveRecoveryTokens(recoveryTokens);
        
        // Em um ambiente real, enviaria um email com o link de recuperação
        // Para fins de demonstração, vamos simular o processo
        
        // Gera uma nova senha aleatória
        const newPassword = this.generateRandomPassword();
        
        // Atualiza a senha do usuário
        user.password = AuthManager.hashPassword(newPassword);
        AuthManager.updateUser(user);
        
        // Mostra a mensagem de sucesso
        this.showSuccess(`Uma nova senha foi gerada: ${newPassword}. Em um ambiente real, enviaríamos instruções por email.`);
        
        return true;
    },
    
    /**
     * Redefine a senha do usuário usando um token
     * @param {string} token - Token de recuperação
     * @param {string} newPassword - Nova senha
     */
    resetPassword: function(token, newPassword) {
        // Verifica se o token é válido
        const recoveryTokens = this.getRecoveryTokens();
        const tokenData = recoveryTokens[token];
        
        if (!tokenData) {
            return { success: false, message: 'Token inválido ou expirado.' };
        }
        
        // Verifica se o token não expirou
        const expiresAt = new Date(tokenData.expiresAt);
        if (expiresAt < new Date()) {
            // Remove o token expirado
            delete recoveryTokens[token];
            this.saveRecoveryTokens(recoveryTokens);
            
            return { success: false, message: 'Token expirado. Solicite uma nova recuperação de senha.' };
        }
        
        // Busca o usuário
        const users = AuthManager.getAllUsers();
        const user = users.find(user => user.id === tokenData.userId);
        
        if (!user) {
            return { success: false, message: 'Usuário não encontrado.' };
        }
        
        // Atualiza a senha
        user.password = AuthManager.hashPassword(newPassword);
        AuthManager.updateUser(user);
        
        // Remove o token usado
        delete recoveryTokens[token];
        this.saveRecoveryTokens(recoveryTokens);
        
        return { success: true, message: 'Senha redefinida com sucesso!' };
    },
    
    /**
     * Gera um token aleatório
     * @returns {string} Token gerado
     */
    generateToken: function() {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },
    
    /**
     * Gera uma senha aleatória
     * @returns {string} Senha gerada
     */
    generateRandomPassword: function() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let password = '';
        
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return password;
    },
    
    /**
     * Obtém todos os tokens de recuperação
     * @returns {Object} Tokens de recuperação
     */
    getRecoveryTokens: function() {
        const tokensJson = localStorage.getItem(this.KEYS.RECOVERY_TOKENS);
        return tokensJson ? JSON.parse(tokensJson) : {};
    },
    
    /**
     * Salva os tokens de recuperação
     * @param {Object} tokens - Tokens de recuperação
     */
    saveRecoveryTokens: function(tokens) {
        localStorage.setItem(this.KEYS.RECOVERY_TOKENS, JSON.stringify(tokens));
    },
    
    /**
     * Mostra o modal de recuperação de senha
     */
    showRecoveryModal: function() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.classList.add('active');
            
            // Limpa mensagens anteriores
            this.clearMessages();
        }
    },
    
    /**
     * Esconde o modal de recuperação de senha
     */
    hideRecoveryModal: function() {
        const modal = document.getElementById('recovery-modal');
        if (modal) {
            modal.classList.remove('active');
        }
    },
    
    /**
     * Mostra uma mensagem de erro
     * @param {string} message - Mensagem de erro
     */
    showError: function(message) {
        const errorElement = document.getElementById('recovery-error');
        const successElement = document.getElementById('recovery-success');
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.remove('hidden');
        }
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
    },
    
    /**
     * Mostra uma mensagem de sucesso
     * @param {string} message - Mensagem de sucesso
     */
    showSuccess: function(message) {
        const errorElement = document.getElementById('recovery-error');
        const successElement = document.getElementById('recovery-success');
        
        if (successElement) {
            successElement.textContent = message;
            successElement.classList.remove('hidden');
        }
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
    },
    
    /**
     * Limpa todas as mensagens
     */
    clearMessages: function() {
        const errorElement = document.getElementById('recovery-error');
        const successElement = document.getElementById('recovery-success');
        
        if (errorElement) {
            errorElement.classList.add('hidden');
        }
        
        if (successElement) {
            successElement.classList.add('hidden');
        }
    }
};

// Integração com o AuthManager
document.addEventListener('DOMContentLoaded', () => {
    // Inicializa o PasswordRecoveryManager após o DOM estar carregado
    setTimeout(() => {
        PasswordRecoveryManager.init();
        
        // Adiciona referência no AuthManager
        if (AuthManager) {
            // Substitui a função de resetPassword no AuthManager
            AuthManager.resetPassword = function(email) {
                return PasswordRecoveryManager.requestPasswordReset(email);
            };
            
            // Adiciona referência ao PasswordRecoveryManager
            AuthManager.passwordRecovery = PasswordRecoveryManager;
            
            // Atualiza o listener do botão de esqueceu a senha
            const forgotPasswordBtn = document.getElementById('forgot-password-btn');
            if (forgotPasswordBtn) {
                forgotPasswordBtn.addEventListener('click', () => {
                    AuthManager.hideModal('login-modal');
                    PasswordRecoveryManager.showRecoveryModal();
                });
            }
        }
    }, 500); // Pequeno delay para garantir que os outros componentes já foram carregados
});
