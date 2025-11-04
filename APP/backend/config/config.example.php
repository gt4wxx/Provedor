<?php
/**
 * Exemplo de Configuração do Sistema
 * 
 * INSTRUÇÕES:
 * 1. Copie este arquivo para config.php
 * 2. Preencha as credenciais do seu banco de dados
 * 3. Ajuste as URLs para o seu ambiente
 */

// Prevenir acesso direto
if (!defined('APP_PATH')) {
    define('APP_PATH', dirname(__DIR__));
}

// ============================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// ============================================
// IMPORTANTE: Preencha com as credenciais do seu servidor MySQL

// Para hospedagem (Hostinger, etc):
// - DB_HOST geralmente é 'localhost' ou o IP fornecido
// - DB_USER é o usuário do banco criado no painel
// - DB_PASS é a senha do banco criada no painel
// - DB_NAME é o nome do banco criado no painel

define('DB_HOST', 'localhost');        // Ex: 'localhost' ou '127.0.0.1'
define('DB_USER', 'seu_usuario');       // Ex: 'u953631223_provedor'
define('DB_PASS', 'sua_senha');         // Ex: 'SuaSenhaSegura123!'
define('DB_NAME', 'provedor_internet'); // Ex: 'u953631223_provedor'
define('DB_CHARSET', 'utf8mb4');

// ============================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ============================================

define('APP_NAME', 'MeuProvedor');

// URLs do seu ambiente
// Desenvolvimento local:
// define('APP_URL', 'http://localhost/backend/public');
// define('FRONTEND_URL', 'http://localhost/frontend');

// Produção (exemplo Hostinger):
// define('APP_URL', 'https://dinnup.site/ds/backend/public');
// define('FRONTEND_URL', 'https://dinnup.site/ds/frontend');

define('APP_URL', 'http://localhost/backend/public');
define('FRONTEND_URL', 'http://localhost/frontend');

// ============================================
// CONFIGURAÇÕES DE SESSÃO
// ============================================

define('SESSION_LIFETIME', 3600 * 24); // 24 horas
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);

// ============================================
// CONFIGURAÇÕES DE SEGURANÇA
// ============================================

define('PASSWORD_MIN_LENGTH', 6);
define('JWT_SECRET', 'seu_secret_key_aqui_mude_em_producao'); // Mude em produção!
define('JWT_EXPIRATION', 3600 * 24); // 24 horas

// ============================================
// CONFIGURAÇÕES DE CORS
// ============================================

define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    FRONTEND_URL,
    'https://dinnup.site', // Adicione seus domínios de produção aqui
]);

// ============================================
// TIMEZONE
// ============================================

date_default_timezone_set('America/Sao_Paulo');

// ============================================
// ERROR REPORTING
// ============================================

// DESENVOLVIMENTO (exibe erros):
error_reporting(E_ALL);
ini_set('display_errors', 1);
define('APP_DEBUG', true);

// PRODUÇÃO (oculta erros):
// error_reporting(0);
// ini_set('display_errors', 0);
// define('APP_DEBUG', false);

