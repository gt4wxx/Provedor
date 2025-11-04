<?php
/**
 * Controller de Usuário
 */

require_once __DIR__ . '/../models/Usuario.php';
require_once __DIR__ . '/../models/Plano.php';
require_once __DIR__ . '/../utils/helpers.php';

class UsuarioController {
    private $usuario;
    private $plano;
    
    public function __construct() {
        $this->usuario = new Usuario();
        $this->plano = new Plano();
        requireLogin(); // Requer autenticação
    }
    
    /**
     * Obter dados do usuário logado
     */
    public function me() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $userId = getUserId();
        $user = $this->usuario->findById($userId);
        
        if (!$user) {
            sendResponse('erro', 'Usuário não encontrado', null, 404);
        }
        
        // Buscar plano atual
        if ($user['plano_atual']) {
            $planoAtual = $this->plano->findById($user['plano_atual']);
            $user['plano_detalhes'] = $planoAtual;
        }
        
        sendResponse('ok', 'Dados do usuário', [
            'user' => $user
        ]);
    }
    
    /**
     * Atualizar dados do usuário
     */
    public function update() {
        $method = getRequestMethod();
        
        if ($method !== 'POST' && $method !== 'PUT') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $userId = getUserId();
        
        $data = [];
        
        if (isset($input['nome'])) {
            $data['nome'] = sanitizeInput($input['nome']);
        }
        
        if (isset($input['email'])) {
            $email = sanitizeInput($input['email']);
            
            if (!validateEmail($email)) {
                sendResponse('erro', 'Email inválido', null, 400);
            }
            
            // Verificar se email já existe (exceto o próprio usuário)
            if ($this->usuario->emailExists($email, $userId)) {
                sendResponse('erro', 'Email já cadastrado', null, 409);
            }
            
            $data['email'] = $email;
        }
        
        if (isset($input['cpf'])) {
            $data['cpf'] = sanitizeInput($input['cpf']);
        }
        
        if (isset($input['telefone'])) {
            $data['telefone'] = sanitizeInput($input['telefone']);
        }
        
        if (isset($input['senha']) && !empty($input['senha'])) {
            if (strlen($input['senha']) < PASSWORD_MIN_LENGTH) {
                sendResponse('erro', 'Senha deve ter no mínimo ' . PASSWORD_MIN_LENGTH . ' caracteres', null, 400);
            }
            $data['senha'] = $input['senha'];
        }
        
        if (empty($data)) {
            sendResponse('erro', 'Nenhum dado para atualizar', null, 400);
        }
        
        if ($this->usuario->update($userId, $data)) {
            // Atualizar sessão se nome mudou
            if (isset($data['nome'])) {
                $_SESSION['user_nome'] = $data['nome'];
            }
            
            if (isset($data['email'])) {
                $_SESSION['user_email'] = $data['email'];
            }
            
            // Buscar dados atualizados
            $user = $this->usuario->findById($userId);
            
            sendResponse('ok', 'Dados atualizados com sucesso', [
                'user' => $user
            ]);
        } else {
            sendResponse('erro', 'Erro ao atualizar dados', null, 500);
        }
    }
}

