<?php
/**
 * Rotas de Produtos
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../controllers/ProdutoController.php';

enableCORS();

$controller = new ProdutoController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        $controller->list();
        break;
        
    case 'view':
        $controller->view();
        break;
        
    case 'categorias':
        $controller->categorias();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

