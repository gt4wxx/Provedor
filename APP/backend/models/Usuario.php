<?php
/**
 * Model de Usuário
 */

require_once __DIR__ . '/../utils/helpers.php';

class Usuario {
    private $conn;
    
    public function __construct() {
        $this->conn = getDatabaseConnection();
    }
    
    /**
     * Criar novo usuário
     * @param array $data
     * @return int|false ID do usuário criado ou false
     */
    public function create($data) {
        $nome = $this->conn->real_escape_string($data['nome']);
        $email = $this->conn->real_escape_string($data['email']);
        $senha = password_hash($data['senha'], PASSWORD_DEFAULT);
        
        $cpf = isset($data['cpf']) ? $this->conn->real_escape_string($data['cpf']) : null;
        $telefone = isset($data['telefone']) ? $this->conn->real_escape_string($data['telefone']) : null;
        
        $sql = "INSERT INTO usuarios (nome, email, cpf, telefone, senha) 
                VALUES (?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("sssss", $nome, $email, $cpf, $telefone, $senha);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Buscar usuário por email
     * @param string $email
     * @return array|null
     */
    public function findByEmail($email) {
        $email = $this->conn->real_escape_string($email);
        
        $sql = "SELECT id, nome, email, cpf, telefone, senha, plano_atual, status 
                FROM usuarios 
                WHERE email = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("s", $email);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    /**
     * Buscar usuário por ID
     * @param int $id
     * @return array|null
     */
    public function findById($id) {
        $id = (int)$id;
        
        $sql = "SELECT id, nome, email, cpf, telefone, plano_atual, status, criado_em 
                FROM usuarios 
                WHERE id = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $user = $result->fetch_assoc();
            unset($user['senha']); // Remover senha da resposta
            return $user;
        }
        
        return null;
    }
    
    /**
     * Atualizar dados do usuário
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update($id, $data) {
        $id = (int)$id;
        
        $fields = [];
        $values = [];
        $types = '';
        
        if (isset($data['nome'])) {
            $fields[] = "nome = ?";
            $values[] = $this->conn->real_escape_string($data['nome']);
            $types .= 's';
        }
        
        if (isset($data['email'])) {
            $fields[] = "email = ?";
            $values[] = $this->conn->real_escape_string($data['email']);
            $types .= 's';
        }
        
        if (isset($data['cpf'])) {
            $fields[] = "cpf = ?";
            $values[] = $this->conn->real_escape_string($data['cpf']);
            $types .= 's';
        }
        
        if (isset($data['telefone'])) {
            $fields[] = "telefone = ?";
            $values[] = $this->conn->real_escape_string($data['telefone']);
            $types .= 's';
        }
        
        if (isset($data['senha']) && !empty($data['senha'])) {
            $fields[] = "senha = ?";
            $values[] = password_hash($data['senha'], PASSWORD_DEFAULT);
            $types .= 's';
        }
        
        if (isset($data['plano_atual'])) {
            $fields[] = "plano_atual = ?";
            $values[] = (int)$data['plano_atual'];
            $types .= 'i';
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $types .= 'i';
        
        $sql = "UPDATE usuarios SET " . implode(", ", $fields) . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        return $stmt->execute();
    }
    
    /**
     * Verificar se email já existe
     * @param string $email
     * @param int|null $excludeId ID do usuário a excluir da verificação
     * @return bool
     */
    public function emailExists($email, $excludeId = null) {
        $email = $this->conn->real_escape_string($email);
        
        $sql = "SELECT COUNT(*) as count FROM usuarios WHERE email = ?";
        $params = [$email];
        $types = "s";
        
        if ($excludeId !== null) {
            $sql .= " AND id != ?";
            $params[] = (int)$excludeId;
            $types .= "i";
        }
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        return $row['count'] > 0;
    }
}

