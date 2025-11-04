<?php
/**
 * Rotas de Usuário
 */

require_once __DIR__ . '/../controllers/UsuarioController.php';

$controller = new UsuarioController();
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'me':
        $controller->me();
        break;
        
    case 'update':
        $controller->update();
        break;
        
    default:
        sendResponse('erro', 'Ação não encontrada', null, 404);
        break;
}

