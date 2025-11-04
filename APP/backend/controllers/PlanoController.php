<?php
/**
 * Controller de Plano
 */

require_once __DIR__ . '/../models/Plano.php';
require_once __DIR__ . '/../utils/helpers.php';

class PlanoController {
    private $plano;
    
    public function __construct() {
        $this->plano = new Plano();
    }
    
    /**
     * Listar todos os planos
     */
    public function list() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $planos = $this->plano->listAll();
        
        sendResponse('ok', 'Planos listados com sucesso', [
            'planos' => $planos
        ]);
    }
    
    /**
     * Assinar plano
     */
    public function subscribe() {
        $method = getRequestMethod();
        
        if ($method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        requireLogin();
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $idPlano = isset($input['id_plano']) ? (int)$input['id_plano'] : 0;
        
        if ($idPlano <= 0) {
            sendResponse('erro', 'ID do plano é obrigatório', null, 400);
        }
        
        // Verificar se plano existe
        $plano = $this->plano->findById($idPlano);
        
        if (!$plano) {
            sendResponse('erro', 'Plano não encontrado', null, 404);
        }
        
        $userId = getUserId();
        
        // Assinar plano
        if ($this->plano->subscribe($userId, $idPlano)) {
            sendResponse('ok', 'Plano assinado com sucesso', [
                'plano' => $plano
            ]);
        } else {
            sendResponse('erro', 'Erro ao assinar plano', null, 500);
        }
    }
    
    /**
     * Obter plano atual do usuário
     */
    public function current() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        requireLogin();
        
        $userId = getUserId();
        $plano = $this->plano->getCurrentPlan($userId);
        
        if ($plano) {
            sendResponse('ok', 'Plano atual', [
                'plano' => $plano
            ]);
        } else {
            sendResponse('erro', 'Nenhum plano contratado', null, 404);
        }
    }
}

