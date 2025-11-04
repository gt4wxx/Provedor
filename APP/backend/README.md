# Backend - Sistema de Provedor de Internet

API backend completa em PHP + MySQL para o sistema de provedor de internet, compatível com o frontend desenvolvido.

## 📋 Requisitos

- PHP 8.0 ou superior
- MySQL 5.7 ou superior (ou MariaDB 10.3+)
- Apache com mod_rewrite habilitado (ou Nginx)
- Extensões PHP: mysqli, json, session

## 🚀 Instalação

### 1. Configurar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Executar o schema
mysql -u root -p < database/schema.sql
```

Ou execute o arquivo `database/schema.sql` através do phpMyAdmin ou outro cliente MySQL.

### 2. Configurar Aplicação

Edite o arquivo `config/config.php` e ajuste as configurações:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'seu_usuario');
define('DB_PASS', 'sua_senha');
define('DB_NAME', 'provedor_internet');
define('APP_URL', 'http://localhost/backend/public');
define('FRONTEND_URL', 'http://localhost/frontend');
```

### 3. Configurar Permissões

```bash
# Criar diretório de logs
mkdir -p logs
chmod 755 logs

# Dar permissão de escrita para logs
chmod 755 logs/backend.log
```

### 4. Configurar Servidor Web

#### Apache

Certifique-se de que o mod_rewrite está habilitado:

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Configure o VirtualHost apontando para o diretório `backend/public`:

```apache
<VirtualHost *:80>
    ServerName api.seudominio.com
    DocumentRoot /caminho/para/backend/public
    
    <Directory /caminho/para/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

#### Nginx

```nginx
server {
    listen 80;
    server_name api.seudominio.com;
    root /caminho/para/backend/public;
    
    index index.php;
    
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.0-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

## 📚 Endpoints da API

### Autenticação (`/auth.php`)

#### POST `/auth.php?action=login`
Realizar login

**Body:**
```json
{
  "email": "joao.silva@email.com",
  "senha": "123456"
}
```

**Resposta:**
```json
{
  "status": "ok",
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "nome": "João Silva",
      "email": "joao.silva@email.com"
    }
  }
}
```

#### POST `/auth.php?action=register`
Registrar novo usuário

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "senha": "123456",
  "cpf": "000.000.000-00",
  "telefone": "(11) 99999-9999"
}
```

#### GET `/auth.php?action=logout`
Fazer logout

#### GET `/auth.php?action=check`
Verificar se usuário está autenticado

### Usuário (`/usuario.php`)

**Requer autenticação**

#### GET `/usuario.php?action=me`
Obter dados do usuário logado

#### POST `/usuario.php?action=update`
Atualizar dados do usuário

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999"
}
```

### Planos (`/planos.php`)

#### GET `/planos.php?action=list`
Listar todos os planos disponíveis

#### POST `/planos.php?action=subscribe`
Assinar plano (requer autenticação)

**Body:**
```json
{
  "id_plano": 2
}
```

#### GET `/planos.php?action=current`
Obter plano atual do usuário (requer autenticação)

### Faturas (`/faturas.php`)

**Requer autenticação**

#### GET `/faturas.php?action=list`
Listar faturas do usuário

#### GET `/faturas.php?action=view&id=1`
Detalhar fatura específica

#### POST `/faturas.php?action=pay`
Pagar fatura

**Body:**
```json
{
  "id": 1
}
```

### Suporte (`/suporte.php`)

**Requer autenticação**

#### GET `/suporte.php?action=list`
Listar chamados do usuário

#### POST `/suporte.php?action=abrir`
Abrir novo chamado

**Body:**
```json
{
  "categoria": "tecnico",
  "assunto": "Problema de conexão",
  "descricao": "Internet caindo frequentemente"
}
```

#### GET `/suporte.php?action=view&id=1`
Detalhar chamado específico

## 🔒 Segurança

O backend implementa as seguintes medidas de segurança:

- **Sanitização de entrada**: Todas as entradas são sanitizadas antes do processamento
- **Prepared Statements**: Uso de prepared statements para prevenir SQL Injection
- **Hash de senhas**: Senhas são hasheadas com `password_hash()` usando bcrypt
- **Sessões seguras**: Sessões configuradas com cookies httponly e secure
- **Validação de email**: Validação de formato de email
- **CORS**: CORS habilitado apenas para origens permitidas
- **Middleware de autenticação**: Verificação de login para rotas protegidas

## 📝 Estrutura de Resposta

Todas as respostas seguem o padrão:

```json
{
  "status": "ok" | "erro",
  "message": "Mensagem descritiva",
  "data": {
    // Dados da resposta (opcional)
  }
}
```

**Códigos HTTP:**
- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Requisição inválida
- `401` - Não autenticado
- `403` - Acesso negado
- `404` - Não encontrado
- `405` - Método não permitido
- `409` - Conflito (ex: email já cadastrado)
- `500` - Erro interno do servidor

## 🔗 Integração com Frontend

Para integrar o frontend com este backend, atualize as URLs de requisição no arquivo `frontend/js/app.js`:

```javascript
// Exemplo de integração
async function loadData() {
    const response = await fetch('http://localhost/backend/public/usuario.php?action=me', {
        method: 'GET',
        credentials: 'include', // Para enviar cookies de sessão
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    // Processar dados...
}
```

## 📊 Banco de Dados

### Tabelas Principais

- `usuarios` - Dados dos usuários/clientes
- `planos` - Planos de internet disponíveis
- `faturas` - Faturas dos clientes
- `suporte` - Chamados de suporte
- `assinaturas` - Histórico de assinaturas

Execute o arquivo `database/schema.sql` para criar todas as tabelas com dados de exemplo.

## 🧪 Testando a API

### Usando cURL

```bash
# Login
curl -X POST http://localhost/backend/public/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"email":"joao.silva@email.com","senha":"123456"}' \
  -c cookies.txt

# Listar planos
curl http://localhost/backend/public/planos.php?action=list

# Obter dados do usuário (usando cookies)
curl http://localhost/backend/public/usuario.php?action=me \
  -b cookies.txt
```

### Usando Postman ou Insomnia

Configure a Collection com as requisições acima. Não esqueça de configurar o Cookie Manager para manter a sessão.

## 🐛 Logs

Os logs de erro são salvos em `backend/logs/backend.log`. Certifique-se de que o diretório tem permissão de escrita.

## 🚀 Deploy em Produção

### Checklist de Produção

- [ ] Alterar `error_reporting` para `0` em `config.php`
- [ ] Alterar `display_errors` para `Off` em `.htaccess`
- [ ] Alterar `JWT_SECRET` em `config.php` para um valor seguro e aleatório
- [ ] Configurar HTTPS (alterar `cookie_secure` para `1` em helpers.php)
- [ ] Configurar CORS apenas para o domínio do frontend
- [ ] Fazer backup regular do banco de dados
- [ ] Configurar monitoramento e alertas
- [ ] Usar variáveis de ambiente para configurações sensíveis

### Hospedagem Compartilhada (como Render)

1. Configure o banco de dados MySQL na Render
2. Atualize `config.php` com as credenciais fornecidas
3. Faça upload de todos os arquivos via FTP/SFTP
4. Configure o domínio no painel da Render
5. Certifique-se de que o PHP está na versão 8.0+

## 📞 Suporte

Para dúvidas ou problemas, verifique os logs em `logs/backend.log` e os erros do PHP.

## 📄 Licença

Este projeto foi desenvolvido para o sistema de provedor de internet.

