<?php
/**
 * Rotas de Autenticação
 */

require_once __DIR__ . '/../controllers/AuthController.php';

$controller = new AuthController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        $controller->login();
        break;
        
    case 'register':
        $controller->register();
        break;
        
    case 'logout':
        $controller->logout();
        break;
        
    case 'check':
        $controller->checkAuth();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

