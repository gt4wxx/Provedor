<?php
/**
 * Rotas de Faturas
 */

require_once __DIR__ . '/../controllers/FaturaController.php';

$controller = new FaturaController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        $controller->list();
        break;
        
    case 'view':
        $controller->view();
        break;
        
    case 'pay':
        $controller->pay();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

