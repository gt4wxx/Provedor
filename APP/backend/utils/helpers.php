<?php
/**
 * Funções auxiliares do sistema
 */

require_once __DIR__ . '/../config/config.php';

/**
 * Habilitar CORS para requisições do frontend
 */
function enableCORS() {
    $origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';
    
    if (in_array($origin, ALLOWED_ORIGINS) || in_array('*', ALLOWED_ORIGINS)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
    header("Access-Control-Allow-Credentials: true");
    
    // Responder OPTIONS request imediatamente
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
}

/**
 * Enviar resposta JSON padronizada
 * @param string $status "ok" ou "erro"
 * @param string $message Mensagem de resposta
 * @param mixed $data Dados adicionais (opcional)
 * @param int $httpCode Código HTTP
 */
function sendResponse($status, $message, $data = null, $httpCode = 200) {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    
    // Habilitar CORS
    enableCORS();
    
    $response = [
        'status' => $status,
        'message' => $message
    ];
    
    if ($data !== null) {
        $response['data'] = $data;
    }
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Conectar ao banco de dados MySQL
 * @return mysqli|null
 */
function getDatabaseConnection() {
    static $conn = null;
    
    if ($conn === null) {
        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            
            if ($conn->connect_error) {
                $errorMsg = "Erro de conexão com o banco de dados: " . $conn->connect_error;
                error_log($errorMsg);
                
                // Se estiver em modo debug, enviar resposta JSON com o erro
                if (defined('APP_DEBUG') && APP_DEBUG) {
                    sendResponse('erro', 'Erro de conexão com o banco de dados. Verifique as credenciais em config/config.php', [
                        'error' => $conn->connect_error,
                        'host' => DB_HOST,
                        'user' => DB_USER,
                        'database' => DB_NAME
                    ], 500);
                } else {
                    // Em produção, não expor detalhes do erro
                    sendResponse('erro', 'Erro de conexão com o banco de dados. Contate o administrador.', null, 500);
                }
                return null;
            }
            
            $conn->set_charset(DB_CHARSET);
        } catch (Exception $e) {
            error_log("Exceção ao conectar ao banco: " . $e->getMessage());
            
            if (defined('APP_DEBUG') && APP_DEBUG) {
                sendResponse('erro', 'Erro ao conectar ao banco de dados: ' . $e->getMessage(), null, 500);
            } else {
                sendResponse('erro', 'Erro de conexão com o banco de dados. Contate o administrador.', null, 500);
            }
            return null;
        }
    }
    
    return $conn;
}

/**
 * Sanitizar entrada de dados
 * @param mixed $input Dados a serem sanitizados
 * @return mixed Dados sanitizados
 */
function sanitizeInput($input) {
    if (is_array($input)) {
        return array_map('sanitizeInput', $input);
    }
    
    $input = trim($input);
    $input = stripslashes($input);
    $input = htmlspecialchars($input, ENT_QUOTES, 'UTF-8');
    
    return $input;
}

/**
 * Validar e-mail
 * @param string $email
 * @return bool
 */
function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Validar CPF (formato básico)
 * @param string $cpf
 * @return bool
 */
function validateCPF($cpf) {
    $cpf = preg_replace('/[^0-9]/', '', $cpf);
    return strlen($cpf) === 11;
}

/**
 * Iniciar sessão segura
 */
function startSecureSession() {
    if (session_status() === PHP_SESSION_NONE) {
        ini_set('session.cookie_httponly', 1);
        ini_set('session.use_only_cookies', 1);
        ini_set('session.cookie_secure', 0); // 1 para HTTPS
        session_start();
    }
}

/**
 * Verificar se usuário está logado
 * @return bool
 */
function isLoggedIn() {
    startSecureSession();
    return isset($_SESSION['user_id']) && !empty($_SESSION['user_id']);
}

/**
 * Requerer login (middleware)
 */
function requireLogin() {
    if (!isLoggedIn()) {
        sendResponse('erro', 'Acesso negado. Faça login primeiro.', null, 401);
    }
}

/**
 * Obter ID do usuário logado
 * @return int|null
 */
function getUserId() {
    startSecureSession();
    return isset($_SESSION['user_id']) ? (int)$_SESSION['user_id'] : null;
}

/**
 * Log de erro
 * @param string $message
 */
function logError($message) {
    $logFile = __DIR__ . '/../logs/backend.log';
    $logDir = dirname($logFile);
    
    if (!is_dir($logDir)) {
        mkdir($logDir, 0755, true);
    }
    
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message" . PHP_EOL;
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

/**
 * Gerar número de chamado único
 * @return string
 */
function generateChamadoNumber() {
    return date('Y') . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
}

/**
 * Formatar valor monetário
 * @param float $value
 * @return string
 */
function formatMoney($value) {
    return number_format((float)$value, 2, ',', '.');
}

/**
 * Obter dados JSON da requisição
 * @return array|null
 */
function getJsonInput() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    
    return $data;
}

/**
 * Obter método HTTP
 * @return string
 */
function getRequestMethod() {
    return $_SERVER['REQUEST_METHOD'];
}

/**
 * Obter parâmetros da URL (query string)
 * @return array
 */
function getUrlParams() {
    return $_GET;
}

