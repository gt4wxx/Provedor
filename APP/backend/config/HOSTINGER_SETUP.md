# 🚀 Guia de Deploy na Hostinger - Passo a Passo

## 📋 Pré-requisitos

- Conta na Hostinger (plano básico ou superior)
- Acesso ao hPanel (painel de controle da Hostinger)
- Domínio configurado (ex: dinnup.site)

## 🔧 Passo 1: Criar Banco de Dados MySQL

1. **Acesse o hPanel** da Hostinger
2. Procure por **"Banco de Dados MySQL"** ou **"MySQL Databases"**
3. Clique em **"Criar Novo Banco de Dados"** ou **"Add New Database"**
4. Preencha:
   - **Nome do banco**: `provedor_internet` (ou outro nome)
   - **Nome do usuário**: Será gerado automaticamente (ex: `u953631223_provedor`)
   - **Senha**: Defina uma senha forte ou use a gerada
5. **Anote todas as informações:**
   - Nome do banco: `u953631223_provedor`
   - Usuário: `u953631223_provedor`
   - Senha: `SuaSenha123!`
   - Host: Geralmente `localhost` (mas pode ser diferente)

## 🔧 Passo 2: Importar Schema do Banco

1. No hPanel, procure por **"phpMyAdmin"**
2. Clique para abrir o phpMyAdmin
3. Selecione o banco de dados criado no menu lateral esquerdo
4. Vá na aba **"Importar"** ou **"Import"**
5. Clique em **"Escolher arquivo"** e selecione `backend/database/schema.sql`
6. Clique em **"Executar"** ou **"Go"**
7. Aguarde a importação terminar

**OU** via linha de comando (se tiver acesso SSH):

```bash
mysql -u u953631223_provedor -p u953631223_provedor < schema.sql
```

## 🔧 Passo 3: Configurar config.php

1. Acesse o arquivo `backend/config/config.php` via File Manager ou FTP
2. Edite as seguintes linhas:

```php
// BANCO DE DADOS - Use as credenciais do Passo 1
define('DB_HOST', 'localhost');              // Geralmente 'localhost' na Hostinger
define('DB_USER', 'u953631223_provedor');   // Seu usuário MySQL
define('DB_PASS', 'SuaSenha123!');          // Sua senha MySQL
define('DB_NAME', 'u953631223_provedor');   // Nome do banco de dados

// URLs - Use seu domínio real
define('APP_URL', 'https://dinnup.site/ds/backend/public');
define('FRONTEND_URL', 'https://dinnup.site/ds/frontend');
```

3. **Adicione seu domínio aos CORS**:

```php
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://dinnup.site',                    // Seu domínio
    'https://www.dinnup.site',               // Com www
    FRONTEND_URL
]);
```

4. **Para produção, desabilite exibição de erros**:

```php
// PRODUÇÃO - Ocultar erros
error_reporting(0);
ini_set('display_errors', 0);
define('APP_DEBUG', false);
```

## 🔧 Passo 4: Upload dos Arquivos

### Via File Manager (hPanel)

1. Acesse **"File Manager"** no hPanel
2. Navegue até `public_html` (ou `domains/dinnup.site/public_html`)
3. Crie a estrutura de pastas:
   ```
   public_html/
   ├── ds/
   │   ├── frontend/
   │   └── backend/
   ```
4. Faça upload de todos os arquivos:
   - `frontend/` → `public_html/ds/frontend/`
   - `backend/` → `public_html/ds/backend/`

### Via FTP (FileZilla)

1. Baixe o FileZilla ou use outro cliente FTP
2. Use as credenciais FTP do hPanel:
   - Host: `ftp.dinnup.site` ou IP fornecido
   - Usuário: Seu usuário FTP
   - Senha: Sua senha FTP
   - Porta: 21 (FTP) ou 22 (SFTP)
3. Conecte e faça upload dos arquivos

## 🔧 Passo 5: Configurar .htaccess

1. Verifique se o arquivo `backend/public/.htaccess` existe
2. Se não existir, crie-o com este conteúdo:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /ds/backend/public/
    
    # Redirecionar tudo para index.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [QSA,L]
</IfModule>
```

3. **Permissões**: Certifique-se de que o `.htaccess` tem permissão de leitura

## 🔧 Passo 6: Verificar Versão PHP

1. No hPanel, procure por **"Select PHP Version"** ou **"PHP Version"**
2. Selecione **PHP 8.0 ou superior** (recomendado PHP 8.1+)
3. Salve as alterações

## 🔧 Passo 7: Testar a Conexão

1. Acesse: `https://dinnup.site/ds/backend/public/index.php?route=auth&action=check`
2. Você deve receber uma resposta JSON (não erro HTML)
3. Se houver erro, verifique:
   - Credenciais do banco de dados
   - Se o banco foi criado e o schema importado
   - Se o PHP está na versão correta

## ⚠️ Diferenças entre XAMPP e Hostinger

| XAMPP (Local) | Hostinger (Produção) |
|---------------|---------------------|
| `root` sem senha | Usuário específico com senha |
| `localhost` | `localhost` (mas pode variar) |
| Permissões totais | Permissões limitadas |
| Sem SSL | SSL/HTTPS obrigatório |
| Sem limitações | Limites de recursos |

## 🔍 Troubleshooting

### Erro: "Access denied for user 'root'@'localhost'"

**Solução**: Use o usuário MySQL criado no hPanel, não `root`.

### Erro: "Database doesn't exist"

**Solução**: 
1. Verifique se o banco foi criado no hPanel
2. Verifique se o nome do banco está correto no `config.php`

### Erro: "404 Not Found" nas rotas

**Solução**:
1. Verifique se o `.htaccess` existe
2. Verifique se o `mod_rewrite` está habilitado (geralmente está na Hostinger)
3. Use `index.php?route=...` como fallback

### Erro: "Headers already sent"

**Solução**: Remova espaços em branco antes de `<?php` no início dos arquivos PHP.

## ✅ Checklist Final

- [ ] Banco de dados criado no hPanel
- [ ] Schema importado com sucesso
- [ ] `config.php` configurado com credenciais corretas
- [ ] URLs atualizadas para produção
- [ ] Arquivos enviados via FTP/File Manager
- [ ] `.htaccess` configurado
- [ ] PHP 8.0+ selecionado
- [ ] Teste de conexão funcionando
- [ ] Frontend acessando o backend corretamente

## 📞 Suporte Hostinger

Se tiver problemas específicos da hospedagem:
- Chat ao vivo no hPanel
- Central de ajuda: https://www.hostinger.com.br/ajuda
- Email de suporte

---

**Pronto!** Seu sistema deve estar funcionando na Hostinger! 🎉

