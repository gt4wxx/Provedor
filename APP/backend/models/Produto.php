<?php
/**
 * Model de Produto
 */

require_once __DIR__ . '/../utils/helpers.php';

class Produto {
    private $conn;
    
    public function __construct() {
        $this->conn = getDatabaseConnection();
    }
    
    /**
     * Listar todos os produtos
     * @param string|null $categoria Filtrar por categoria
     * @param bool $destaque Apenas produtos em destaque
     * @return array
     */
    public function listAll($categoria = null, $destaque = false) {
        $sql = "SELECT * FROM produtos WHERE status = 'ativo'";
        
        $params = [];
        $types = '';
        
        if ($categoria) {
            $sql .= " AND categoria = ?";
            $params[] = $this->conn->real_escape_string($categoria);
            $types .= 's';
        }
        
        if ($destaque) {
            $sql .= " AND destaque = 1";
        }
        
        $sql .= " ORDER BY destaque DESC, criado_em DESC";
        
        if (!empty($params)) {
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $result = $stmt->get_result();
        } else {
            $result = $this->conn->query($sql);
        }
        
        $produtos = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Decodificar especificações JSON
                if (!empty($row['especificacoes'])) {
                    $row['especificacoes'] = json_decode($row['especificacoes'], true);
                } else {
                    $row['especificacoes'] = [];
                }
                
                $produtos[] = $row;
            }
        }
        
        return $produtos;
    }
    
    /**
     * Buscar produto por ID
     * @param int $id
     * @return array|null
     */
    public function findById($id) {
        $id = (int)$id;
        
        $sql = "SELECT * FROM produtos WHERE id = ? AND status = 'ativo' LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $produto = $result->fetch_assoc();
            
            // Decodificar especificações JSON
            if (!empty($produto['especificacoes'])) {
                $produto['especificacoes'] = json_decode($produto['especificacoes'], true);
            } else {
                $produto['especificacoes'] = [];
            }
            
            return $produto;
        }
        
        return null;
    }
    
    /**
     * Verificar estoque disponível
     * @param int $id
     * @param int $quantidade
     * @return bool
     */
    public function checkStock($id, $quantidade) {
        $id = (int)$id;
        $quantidade = (int)$quantidade;
        
        $sql = "SELECT estoque FROM produtos WHERE id = ? AND status = 'ativo'";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $produto = $result->fetch_assoc();
            return $produto['estoque'] >= $quantidade;
        }
        
        return false;
    }
    
    /**
     * Atualizar estoque após venda
     * @param int $id
     * @param int $quantidade
     * @return bool
     */
    public function updateStock($id, $quantidade) {
        $id = (int)$id;
        $quantidade = (int)$quantidade;
        
        $sql = "UPDATE produtos SET estoque = estoque - ? WHERE id = ? AND estoque >= ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iii", $quantidade, $id, $quantidade);
        
        return $stmt->execute();
    }
}

