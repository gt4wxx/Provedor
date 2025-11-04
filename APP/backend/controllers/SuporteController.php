<?php
/**
 * Controller de Suporte
 */

require_once __DIR__ . '/../models/Suporte.php';
require_once __DIR__ . '/../utils/helpers.php';

class SuporteController {
    private $suporte;
    
    public function __construct() {
        $this->suporte = new Suporte();
        requireLogin();
    }
    
    /**
     * Listar chamados do usuário
     */
    public function list() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $userId = getUserId();
        $chamados = $this->suporte->listByUser($userId);
        
        sendResponse('ok', 'Chamados listados com sucesso', [
            'chamados' => $chamados
        ]);
    }
    
    /**
     * Abrir novo chamado
     */
    public function abrir() {
        $method = getRequestMethod();
        
        if ($method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $categoria = isset($input['categoria']) ? sanitizeInput($input['categoria']) : '';
        $assunto = isset($input['assunto']) ? sanitizeInput($input['assunto']) : '';
        $descricao = isset($input['descricao']) ? sanitizeInput($input['descricao']) : '';
        
        // Validações
        if (empty($categoria) || empty($assunto) || empty($descricao)) {
            sendResponse('erro', 'Categoria, assunto e descrição são obrigatórios', null, 400);
        }
        
        $categoriasPermitidas = ['tecnico', 'comercial', 'financeiro'];
        if (!in_array($categoria, $categoriasPermitidas)) {
            sendResponse('erro', 'Categoria inválida', null, 400);
        }
        
        $userId = getUserId();
        
        $data = [
            'id_usuario' => $userId,
            'categoria' => $categoria,
            'assunto' => $assunto,
            'descricao' => $descricao
        ];
        
        $chamadoId = $this->suporte->create($data);
        
        if ($chamadoId) {
            $chamado = $this->suporte->findById($chamadoId, $userId);
            
            sendResponse('ok', 'Chamado aberto com sucesso', [
                'chamado' => $chamado
            ], 201);
        } else {
            logError("Erro ao criar chamado para usuário: $userId");
            sendResponse('erro', 'Erro ao abrir chamado. Tente novamente.', null, 500);
        }
    }
    
    /**
     * Visualizar detalhes do chamado
     */
    public function view() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if ($id <= 0) {
            sendResponse('erro', 'ID do chamado é obrigatório', null, 400);
        }
        
        $userId = getUserId();
        $chamado = $this->suporte->findById($id, $userId);
        
        if (!$chamado) {
            sendResponse('erro', 'Chamado não encontrado', null, 404);
        }
        
        sendResponse('ok', 'Detalhes do chamado', [
            'chamado' => $chamado
        ]);
    }
}

