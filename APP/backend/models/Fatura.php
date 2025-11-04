<?php
/**
 * Model de Fatura
 */

require_once __DIR__ . '/../utils/helpers.php';

class Fatura {
    private $conn;
    
    public function __construct() {
        $this->conn = getDatabaseConnection();
    }
    
    /**
     * Listar faturas do usuário
     * @param int $idUsuario
     * @param int|null $limit
     * @return array
     */
    public function listByUser($idUsuario, $limit = null) {
        $idUsuario = (int)$idUsuario;
        
        $sql = "SELECT f.*, p.nome as plano_nome, p.velocidade 
                FROM faturas f
                LEFT JOIN planos p ON f.id_plano = p.id
                WHERE f.id_usuario = ? 
                ORDER BY f.vencimento DESC";
        
        if ($limit !== null) {
            $sql .= " LIMIT " . (int)$limit;
        }
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $idUsuario);
        $stmt->execute();
        
        $result = $stmt->get_result();
        
        $faturas = [];
        
        if ($result && $result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                // Atualizar status se necessário
                $this->updateStatusIfNeeded($row);
                $faturas[] = $row;
            }
        }
        
        return $faturas;
    }
    
    /**
     * Buscar fatura por ID
     * @param int $id
     * @param int|null $idUsuario Verificar se fatura pertence ao usuário
     * @return array|null
     */
    public function findById($id, $idUsuario = null) {
        $id = (int)$id;
        
        $sql = "SELECT f.*, p.nome as plano_nome, p.velocidade 
                FROM faturas f
                LEFT JOIN planos p ON f.id_plano = p.id
                WHERE f.id = ?";
        
        $params = [$id];
        $types = "i";
        
        if ($idUsuario !== null) {
            $sql .= " AND f.id_usuario = ?";
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
     * Criar nova fatura
     * @param array $data
     * @return int|false ID da fatura criada ou false
     */
    public function create($data) {
        $idUsuario = (int)$data['id_usuario'];
        $valor = (float)$data['valor'];
        $vencimento = $this->conn->real_escape_string($data['vencimento']);
        $status = isset($data['status']) ? $this->conn->real_escape_string($data['status']) : 'pendente';
        
        $idPlano = isset($data['id_plano']) ? (int)$data['id_plano'] : null;
        $referencia = isset($data['referencia']) ? $this->conn->real_escape_string($data['referencia']) : null;
        $arquivoPdf = isset($data['arquivo_pdf']) ? $this->conn->real_escape_string($data['arquivo_pdf']) : null;
        
        $sql = "INSERT INTO faturas (id_usuario, id_plano, valor, status, vencimento, referencia, arquivo_pdf) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("iidssss", $idUsuario, $idPlano, $valor, $status, $vencimento, $referencia, $arquivoPdf);
        
        if ($stmt->execute()) {
            return $this->conn->insert_id;
        }
        
        return false;
    }
    
    /**
     * Atualizar status da fatura
     * @param int $id
     * @param string $status
     * @return bool
     */
    public function updateStatus($id, $status) {
        $id = (int)$id;
        $status = $this->conn->real_escape_string($status);
        
        $dataPagamento = null;
        if ($status === 'paga') {
            $dataPagamento = date('Y-m-d');
        }
        
        $sql = "UPDATE faturas SET status = ?, data_pagamento = ? WHERE id = ?";
        
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ssi", $status, $dataPagamento, $id);
        
        return $stmt->execute();
    }
    
    /**
     * Atualizar status se vencimento passou
     * @param array $fatura
     */
    private function updateStatusIfNeeded(&$fatura) {
        $hoje = date('Y-m-d');
        $vencimento = $fatura['vencimento'];
        
        if ($fatura['status'] === 'pendente' && $vencimento < $hoje) {
            $this->updateStatus($fatura['id'], 'atrasada');
            $fatura['status'] = 'atrasada';
        }
    }
}

