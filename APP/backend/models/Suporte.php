<?php
/**
 * Model de Suporte/Chamado
 */

require_once __DIR__ . '/../utils/helpers.php';

class Suporte {
    private $conn;
    
    public function __construct() {
        $this->conn = getDatabaseConnection();
    }
    
    /**
     * Criar novo chamado
     * @param array $data
     * @return int|false ID do chamado criado ou false
     */
    public function create($data) {
        $idUsuario = (int)$data['id_usuario'];
        $categoria = $this->conn->real_escape_string($data['categoria']);
        $assunto = $this->conn->real_escape_string($data['assunto']);
        $descricao = $this->conn->real_escape_string($data['descricao']);
        
        // Gerar número único do chamado
        $numeroChamado = $this->generateUniqueNumber();
        
        $sql = "INSERT INTO suporte (id_usuario, numero_chamado, categoria, assunto, descricao, status) 
                VALUES (?, ?, ?, ?, ?, 'aberto')";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("issss", $idUsuario, $numeroChamado, $categoria, $assunto, $descricao);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Listar chamados do usuário
     * @param int $idUsuario
     * @return array
     */
    public function listByUser($idUsuario) {
        $idUsuario = (int)$idUsuario;
        
        $sql = "SELECT * FROM suporte 
                WHERE id_usuario = ? 
                ORDER BY data_abertura DESC";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        $chamados = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $chamados[] = $row;
            }
        }
        
        return $chamados;
    }
    
    /**
     * Buscar chamado por ID
     * @param int $id
     * @param int|null $idUsuario Verificar se chamado pertence ao usuário
     * @return array|null
     */
    public function findById($id, $idUsuario = null) {
        $id = (int)$id;
        
        $sql = "SELECT * FROM suporte WHERE id = ?";
        
        $params = [$id];
        $types = "i";
        
        if ($idUsuario !== null) {
            $sql .= " AND id_usuario = ?";
            $params[] = (int)$idUsuario;
            $types .= "i";
        }
        
        $sql .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            return $result->fetch_assoc();
        }
        
        return null;
    }
    
    /**
     * Atualizar chamado
     * @param int $id
     * @param array $data
     * @return bool
     */
    public function update($id, $data) {
        $id = (int)$id;
        
        $fields = [];
        $values = [];
        $types = '';
        
        if (isset($data['status'])) {
            $fields[] = "status = ?";
            $values[] = $this->conn->real_escape_string($data['status']);
            $types .= 's';
            
            if ($data['status'] === 'resolvido') {
                $fields[] = "resolvido_em = NOW()";
            }
        }
        
        if (isset($data['resposta'])) {
            $fields[] = "resposta = ?";
            $values[] = $this->conn->real_escape_string($data['resposta']);
            $types .= 's';
        }
        
        if (empty($fields)) {
            return false;
        }
        
        $values[] = $id;
        $types .= 'i';
        
        $sql = "UPDATE suporte SET " . implode(", ", $fields) . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param($types, ...$values);
        
        return $stmt->execute();
    }
    
    /**
     * Gerar número único de chamado
     * @return string
     */
    private function generateUniqueNumber() {
        $year = date('Y');
        $number = '';
        $attempts = 0;
        
        do {
            $number = $year . str_pad(rand(1, 99999), 5, '0', STR_PAD_LEFT);
            $attempts++;
            
            // Verificar se já existe
            $sql = "SELECT COUNT(*) as count FROM suporte WHERE numero_chamado = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("s", $number);
            $stmt->execute();
            
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            
            if ($row['count'] == 0) {
                break;
            }
        } while ($attempts < 10);
        
        return $number;
    }
}

