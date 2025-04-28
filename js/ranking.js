/**
 * RankingManager - Gerencia o ranking de participantes
 * Responsável por exibir e processar o ranking
 */

const RankingManager = {
    // Elementos do DOM
    elements: {
        rankingPage: null,
        rankingBody: null,
        backToHomeButton: null,
        rankingPreviewList: null,
        viewRankingButton: null
    },
    
    /**
     * Inicializa o gerenciador de ranking
     */
    init: function() {
        // Inicializa os elementos do DOM
        this.elements = {
            rankingPage: document.getElementById('ranking-page'),
            rankingBody: document.getElementById('ranking-body'),
            backToHomeButton: document.getElementById('back-to-home'),
            rankingPreviewList: document.getElementById('ranking-preview-list'),
            viewRankingButton: document.getElementById('view-ranking-button')
        };
        
        // Configura os eventos
        this.setupEvents();
        
        // Atualiza a pré-visualização do ranking na página inicial
        this.updateRankingPreview();
    },
    
    /**
     * Configura os eventos dos elementos
     */
    setupEvents: function() {
        // Evento para o botão de voltar ao início
        this.elements.backToHomeButton.addEventListener('click', () => {
            this.backToHome();
        });
        
        // Evento para o botão de visualizar ranking completo
        this.elements.viewRankingButton.addEventListener('click', () => {
            this.showRanking();
        });
    },
    
    /**
     * Exibe o ranking completo
     */
    showRanking: function() {
        // Obtém os dados do ranking
        const rankingData = StorageManager.getRankingData();
        
        // Limpa a tabela
        this.elements.rankingBody.innerHTML = '';
        
        // Se não houver dados no ranking
        if (!rankingData || rankingData.length === 0) {
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 4;
            cell.textContent = 'Nenhum participante no ranking ainda.';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            this.elements.rankingBody.appendChild(row);
        } else {
            // Obtém os dados do usuário atual
            const userData = StorageManager.getUserData();
            
            // Cria as linhas da tabela
            rankingData.forEach((entry, index) => {
                const row = document.createElement('tr');
                
                // Destaca o usuário atual
                if (userData && userData.name === entry.name) {
                    row.className = 'current-user';
                }
                
                // Posição
                const positionCell = document.createElement('td');
                positionCell.textContent = index + 1;
                row.appendChild(positionCell);
                
                // Nome
                const nameCell = document.createElement('td');
                nameCell.textContent = entry.name;
                row.appendChild(nameCell);
                
                // Pontuação
                const scoreCell = document.createElement('td');
                scoreCell.textContent = entry.score;
                row.appendChild(scoreCell);
                
                // Data
                const dateCell = document.createElement('td');
                dateCell.textContent = this.formatDate(entry.date);
                row.appendChild(dateCell);
                
                this.elements.rankingBody.appendChild(row);
            });
        }
        
        // Exibe a página de ranking
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        this.elements.rankingPage.classList.add('active');
    },
    
    /**
     * Atualiza a pré-visualização do ranking na página inicial
     */
    updateRankingPreview: function() {
        // Obtém os dados do ranking
        const rankingData = StorageManager.getRankingData();
        
        // Limpa a lista
        this.elements.rankingPreviewList.innerHTML = '';
        
        // Se não houver dados no ranking
        if (!rankingData || rankingData.length === 0) {
            const message = document.createElement('p');
            message.className = 'empty-ranking';
            message.textContent = 'Seja o primeiro a participar!';
            this.elements.rankingPreviewList.appendChild(message);
        } else {
            // Cria a lista de pré-visualização (top 5)
            const previewList = document.createElement('ol');
            previewList.className = 'ranking-preview-list';
            
            // Limita a 5 entradas
            const topEntries = rankingData.slice(0, 5);
            
            topEntries.forEach(entry => {
                const item = document.createElement('li');
                item.innerHTML = `<strong>${entry.name}</strong> - ${entry.score} pontos`;
                previewList.appendChild(item);
            });
            
            this.elements.rankingPreviewList.appendChild(previewList);
        }
    },
    
    /**
     * Volta para a página inicial
     */
    backToHome: function() {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('home-page').classList.add('active');
    },
    
    /**
     * Formata a data para exibição
     * @param {string} dateString - Data em formato ISO
     * @returns {string} - Data formatada
     */
    formatDate: function(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Erro ao formatar data:', error);
            return dateString;
        }
    }
};
