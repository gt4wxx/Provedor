<?php
/**
 * Ponto de entrada principal da API
 * Roteador principal que direciona requisições para os controllers apropriados
 */

// Incluir configurações
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/helpers.php';

// Habilitar CORS
enableCORS();

// Obter a rota da requisição
$requestUri = $_SERVER['REQUEST_URI'];
$scriptName = $_SERVER['SCRIPT_NAME'];
$basePath = dirname($scriptName);

// Remover query string da URI (mas manter para processar depois)
$uri = parse_url($requestUri, PHP_URL_PATH);

// Debug: log para desenvolvimento
if (defined('APP_DEBUG') && APP_DEBUG) {
    error_log("Request URI: " . $requestUri);
    error_log("Script Name: " . $scriptName);
    error_log("Base Path: " . $basePath);
    error_log("URI antes do processamento: " . $uri);
    error_log("GET params: " . print_r($_GET, true));
}

// Remover o base path da URI
if ($basePath !== '/' && $basePath !== '') {
    $uri = str_replace($basePath, '', $uri);
}

// Limpar URI
$uri = trim($uri, '/');

// Debug: log para desenvolvimento
if (defined('APP_DEBUG') && APP_DEBUG) {
    error_log("URI após processamento: " . $uri);
}

// Inicializar variável de rota
$route = '';

// PRIORIDADE 1: Verificar se há parâmetro 'route' no GET (index.php?route=auth&action=login)
if (isset($_GET['route']) && !empty($_GET['route'])) {
    $route = trim($_GET['route']);
    if (defined('APP_DEBUG') && APP_DEBUG) {
        error_log("Rota detectada via GET: " . $route);
        error_log("GET params: " . print_r($_GET, true));
    }
} 
// PRIORIDADE 2: Se não houver rota na URI, verificar se estamos acessando index.php
else if (empty($uri) || $uri === 'index.php' || basename($requestUri) === 'index.php' || strpos($requestUri, 'index.php') !== false) {
    // Se acessar diretamente index.php sem rota, mostrar documentação
    sendResponse('ok', 'API do Sistema de Provedor de Internet', [
        'version' => '1.0.0',
        'base_url' => APP_URL,
        'endpoints' => [
            'auth' => [
                'POST /auth?action=login ou POST /index.php?route=auth&action=login' => 'Realizar login',
                'POST /auth?action=register ou POST /index.php?route=auth&action=register' => 'Registrar novo usuário',
                'GET /auth?action=logout ou GET /index.php?route=auth&action=logout' => 'Fazer logout',
                'GET /auth?action=check ou GET /index.php?route=auth&action=check' => 'Verificar autenticação'
            ],
            'usuario' => [
                'GET /usuario?action=me ou GET /index.php?route=usuario&action=me' => 'Obter dados do usuário logado',
                'POST /usuario?action=update ou POST /index.php?route=usuario&action=update' => 'Atualizar dados do usuário'
            ],
            'planos' => [
                'GET /planos?action=list ou GET /index.php?route=planos&action=list' => 'Listar planos disponíveis',
                'POST /planos?action=subscribe ou POST /index.php?route=planos&action=subscribe' => 'Assinar plano',
                'GET /planos?action=current ou GET /index.php?route=planos&action=current' => 'Obter plano atual'
            ],
            'faturas' => [
                'GET /faturas?action=list ou GET /index.php?route=faturas&action=list' => 'Listar faturas',
                'GET /faturas?action=view&id=1 ou GET /index.php?route=faturas&action=view&id=1' => 'Detalhar fatura',
                'POST /faturas?action=pay ou POST /index.php?route=faturas&action=pay' => 'Pagar fatura'
            ],
            'suporte' => [
                'GET /suporte?action=list ou GET /index.php?route=suporte&action=list' => 'Listar chamados',
                'POST /suporte?action=abrir ou POST /index.php?route=suporte&action=abrir' => 'Abrir chamado',
                'GET /suporte?action=view&id=1 ou GET /index.php?route=suporte&action=view&id=1' => 'Detalhar chamado'
            ],
            'produtos' => [
                'GET /produtos?action=list ou GET /index.php?route=produtos&action=list' => 'Listar produtos',
                'GET /produtos?action=list&categoria=celular ou GET /index.php?route=produtos&action=list&categoria=celular' => 'Listar por categoria',
                'GET /produtos?action=view&id=1 ou GET /index.php?route=produtos&action=view&id=1' => 'Detalhar produto',
                'GET /produtos?action=categorias ou GET /index.php?route=produtos&action=categorias' => 'Listar categorias'
            ]
        ]
    ]);
}
// PRIORIDADE 3: Tentar extrair rota da URI (URL amigável: /auth?action=login)
else {
    // Dividir URI em partes
    $uriParts = explode('/', $uri);
    
    // Detectar rota (primeira parte da URI após o base path)
    $route = isset($uriParts[0]) ? $uriParts[0] : '';
}

// Mapeamento de rotas para arquivos
$routes = [
    'auth' => __DIR__ . '/../routes/auth.php',
    'usuario' => __DIR__ . '/../routes/usuario.php',
    'planos' => __DIR__ . '/../routes/planos.php',
    'faturas' => __DIR__ . '/../routes/faturas.php',
    'suporte' => __DIR__ . '/../routes/suporte.php',
    'produtos' => __DIR__ . '/../routes/produtos.php',
];

// Debug: log da rota detectada
if (defined('APP_DEBUG') && APP_DEBUG) {
    error_log("Rota final detectada: " . $route);
    error_log("Rotas disponíveis: " . implode(', ', array_keys($routes)));
}

// Verificar se rota existe
if (!empty($route) && isset($routes[$route])) {
    $routeFile = $routes[$route];
    
    if (file_exists($routeFile)) {
        if (defined('APP_DEBUG') && APP_DEBUG) {
            error_log("Carregando arquivo de rota: " . $routeFile);
        }
        require_once $routeFile;
    } else {
        if (defined('APP_DEBUG') && APP_DEBUG) {
            error_log("Arquivo de rota não encontrado: " . $routeFile);
        }
        sendResponse('erro', 'Arquivo de rota não encontrado', ['route' => $route, 'file' => $routeFile], 404);
    }
} else {
    // Tentar carregar diretamente como arquivo de rota
    if (!empty($route)) {
        $routeFile = __DIR__ . '/../routes/' . $route . '.php';
        
        if (file_exists($routeFile)) {
            if (defined('APP_DEBUG') && APP_DEBUG) {
                error_log("Carregando arquivo de rota diretamente: " . $routeFile);
            }
            require_once $routeFile;
        } else {
            if (defined('APP_DEBUG') && APP_DEBUG) {
                error_log("Arquivo de rota não encontrado (tentativa direta): " . $routeFile);
            }
            sendResponse('erro', 'Rota não encontrada', [
                'route' => $route,
                'available_routes' => array_keys($routes),
                'request_uri' => $requestUri,
                'uri' => $uri,
                'base_path' => $basePath
            ], 404);
        }
    } else {
        sendResponse('erro', 'Rota não especificada', [
            'request_uri' => $requestUri,
            'uri' => $uri,
            'base_path' => $basePath,
            'get_params' => $_GET
        ], 404);
    }
}

