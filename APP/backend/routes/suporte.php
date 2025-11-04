<?php
/**
 * Rotas de Suporte
 */

require_once __DIR__ . '/../controllers/SuporteController.php';

$controller = new SuporteController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        $controller->list();
        break;
        
    case 'abrir':
        $controller->abrir();
        break;
        
    case 'view':
        $controller->view();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

