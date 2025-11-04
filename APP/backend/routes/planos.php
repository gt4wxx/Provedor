<?php
/**
 * Rotas de Planos
 */

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/helpers.php';
require_once __DIR__ . '/../controllers/PlanoController.php';

enableCORS();

$controller = new PlanoController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'list':
        $controller->list();
        break;
        
    case 'subscribe':
        $controller->subscribe();
        break;
        
    case 'current':
        $controller->current();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

