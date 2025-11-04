<?php
/**
 * Controller de Fatura
 */

require_once __DIR__ . '/../models/Fatura.php';
require_once __DIR__ . '/../utils/helpers.php';

class FaturaController {
    private $fatura;
    
    public function __construct() {
        $this->fatura = new Fatura();
        requireLogin();
    }
    
    /**
     * Listar faturas do usuário
     */
    public function list() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $userId = getUserId();
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
        
        $faturas = $this->fatura->listByUser($userId, $limit);
        
        sendResponse('ok', 'Faturas listadas com sucesso', [
            'faturas' => $faturas
        ]);
    }
    
    /**
     * Visualizar detalhes da fatura
     */
    public function view() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if ($id <= 0) {
            sendResponse('erro', 'ID da fatura é obrigatório', null, 400);
        }
        
        $userId = getUserId();
        $fatura = $this->fatura->findById($id, $userId);
        
        if (!$fatura) {
            sendResponse('erro', 'Fatura não encontrada', null, 404);
        }
        
        sendResponse('ok', 'Detalhes da fatura', [
            'fatura' => $fatura
        ]);
    }
    
    /**
     * Pagar fatura
     */
    public function pay() {
        $method = getRequestMethod();
        
        if ($method !== 'POST') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $input = getJsonInput();
        
        if (!$input) {
            $input = $_POST;
        }
        
        $id = isset($input['id']) ? (int)$input['id'] : 0;
        
        if ($id <= 0) {
            sendResponse('erro', 'ID da fatura é obrigatório', null, 400);
        }
        
        $userId = getUserId();
        $fatura = $this->fatura->findById($id, $userId);
        
        if (!$fatura) {
            sendResponse('erro', 'Fatura não encontrada', null, 404);
        }
        
        if ($fatura['status'] === 'paga') {
            sendResponse('erro', 'Fatura já foi paga', null, 400);
        }
        
        // Atualizar status para paga
        if ($this->fatura->updateStatus($id, 'paga')) {
            $faturaAtualizada = $this->fatura->findById($id, $userId);
            
            sendResponse('ok', 'Fatura paga com sucesso', [
                'fatura' => $faturaAtualizada
            ]);
        } else {
            sendResponse('erro', 'Erro ao processar pagamento', null, 500);
        }
    }
}

