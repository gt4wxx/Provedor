-- Script de Seed - Dados de Teste
-- Execute este script após criar o banco de dados com schema.sql
-- Use este script para adicionar/atualizar dados de teste
-- 
-- CREDENCIAIS DE TESTE:
-- Email: admin@provedor.com | Senha: 123456
-- Email: joao.silva@email.com | Senha: 123456

USE provedor_internet;

-- Inserir ou atualizar usuário de teste padrão (admin@provedor.com / 123456)
-- Hash da senha "123456" gerado com password_hash('123456', PASSWORD_DEFAULT)
INSERT INTO usuarios (nome, email, cpf, telefone, senha, plano_atual, status) 
VALUES (
    'Admin Teste', 
    'admin@provedor.com', 
    '000.000.000-00', 
    '(11) 99999-9999', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    2, 
    'ativo'
)
ON DUPLICATE KEY UPDATE 
    nome = VALUES(nome),
    senha = VALUES(senha),
    status = 'ativo';

-- Inserir usuário adicional para testes (joao.silva@email.com / 123456)
INSERT INTO usuarios (nome, email, cpf, telefone, senha, plano_atual, status) 
VALUES (
    'João Silva', 
    'joao.silva@email.com', 
    '111.111.111-11', 
    '(11) 98888-8888', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 
    2, 
    'ativo'
)
ON DUPLICATE KEY UPDATE 
    nome = VALUES(nome),
    senha = VALUES(senha),
    status = 'ativo';

-- Verificar usuários criados
SELECT id, nome, email, status FROM usuarios WHERE status = 'ativo';

