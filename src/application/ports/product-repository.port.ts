// Responsabilidade: Definir o contrato que qualquer banco de dados deve cumprir para salvar um produto

export interface ProductRepositoryPort {
  save(product: any): Promise<void>;
  // No futuro, adicionaremos findByBarcode, findById, etc.
}
