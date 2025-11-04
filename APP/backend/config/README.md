# Configuração do Backend

## ⚠️ IMPORTANTE: Configurar Banco de Dados

O arquivo `config.php` precisa ser configurado com as credenciais corretas do seu banco de dados.

### Para Hospedagem (Hostinger, etc)

1. **Acesse o painel de controle da sua hospedagem**
   - Vá em "Banco de Dados MySQL" ou "MySQL Databases"

2. **Crie um banco de dados** (se ainda não tiver)
   - Exemplo: `u953631223_provedor`
   - Anote o nome do banco

3. **Crie um usuário MySQL** (se ainda não tiver)
   - Exemplo: `u953631223_provedor`
   - Defina uma senha forte
   - Anote o usuário e senha

4. **Associe o usuário ao banco de dados**
   - Dê todas as permissões ao usuário

5. **Edite o arquivo `config/config.php`**:

```php
define('DB_HOST', 'localhost');        // Geralmente 'localhost'
define('DB_USER', 'u953631223_provedor'); // Seu usuário MySQL
define('DB_PASS', 'SuaSenha123!');     // Senha do usuário
define('DB_NAME', 'u953631223_provedor'); // Nome do banco
```

6. **Atualize as URLs** (se necessário):

```php
define('APP_URL', 'https://dinnup.site/ds/backend/public');
define('FRONTEND_URL', 'https://dinnup.site/ds/frontend');
```

### Para Desenvolvimento Local (XAMPP/WAMP)

1. **Certifique-se de que o MySQL está rodando**
   - XAMPP: Inicie o MySQL no painel de controle
   - WAMP: Clique no ícone e inicie o MySQL

2. **Acesse o phpMyAdmin**
   - XAMPP: http://localhost/phpmyadmin
   - WAMP: http://localhost/phpmyadmin

3. **Crie o banco de dados**
   - Execute o script `backend/database/schema.sql`
   - Ou crie manualmente o banco `provedor_internet`

4. **Configure o `config.php`**:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');                  // Vazio para XAMPP padrão
define('DB_NAME', 'provedor_internet');
```

### Verificar Configuração

Após configurar, teste a conexão acessando:
- `https://dinnup.site/ds/backend/public/index.php?route=auth&action=check`

Se estiver configurado corretamente, você deve receber uma resposta JSON, não um erro HTML.

### Erro Comum: "Access denied for user 'root'@'localhost'"

Este erro significa que:
- ❌ As credenciais estão incorretas
- ❌ O usuário não tem permissão para acessar o banco
- ❌ O banco de dados não existe

**Solução:**
1. Verifique se o usuário e senha estão corretos
2. Verifique se o banco de dados existe
3. Verifique se o usuário tem permissões no banco
4. Para hospedagem, use o usuário criado no painel, NÃO use 'root'

### Exemplo Completo para Hospedagem

```php
// backend/config/config.php

define('DB_HOST', 'localhost');
define('DB_USER', 'u953631223_provedor');     // Seu usuário MySQL
define('DB_PASS', 'SenhaSegura123!');        // Sua senha
define('DB_NAME', 'u953631223_provedor');    // Seu banco de dados
define('DB_CHARSET', 'utf8mb4');

define('APP_URL', 'https://dinnup.site/ds/backend/public');
define('FRONTEND_URL', 'https://dinnup.site/ds/frontend');
```

