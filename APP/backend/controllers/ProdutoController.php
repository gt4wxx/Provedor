<?php
/**
 * Controller de Produto
 */

require_once __DIR__ . '/../models/Produto.php';
require_once __DIR__ . '/../utils/helpers.php';

class ProdutoController {
    private $produto;
    
    public function __construct() {
        $this->produto = new Produto();
    }
    
    /**
     * Listar todos os produtos
     */
    public function list() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $categoria = isset($_GET['categoria']) ? sanitizeInput($_GET['categoria']) : null;
        $destaque = isset($_GET['destaque']) && $_GET['destaque'] === 'true';
        
        $produtos = $this->produto->listAll($categoria, $destaque);
        
        sendResponse('ok', 'Produtos listados com sucesso', [
            'produtos' => $produtos,
            'total' => count($produtos)
        ]);
    }
    
    /**
     * Buscar produto por ID
     */
    public function view() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if ($id <= 0) {
            sendResponse('erro', 'ID do produto é obrigatório', null, 400);
        }
        
        $produto = $this->produto->findById($id);
        
        if (!$produto) {
            sendResponse('erro', 'Produto não encontrado', null, 404);
        }
        
        sendResponse('ok', 'Produto encontrado', [
            'produto' => $produto
        ]);
    }
    
    /**
     * Listar categorias disponíveis
     */
    public function categorias() {
        $method = getRequestMethod();
        
        if ($method !== 'GET') {
            sendResponse('erro', 'Método não permitido', null, 405);
        }
        
        $categorias = [
            ['value' => 'celular', 'label' => 'Celulares', 'icon' => '📱'],
            ['value' => 'fone', 'label' => 'Fones de Ouvido', 'icon' => '🎧'],
            ['value' => 'tablet', 'label' => 'Tablets', 'icon' => '📱'],
            ['value' => 'acessorio', 'label' => 'Acessórios', 'icon' => '🔌'],
            ['value' => 'outros', 'label' => 'Outros', 'icon' => '📦']
        ];
        
        sendResponse('ok', 'Categorias listadas', [
            'categorias' => $categorias
        ]);
    }
}

