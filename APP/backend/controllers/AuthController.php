<?php
/**
 * Controller de Autenticação
 */

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../utils/helpers.php';

class AuthController {
    private $usuario;
    
    public function __construct() {
        $this->usuario = new Usuario();
        startSecureSession();
    }
    
    /**
     * Realizar login
     */
    public function login() {
        $method = getRequestMethod();
        
        if ($method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $email = isset($input['email']) ? sanitizeInput($input['email']) : '';
        $senha = isset($input['senha']) ? $input['senha'] : '';
        
        if (empty($email) || empty($senha)) {
            sendResponse('erro', 'Email e senha são obrigatórios', null, 400);
        }
        
        if (!validateEmail($email)) {
            sendResponse('erro', 'Email inválido', null, 400);
        }
        
        // Buscar usuário
        $user = $this->usuario->findByEmail($email);
        
        if (!$user) {
            sendResponse('erro', 'Credenciais inválidas', null, 401);
        }
        
        // Verificar senha
        if (!password_verify($senha, $user['senha'])) {
            sendResponse('erro', 'Credenciais inválidas', null, 401);
        }
        
        // Verificar status do usuário
        if ($user['status'] !== 'ativo') {
            sendResponse('erro', 'Usuário inativo ou suspenso', null, 403);
        }
        
        // Criar sessão
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_nome'] = $user['nome'];
        
        // Preparar dados do usuário para resposta
        unset($user['senha']);
        
        sendResponse('ok', 'Login realizado com sucesso', [
            'user' => $user
        ]);
    }
    
    /**
     * Registrar novo usuário
     */
    public function register() {
        $method = getRequestMethod();
        
        if ($method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $nome = isset($input['nome']) ? sanitizeInput($input['nome']) : '';
        $email = isset($input['email']) ? sanitizeInput($input['email']) : '';
        $senha = isset($input['senha']) ? $input['senha'] : '';
        
        // Validações
        if (empty($nome) || empty($email) || empty($senha)) {
            sendResponse('erro', 'Nome, email e senha são obrigatórios', null, 400);
        }
        
        if (!validateEmail($email)) {
            sendResponse('erro', 'Email inválido', null, 400);
        }
        
        if (strlen($senha) < PASSWORD_MIN_LENGTH) {
            sendResponse('erro', 'Senha deve ter no mínimo ' . PASSWORD_MIN_LENGTH . ' caracteres', null, 400);
        }
        
        // Verificar se email já existe
        if ($this->usuario->emailExists($email)) {
            sendResponse('erro', 'Email já cadastrado', null, 409);
        }
        
        $data = [
            'nome' => $nome,
            'email' => $email,
            'senha' => $senha
        ];
        
        if (isset($input['cpf'])) {
            $data['cpf'] = sanitizeInput($input['cpf']);
        }
        
        if (isset($input['telefone'])) {
            $data['telefone'] = sanitizeInput($input['telefone']);
        }
        
        // Criar usuário
        $userId = $this->usuario->create($data);
        
        if ($userId) {
            $user = $this->usuario->findById($userId);
            
            sendResponse('ok', 'Usuário criado com sucesso', [
                'user' => $user
            ], 201);
        } else {
            logError("Erro ao criar usuário: " . $email);
            sendResponse('erro', 'Erro ao criar usuário. Tente novamente.', null, 500);
        }
    }
    
    /**
     * Fazer logout
     */
    public function logout() {
        $method = getRequestMethod();
        
        if ($method !== 'GET' && $method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        startSecureSession();
        
        // Limpar sessão
        $_SESSION = [];
        
        if (isset($_COOKIE[session_name()])) {
            setcookie(session_name(), '', time() - 3600, '/');
        }
        
        session_destroy();
        
        sendResponse('ok', 'Logout realizado com sucesso');
    }
    
    /**
     * Verificar se usuário está logado
     */
    public function checkAuth() {
        if (isLoggedIn()) {
            $userId = getUserId();
            $user = $this->usuario->findById($userId);
            
            sendResponse('ok', 'Usuário autenticado', [
                'user' => $user
            ]);
        } else {
            sendResponse('erro', 'Usuário não autenticado', null, 401);
        }
    }
}

