# Banco de Dados - Setup e Configuração

Este diretório contém os scripts SQL para criar e popular o banco de dados do sistema.

## 📋 Pré-requisitos

- MySQL ou MariaDB instalado e rodando
- Acesso ao MySQL com permissões para criar banco de dados
- Credenciais configuradas em `backend/config/config.php`

## 🚀 Configuração Rápida

### 1. Criar o Banco de Dados

Execute o script `schema.sql` que cria todas as tabelas e insere dados iniciais:

```bash
# Via linha de comando MySQL
mysql -u root -p < schema.sql

# Ou via phpMyAdmin/MySQL Workbench
# Importe o arquivo schema.sql
```

### 2. Adicionar Usuários de Teste (Opcional)

Se quiser adicionar ou atualizar usuários de teste, execute:

```bash
mysql -u root -p provedor_internet < seed.sql
```

## 📝 Credenciais de Teste

Após executar os scripts, você terá os seguintes usuários para testar:

| Email | Senha | Nome |
|-------|-------|------|
| `admin@provedor.com` | `123456` | Admin Teste |
| `joao.silva@email.com` | `123456` | João Silva |

## 🔧 Configuração do Banco

Certifique-se de que as configurações em `backend/config/config.php` estão corretas:

```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');  // Sua senha do MySQL
define('DB_NAME', 'provedor_internet');
```

## 📊 Estrutura do Banco

O banco de dados contém as seguintes tabelas:

- **usuarios** - Dados dos usuários/clientes
- **planos** - Planos de internet disponíveis
- **faturas** - Faturas dos clientes
- **suporte** - Chamados de suporte
- **assinaturas** - Histórico de assinaturas
- **produtos** - Produtos físicos (celulares, fones, etc)
- **pedidos** - Pedidos de produtos
- **pedido_itens** - Itens dos pedidos

## 🔄 Reset do Banco (Desenvolvimento)

Para resetar o banco e recriar tudo do zero:

```bash
mysql -u root -p -e "DROP DATABASE IF EXISTS provedor_internet;"
mysql -u root -p < schema.sql
mysql -u root -p provedor_internet < seed.sql
```

## ⚠️ Importante

- **NÃO** use as senhas de teste em produção!
- Em produção, altere todas as senhas padrão
- O hash usado para "123456" é: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`

## 🐛 Troubleshooting

### Erro: "Access denied"
- Verifique as credenciais em `config.php`
- Certifique-se de que o usuário MySQL tem permissões

### Erro: "Database doesn't exist"
- Execute primeiro o `schema.sql` que cria o banco

### Erro: "Table already exists"
- O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente
- Se quiser recriar, faça o reset do banco (veja acima)

