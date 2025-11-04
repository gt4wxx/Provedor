# Integração Frontend com Backend

Este guia mostra como integrar o frontend (HTML/JS) com o backend PHP.

## 📡 Configuração Base

### 1. Atualizar URLs no Frontend

Edite o arquivo `frontend/js/app.js` e adicione a constante da URL da API:

```javascript
// No início do arquivo app.js
const API_BASE_URL = 'http://localhost/backend/public/routes';
// Ou em produção:
// const API_BASE_URL = 'https://api.seudominio.com/routes';
```

## 🔐 Autenticação

### Login

```javascript
async function login(email, senha) {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Importante para enviar cookies
        body: JSON.stringify({
            email: email,
            senha: senha
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        // Login bem-sucedido
        localStorage.setItem('userName', data.data.user.nome);
        // Redirecionar ou atualizar interface
        return data.data.user;
    } else {
        // Erro no login
        alert(data.message);
        return null;
    }
}
```

### Verificar Autenticação

```javascript
async function checkAuth() {
    const response = await fetch(`${API_BASE_URL}/auth.php?action=check`, {
        method: 'GET',
        credentials: 'include'
    });
    
    const data = await response.json();
    return data.status === 'ok';
}
```

## 👤 Usuário

### Obter Dados do Usuário

```javascript
async function getUserData() {
    const response = await fetch(`${API_BASE_URL}/usuario.php?action=me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        return data.data.user;
    }
    
    return null;
}
```

### Atualizar Dados do Usuário

```javascript
async function updateUser(userData) {
    const response = await fetch(`${API_BASE_URL}/usuario.php?action=update`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            nome: userData.nome,
            email: userData.email,
            telefone: userData.telefone
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        localStorage.setItem('userName', data.data.user.nome);
        return data.data.user;
    }
    
    alert(data.message);
    return null;
}
```

## 📦 Planos

### Listar Planos

```javascript
async function listPlanos() {
    const response = await fetch(`${API_BASE_URL}/planos.php?action=list`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        return data.data.planos;
    }
    
    return [];
}
```

### Assinar Plano

```javascript
async function subscribePlano(idPlano) {
    const response = await fetch(`${API_BASE_URL}/planos.php?action=subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            id_plano: idPlano
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        alert('Plano assinado com sucesso!');
        return true;
    }
    
    alert(data.message);
    return false;
}
```

## 💳 Faturas

### Listar Faturas

```javascript
async function listFaturas() {
    const response = await fetch(`${API_BASE_URL}/faturas.php?action=list`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        return data.data.faturas;
    }
    
    return [];
}
```

### Pagar Fatura

```javascript
async function payFatura(idFatura) {
    const response = await fetch(`${API_BASE_URL}/faturas.php?action=pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            id: idFatura
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        alert('Fatura paga com sucesso!');
        return true;
    }
    
    alert(data.message);
    return false;
}
```

## 🧰 Suporte

### Listar Chamados

```javascript
async function listChamados() {
    const response = await fetch(`${API_BASE_URL}/suporte.php?action=list`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        return data.data.chamados;
    }
    
    return [];
}
```

### Abrir Chamado

```javascript
async function abrirChamado(categoria, assunto, descricao) {
    const response = await fetch(`${API_BASE_URL}/suporte.php?action=abrir`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            categoria: categoria,
            assunto: assunto,
            descricao: descricao
        })
    });
    
    const data = await response.json();
    
    if (data.status === 'ok') {
        alert(`Chamado #${data.data.chamado.numero_chamado} aberto com sucesso!`);
        return data.data.chamado;
    }
    
    alert(data.message);
    return null;
}
```

## 🔄 Exemplo Completo de Integração

Aqui está um exemplo de como atualizar a classe `App` no `frontend/js/app.js`:

```javascript
// Adicionar no início do app.js
const API_BASE_URL = 'http://localhost/backend/public/routes';

// Atualizar método loadPage para carregar dados reais
async loadPage(pageName) {
    try {
        // ... código existente de carregamento HTML ...
        
        // Após carregar a página, buscar dados da API
        if (pageName === 'home') {
            await this.loadHomeData();
        } else if (pageName === 'financeiro') {
            await this.loadFaturasData();
        } else if (pageName === 'loja') {
            await this.loadPlanosData();
        } else if (pageName === 'suporte') {
            await this.loadSuporteData();
        } else if (pageName === 'conta') {
            await this.loadContaData();
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

// Métodos para carregar dados
async loadHomeData() {
    try {
        // Carregar dados do usuário
        const userResponse = await fetch(`${API_BASE_URL}/usuario.php?action=me`, {
            credentials: 'include'
        });
        const userData = await userResponse.json();
        
        if (userData.status === 'ok') {
            this.updateUserNameInPage();
        }
        
        // Carregar faturas pendentes
        const faturasResponse = await fetch(`${API_BASE_URL}/faturas.php?action=list`, {
            credentials: 'include'
        });
        const faturasData = await faturasResponse.json();
        
        if (faturasData.status === 'ok') {
            // Atualizar cards de resumo na home
            this.updateSummaryCards(faturasData.data.faturas);
        }
    } catch (error) {
        console.error('Erro ao carregar dados da home:', error);
    }
}

async loadFaturasData() {
    try {
        const response = await fetch(`${API_BASE_URL}/faturas.php?action=list`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'ok') {
            this.renderFaturas(data.data.faturas);
        }
    } catch (error) {
        console.error('Erro ao carregar faturas:', error);
    }
}

async loadPlanosData() {
    try {
        const response = await fetch(`${API_BASE_URL}/planos.php?action=list`);
        const data = await response.json();
        
        if (data.status === 'ok') {
            this.renderPlanos(data.data.planos);
        }
    } catch (error) {
        console.error('Erro ao carregar planos:', error);
    }
}

async loadSuporteData() {
    try {
        const response = await fetch(`${API_BASE_URL}/suporte.php?action=list`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'ok') {
            this.renderChamados(data.data.chamados);
        }
    } catch (error) {
        console.error('Erro ao carregar chamados:', error);
    }
}

async loadContaData() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuario.php?action=me`, {
            credentials: 'include'
        });
        const data = await response.json();
        
        if (data.status === 'ok') {
            this.renderUserData(data.data.user);
        }
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
    }
}
```

## 🚨 Tratamento de Erros

Sempre trate erros de autenticação:

```javascript
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            ...options,
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        // Verificar se usuário não está autenticado
        if (response.status === 401) {
            // Redirecionar para login
            window.location.href = '/login.html';
            return null;
        }
        
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        return { status: 'erro', message: 'Erro de conexão' };
    }
}
```

## ✅ Checklist de Integração

- [ ] Configurar `API_BASE_URL` no frontend
- [ ] Implementar login/logout
- [ ] Adicionar `credentials: 'include'` em todas as requisições autenticadas
- [ ] Tratar erros 401 (não autenticado)
- [ ] Atualizar UI com dados reais da API
- [ ] Testar todas as funcionalidades
- [ ] Configurar CORS no backend (já configurado)
- [ ] Testar em diferentes navegadores

