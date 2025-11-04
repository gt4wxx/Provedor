<?php
/**
 * Configurações do Sistema
 * Configuração centralizada para conexão com banco de dados e constantes do sistema
 */

// Prevenir acesso direto
if (!defined('APP_PATH')) {
    define('APP_PATH', dirname(__DIR__));
}

// ============================================
// CONFIGURAÇÕES DO BANCO DE DADOS
// ============================================
// 
// ⚠️ IMPORTANTE: Configure de acordo com seu ambiente
//
// 📌 XAMPP (Desenvolvimento Local):
// define('DB_HOST', 'localhost');
// define('DB_USER', 'root');
// define('DB_PASS', '');  // Vazio no XAMPP padrão
// define('DB_NAME', 'provedor_internet');
//
// 📌 HOSTINGER (Produção):
// 1. Acesse hPanel → "Banco de Dados MySQL"
// 2. Crie um banco de dados
// 3. Use as credenciais geradas (ex: u953631223_provedor)
// 4. Cole aqui:
// define('DB_HOST', 'localhost');
// define('DB_USER', 'u953631223_provedor');  // Seu usuário MySQL
// define('DB_PASS', 'SuaSenha123!');         // Sua senha MySQL
// define('DB_NAME', 'u953631223_provedor');   // Nome do banco
//
// 📖 Veja: backend/config/HOSTINGER_SETUP.md para guia completo

// XAMPP (Desenvolvimento)
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'provedor_internet');

// Hostinger (Produção) - Descomente e configure:
// define('DB_HOST', 'localhost');
// define('DB_USER', 'u953631223_provedor');
// define('DB_PASS', 'SuaSenha123!');
// define('DB_NAME', 'u953631223_provedor');

define('DB_CHARSET', 'utf8mb4');

// ============================================
// CONFIGURAÇÕES DA APLICAÇÃO
// ============================================

define('APP_NAME', 'MeuProvedor');

// URLs - Ajuste conforme seu ambiente
// 
// XAMPP (Desenvolvimento):
define('APP_URL', 'http://localhost/backend/public');
define('FRONTEND_URL', 'http://localhost/frontend');

// Hostinger (Produção) - Descomente e configure:
// define('APP_URL', 'https://dinnup.site/ds/backend/public');
// define('FRONTEND_URL', 'https://dinnup.site/ds/frontend');

// Configurações de Sessão
define('SESSION_LIFETIME', 3600 * 24); // 24 horas
ini_set('session.gc_maxlifetime', SESSION_LIFETIME);

// Configurações de Segurança
define('PASSWORD_MIN_LENGTH', 6);
define('JWT_SECRET', 'seu_secret_key_aqui_mude_em_producao'); // Mude em produção!
define('JWT_EXPIRATION', 3600 * 24); // 24 horas

// Configurações de CORS
// Adicione seus domínios de produção aqui
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://127.0.0.1',
    'https://dinnup.site',           // Seu domínio (descomente em produção)
    'https://www.dinnup.site',       // Com www (descomente em produção)
    FRONTEND_URL
]);

// Timezone
date_default_timezone_set('America/Sao_Paulo');

// Error Reporting
// 
// XAMPP (Desenvolvimento) - Exibe erros:
error_reporting(E_ALL);
ini_set('display_errors', 1);
define('APP_DEBUG', true);

// Hostinger (Produção) - Oculte erros (descomente em produção):
// error_reporting(0);
// ini_set('display_errors', 0);
// define('APP_DEBUG', false);

