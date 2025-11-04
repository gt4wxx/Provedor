<?php
/**
 * Model de Plano
 */

require_once __DIR__ . '/../utils/helpers.php';

class Plano {
    private $conn;
    
    public function __construct() {
        $this->conn = getDatabaseConnection();
    }
    
    /**
     * Listar todos os planos ativos
     * @return array
     */
    public function listAll() {
        $sql = "SELECT * FROM planos WHERE status = 'ativo' ORDER BY preco ASC";
        $result = $this->conn->query($sql);
        
        $planos = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Decodificar features JSON
                if (!empty($row['features'])) {
                    $row['features'] = json_decode($row['features'], true);
                } else {
                    $row['features'] = [];
                }
                
                $planos[] = $row;
            }
        }
        
        return $planos;
    }
    
    /**
     * Buscar plano por ID
     * @param int $id
     * @return array|null
     */
    public function findById($id) {
        $id = (int)$id;
        
        $sql = "SELECT * FROM planos WHERE id = ? AND status = 'ativo' LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $plano = $result->fetch_assoc();
            
            // Decodificar features JSON
            if (!empty($plano['features'])) {
                $plano['features'] = json_decode($plano['features'], true);
            } else {
                $plano['features'] = [];
            }
            
            return $plano;
        }
        
        return null;
    }
    
    /**
     * Criar assinatura de plano
     * @param int $idUsuario
     * @param int $idPlano
     * @return bool
     */
    public function subscribe($idUsuario, $idPlano) {
        $idUsuario = (int)$idUsuario;
        $idPlano = (int)$idPlano;
        
        // Verificar se plano existe
        $plano = $this->findById($idPlano);
        if (!$plano) {
            return false;
        }
        
        // Desativar assinaturas anteriores do usuário
        $sqlCancel = "UPDATE assinaturas SET status = 'cancelada' WHERE id_usuario = ? AND status = 'ativa'";
        $stmtCancel = $this->conn->prepare($sqlCancel);
        $stmtCancel->bind_param("i", $idUsuario);
        $stmtCancel->execute();
        
        // Criar nova assinatura
        $sql = "INSERT INTO assinaturas (id_usuario, id_plano, data_assinatura, status) 
                VALUES (?, ?, CURDATE(), 'ativa')";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $idUsuario, $idPlano);
        
        if ($stmt->execute()) {
            // Atualizar plano_atual do usuário
            require_once __DIR__ . '/Usuario.php';
            $usuario = new Usuario();
            $usuario->update($idUsuario, ['plano_atual' => $idPlano]);
            
            return true;
        }
        
        return false;
    }
    
    /**
     * Obter plano atual do usuário
     * @param int $idUsuario
     * @return array|null
     */
    public function getCurrentPlan($idUsuario) {
        $idUsuario = (int)$idUsuario;
        
        $sql = "SELECT p.* 
                FROM planos p
                INNER JOIN usuarios u ON u.plano_atual = p.id
                WHERE u.id = ? AND p.status = 'ativo'
                LIMIT 1";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        if ($result->num_rows === 1) {
            $plano = $result->fetch_assoc();
            
            if (!empty($plano['features'])) {
                $plano['features'] = json_decode($plano['features'], true);
            } else {
                $plano['features'] = [];
            }
            
            return $plano;
        }
        
        return null;
    }
}

