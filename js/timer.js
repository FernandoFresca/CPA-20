/**
 * Timer - Gerencia o temporizador do simulado
 * Responsável por controlar o tempo do simulado
 */

const Timer = {
    // Tempo total em segundos (2 horas = 7200 segundos)
    totalTime: 7200,
    
    // Tempo restante em segundos
    remainingTime: 7200,
    
    // ID do intervalo para atualização do temporizador
    intervalId: null,
    
    // Elemento de exibição do temporizador
    timerDisplay: null,
    
    // Callback para quando o tempo acabar
    onTimeUp: null,
    
    /**
     * Inicializa o temporizador
     * @param {HTMLElement} displayElement - Elemento para exibir o tempo
     * @param {Function} timeUpCallback - Função a ser chamada quando o tempo acabar
     * @param {number} initialTime - Tempo inicial em segundos (opcional)
     */
    init: function(displayElement, timeUpCallback, initialTime = null) {
        this.timerDisplay = displayElement;
        this.onTimeUp = timeUpCallback;
        
        // Se um tempo inicial for fornecido, use-o
        if (initialTime !== null && !isNaN(initialTime)) {
            this.remainingTime = initialTime;
        } else {
            this.remainingTime = this.totalTime;
        }
        
        this.updateDisplay();
    },
    
    /**
     * Inicia o temporizador
     */
    start: function() {
        // Limpa qualquer intervalo existente
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        
        // Atualiza o temporizador a cada segundo
        this.intervalId = setInterval(() => {
            this.tick();
        }, 1000);
    },
    
    /**
     * Pausa o temporizador
     */
    pause: function() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    },
    
    /**
     * Reinicia o temporizador
     */
    reset: function() {
        this.pause();
        this.remainingTime = this.totalTime;
        this.updateDisplay();
    },
    
    /**
     * Atualiza o temporizador a cada segundo
     */
    tick: function() {
        if (this.remainingTime <= 0) {
            this.pause();
            if (this.onTimeUp && typeof this.onTimeUp === 'function') {
                this.onTimeUp();
            }
            return;
        }
        
        this.remainingTime--;
        this.updateDisplay();
    },
    
    /**
     * Atualiza a exibição do temporizador
     */
    updateDisplay: function() {
        if (!this.timerDisplay) return;
        
        const hours = Math.floor(this.remainingTime / 3600);
        const minutes = Math.floor((this.remainingTime % 3600) / 60);
        const seconds = this.remainingTime % 60;
        
        // Formata o tempo como HH:MM:SS
        const formattedTime = [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
        
        this.timerDisplay.textContent = formattedTime;
        
        // Adiciona classe de alerta quando o tempo estiver acabando
        if (this.remainingTime <= 300) { // 5 minutos
            this.timerDisplay.classList.add('time-alert');
        } else {
            this.timerDisplay.classList.remove('time-alert');
        }
    },
    
    /**
     * Obtém o tempo restante em segundos
     * @returns {number} - Tempo restante em segundos
     */
    getRemainingTime: function() {
        return this.remainingTime;
    },
    
    /**
     * Obtém o tempo decorrido em segundos
     * @returns {number} - Tempo decorrido em segundos
     */
    getElapsedTime: function() {
        return this.totalTime - this.remainingTime;
    },
    
    /**
     * Formata o tempo em formato legível
     * @param {number} timeInSeconds - Tempo em segundos
     * @returns {string} - Tempo formatado como HH:MM:SS
     */
    formatTime: function(timeInSeconds) {
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const seconds = timeInSeconds % 60;
        
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }
};
