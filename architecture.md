# Arquitetura do Sistema de Contas de Usuário - Simulador CPA-10

## Visão Geral

O sistema de contas de usuário para o Simulador CPA-10 permitirá que os usuários criem contas, façam login, visualizem seu histórico de simulados e recuperem senhas. O sistema será implementado utilizando armazenamento local (localStorage/IndexedDB) para persistência de dados entre sessões.

## Componentes Principais

### 1. Gerenciador de Autenticação (AuthManager)

Responsável por:
- Registro de novos usuários
- Autenticação (login/logout)
- Verificação de estado de autenticação
- Recuperação de senha
- Integração com Google Auth

```javascript
// Estrutura básica
const AuthManager = {
    // Estado atual
    currentUser: null,
    isLoggedIn: false,
    
    // Métodos principais
    register: function(email, password, name) { ... },
    login: function(email, password) { ... },
    loginWithGoogle: function() { ... },
    logout: function() { ... },
    resetPassword: function(email) { ... },
    getCurrentUser: function() { ... },
    checkAuthState: function() { ... }
};
```

### 2. Gerenciador de Usuários (UserManager)

Responsável por:
- Armazenamento de dados dos usuários
- Gerenciamento de perfis
- Histórico de simulados

```javascript
// Estrutura básica
const UserManager = {
    // Métodos principais
    saveUser: function(userData) { ... },
    getUser: function(userId) { ... },
    updateUser: function(userId, userData) { ... },
    addSimulationToHistory: function(userId, simulationData) { ... },
    getUserHistory: function(userId) { ... }
};
```

### 3. Componentes de Interface (UI)

#### Modais e Páginas
- Modal de Login
- Modal de Registro
- Modal de Recuperação de Senha
- Página de Perfil do Usuário
- Componente de Histórico de Simulados

#### Botões e Elementos de Navegação
- Botões "Criar Conta" e "Acessar Conta" no cabeçalho
- Botão de login com Google
- Botões para gerenciar conta após login

## Estrutura de Dados

### Usuário
```javascript
{
    id: "uuid-gerado",
    name: "Nome Completo",
    email: "email@exemplo.com",
    password: "senha-hash", // Armazenada com hash por segurança
    createdAt: "2025-04-24T22:28:00Z",
    lastLogin: "2025-04-24T22:28:00Z"
}
```

### Histórico de Simulados
```javascript
{
    userId: "uuid-do-usuario",
    simulations: [
        {
            id: "simulation-uuid",
            date: "2025-04-24T22:28:00Z",
            score: 42,
            totalQuestions: 50,
            correctAnswers: 42,
            wrongAnswers: 8,
            timeSpent: "01:45:30",
            approved: true,
            questions: [
                {
                    id: 123,
                    userAnswer: "b",
                    correctAnswer: "b",
                    isCorrect: true
                },
                // ... outras questões
            ]
        }
        // ... outros simulados
    ]
}
```

## Fluxo de Integração com o Simulador Existente

1. **Inicialização da Aplicação**
   - Verificar estado de autenticação
   - Mostrar botões apropriados no cabeçalho

2. **Início do Simulado**
   - Se usuário estiver logado, usar dados da conta
   - Se não estiver logado, permitir simulado anônimo

3. **Finalização do Simulado**
   - Se usuário estiver logado, salvar resultado no histórico
   - Se não estiver logado, oferecer criação de conta para salvar resultado

4. **Visualização de Histórico**
   - Acessível apenas para usuários logados
   - Exibir lista de simulados anteriores
   - Permitir revisão de questões erradas de cada simulado

## Armazenamento de Dados

Utilizaremos localStorage com as seguintes chaves:
- `cpa10_users`: Lista de usuários registrados
- `cpa10_currentUser`: Usuário atualmente logado
- `cpa10_userHistory_[userId]`: Histórico de simulados por usuário

Para maior segurança e capacidade, implementaremos uma camada de abstração que permitirá migrar facilmente para IndexedDB se necessário.

## Considerações de Segurança

- Senhas serão armazenadas com hash (usando bcrypt.js)
- Tokens de autenticação terão expiração
- Validação de dados em todos os formulários
- Proteção contra XSS nos dados armazenados

## Próximos Passos de Implementação

1. Criar os componentes HTML/CSS para autenticação
2. Implementar o AuthManager e UserManager
3. Integrar com o simulador existente
4. Implementar recuperação de senha
5. Adicionar autenticação via Google
6. Testar todos os fluxos de usuário
