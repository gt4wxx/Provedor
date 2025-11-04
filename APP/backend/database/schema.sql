-- Schema do Banco de Dados - Sistema de Provedor de Internet
-- Execute este script no MySQL para criar as tabelas necessárias

CREATE DATABASE IF NOT EXISTS provedor_internet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE provedor_internet;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    cpf VARCHAR(20) DEFAULT NULL,
    telefone VARCHAR(20) DEFAULT NULL,
    senha VARCHAR(255) NOT NULL,
    plano_atual INT DEFAULT NULL,
    status ENUM('ativo', 'inativo', 'suspenso') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_plano_atual (plano_atual)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    velocidade VARCHAR(50) NOT NULL,
    velocidade_upload VARCHAR(50) DEFAULT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_antigo DECIMAL(10,2) DEFAULT NULL,
    descricao TEXT DEFAULT NULL,
    features TEXT DEFAULT NULL, -- JSON com lista de features
    badge VARCHAR(50) DEFAULT NULL, -- popular, recomendado, premium, ultra
    status ENUM('ativo', 'inativo') DEFAULT 'ativo',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Faturas
CREATE TABLE IF NOT EXISTS faturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_plano INT DEFAULT NULL,
    valor DECIMAL(10,2) NOT NULL,
    status ENUM('paga', 'pendente', 'atrasada') DEFAULT 'pendente',
    vencimento DATE NOT NULL,
    data_pagamento DATE DEFAULT NULL,
    referencia VARCHAR(50) DEFAULT NULL, -- Ex: "Novembro 2024"
    arquivo_pdf VARCHAR(255) DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_plano) REFERENCES planos(id) ON DELETE SET NULL,
    INDEX idx_usuario (id_usuario),
    INDEX idx_status (status),
    INDEX idx_vencimento (vencimento)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Chamados de Suporte
CREATE TABLE IF NOT EXISTS suporte (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    numero_chamado VARCHAR(20) UNIQUE NOT NULL,
    categoria ENUM('tecnico', 'comercial', 'financeiro') NOT NULL,
    assunto VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('aberto', 'em_andamento', 'resolvido', 'fechado') DEFAULT 'aberto',
    resposta TEXT DEFAULT NULL,
    resolvido_em TIMESTAMP NULL DEFAULT NULL,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_status (status),
    INDEX idx_numero_chamado (numero_chamado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Assinaturas de Planos (Histórico)
CREATE TABLE IF NOT EXISTS assinaturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_plano INT NOT NULL,
    data_assinatura DATE NOT NULL,
    data_vencimento DATE DEFAULT NULL,
    status ENUM('ativa', 'cancelada', 'vencida') DEFAULT 'ativa',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_plano) REFERENCES planos(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir dados de exemplo para planos
INSERT INTO planos (nome, velocidade, velocidade_upload, preco, preco_antigo, descricao, features, badge, status) VALUES
('Fibra 100MB', '100', '50', 79.90, 99.90, 'Plano básico de internet fibra óptica', '["Upload de 50MB", "WiFi incluso", "Suporte 24/7"]', 'popular', 'ativo'),
('Fibra 200MB', '200', '100', 119.90, 149.90, 'Plano recomendado com boa velocidade', '["Upload de 100MB", "WiFi incluso", "Suporte 24/7", "IP Fixo grátis"]', 'recomendado', 'ativo'),
('Fibra 500MB', '500', '250', 199.90, 249.90, 'Plano premium para quem precisa de mais velocidade', '["Upload de 250MB", "WiFi 6 incluído", "Suporte prioritário", "IP Fixo grátis", "Antivírus grátis"]', 'premium', 'ativo'),
('Fibra 1GB', '1000', '500', 299.90, 399.90, 'Plano ultra com máxima velocidade', '["Upload de 500MB", "WiFi 6 Pro", "Suporte VIP", "IP Fixo grátis", "Antivírus Premium", "Cloud Backup 100GB"]', 'ultra', 'ativo');

-- Inserir usuário de exemplo (senha: "123456")
-- Hash gerado com password_hash('123456', PASSWORD_DEFAULT)
INSERT INTO usuarios (nome, email, cpf, telefone, senha, plano_atual, status) VALUES
('João Silva', 'joao.silva@email.com', '000.000.000-00', '(11) 99999-9999', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 'ativo');

-- Inserir faturas de exemplo
INSERT INTO faturas (id_usuario, id_plano, valor, status, vencimento, referencia, data_pagamento) VALUES
(1, 2, 149.90, 'paga', '2024-11-15', 'Novembro 2024', '2024-11-14'),
(1, 2, 149.90, 'pendente', '2024-12-15', 'Dezembro 2024', NULL),
(1, 2, 149.90, 'atrasada', '2024-10-15', 'Outubro 2024', NULL),
(1, 2, 149.90, 'paga', '2024-09-15', 'Setembro 2024', '2024-09-14');

-- Inserir chamados de exemplo
INSERT INTO suporte (id_usuario, numero_chamado, categoria, assunto, descricao, status, resposta, resolvido_em) VALUES
(1, '12345', 'tecnico', 'Problema de conexão', 'Internet caindo frequentemente durante o dia', 'resolvido', 'Problema resolvido após troca do equipamento', '2024-11-12 10:30:00'),
(1, '12344', 'comercial', 'Alteração de plano', 'Gostaria de fazer upgrade para o plano de 500MB', 'em_andamento', NULL, NULL),
(1, '12343', 'financeiro', 'Dúvida sobre fatura', 'Não entendi alguns valores da minha fatura', 'resolvido', 'Valores explicados detalhadamente', '2024-11-06 14:20:00');

-- Tabela de Produtos (Celulares, Fones, etc)
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    categoria ENUM('celular', 'fone', 'tablet', 'acessorio', 'outros') NOT NULL,
    marca VARCHAR(100) DEFAULT NULL,
    descricao TEXT DEFAULT NULL,
    preco DECIMAL(10,2) NOT NULL,
    preco_antigo DECIMAL(10,2) DEFAULT NULL,
    imagem VARCHAR(255) DEFAULT NULL,
    estoque INT DEFAULT 0,
    destaque BOOLEAN DEFAULT FALSE,
    status ENUM('ativo', 'inativo', 'esgotado') DEFAULT 'ativo',
    especificacoes TEXT DEFAULT NULL, -- JSON com especificações
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_status (status),
    INDEX idx_destaque (destaque)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    numero_pedido VARCHAR(20) UNIQUE NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    status ENUM('pendente', 'pago', 'enviado', 'entregue', 'cancelado') DEFAULT 'pendente',
    forma_pagamento VARCHAR(50) DEFAULT NULL,
    endereco_entrega TEXT DEFAULT NULL,
    observacoes TEXT DEFAULT NULL,
    data_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_pagamento TIMESTAMP NULL DEFAULT NULL,
    data_envio TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    INDEX idx_usuario (id_usuario),
    INDEX idx_status (status),
    INDEX idx_numero_pedido (numero_pedido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS pedido_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT NOT NULL,
    id_produto INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    preco_unitario DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (id_pedido) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (id_produto) REFERENCES produtos(id) ON DELETE CASCADE,
    INDEX idx_pedido (id_pedido),
    INDEX idx_produto (id_produto)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir produtos de exemplo
INSERT INTO produtos (nome, categoria, marca, descricao, preco, preco_antigo, imagem, estoque, destaque, status, especificacoes) VALUES
('iPhone 15 Pro', 'celular', 'Apple', 'iPhone 15 Pro com chip A17 Pro, 128GB, Tela de 6.1 polegadas', 6999.90, 7999.90, '📱', 15, TRUE, 'ativo', '{"tela":"6.1 polegadas","memoria":"128GB","ram":"8GB","camera":"48MP"}'),
('Samsung Galaxy S24', 'celular', 'Samsung', 'Galaxy S24 Ultra com S Pen, 256GB, Tela Dynamic AMOLED', 5999.90, 6999.90, '📱', 20, TRUE, 'ativo', '{"tela":"6.8 polegadas","memoria":"256GB","ram":"12GB","camera":"200MP"}'),
('Xiaomi 14', 'celular', 'Xiaomi', 'Xiaomi 14 com Snapdragon 8 Gen 3, 256GB', 3499.90, 3999.90, '📱', 30, FALSE, 'ativo', '{"tela":"6.36 polegadas","memoria":"256GB","ram":"12GB","camera":"50MP"}'),
('AirPods Pro 2', 'fone', 'Apple', 'AirPods Pro 2ª geração com cancelamento ativo de ruído', 1999.90, 2499.90, '🎧', 50, TRUE, 'ativo', '{"cancela_ruido":"Sim","bateria":"6h + 24h estojo","bluetooth":"5.3"}'),
('Sony WH-1000XM5', 'fone', 'Sony', 'Fone over-ear com cancelamento de ruído premium', 2499.90, 2999.90, '🎧', 25, TRUE, 'ativo', '{"cancela_ruido":"Sim","bateria":"30h","bluetooth":"5.2"}'),
('JBL Tune 750BTNC', 'fone', 'JBL', 'Fone Bluetooth com cancelamento de ruído', 499.90, 699.90, '🎧', 40, FALSE, 'ativo', '{"cancela_ruido":"Sim","bateria":"15h","bluetooth":"5.0"}'),
('iPad Air 11"', 'tablet', 'Apple', 'iPad Air M2, 128GB, Tela de 11 polegadas', 5499.90, 5999.90, '📱', 10, FALSE, 'ativo', '{"tela":"11 polegadas","memoria":"128GB","processador":"M2"}'),
('Galaxy Tab S9', 'tablet', 'Samsung', 'Samsung Galaxy Tab S9, 256GB, S Pen incluso', 4499.90, 4999.90, '📱', 12, FALSE, 'ativo', '{"tela":"11 polegadas","memoria":"256GB","processador":"Snapdragon 8 Gen 2"}'),
('Carregador MagSafe', 'acessorio', 'Apple', 'Carregador MagSafe oficial Apple 15W', 349.90, 399.90, '🔌', 100, FALSE, 'ativo', '{"potencia":"15W","compativel":"iPhone 12+","tipo":"MagSafe"}'),
('Capa iPhone 15', 'acessorio', 'Spigen', 'Capa protetora para iPhone 15 Pro Max', 149.90, 199.90, '📱', 80, FALSE, 'ativo', '{"material":"Silicone","cor":"Transparente","protecao":"Drop teste"}');

