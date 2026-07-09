// src/domain/entities/product.ts
import { randomUUID } from 'crypto';

export interface ProductProps {
  id?: string;
  tenantId: string;
  name: string;
  description?: string | null;
  price: number;
  stock?: number;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private _id: string;
  private _tenantId: string;
  private _name: string;
  private _description: string | null;
  private _price: number; // Sempre em centavos
  private _stock: number;
  private _isActive: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: ProductProps) {
    this.validate(props);

    this._id = props.id ?? randomUUID();
    this._tenantId = props.tenantId;
    this._name = props.name.trim();
    this._description = props.description ?? null;
    this._price = props.price;
    this._stock = props.stock ?? 0;
    this._isActive = props.isActive ?? true;
    this._createdAt = props.createdAt ?? new Date();
    this._updatedAt = props.updatedAt ?? new Date();
  }

  /**
   * Cria um NOVO produto (usado quando a requisição vem do Controller/Usuário)
   */
  public static create(
    props: Omit<ProductProps, 'id' | 'createdAt' | 'updatedAt'>,
  ): Product {
    return new Product(props);
  }

  /**
   * Restaura um produto EXISTENTE (usado quando buscamos do Prisma/Banco de Dados)
   */
  public static restore(props: ProductProps): Product {
    return new Product(props);
  }

  private validate(props: ProductProps): void {
    if (!props.name || props.name.trim().length === 0) {
      throw new Error('O nome do produto é obrigatório.');
    }
    if (props.price < 0) {
      throw new Error('O preço do produto não pode ser negativo.');
    }
  }

  // Getters para encapsulamento (ninguém altera as propriedades diretamente de fora)
  get id(): string {
    return this._id;
  }
  get tenantId(): string {
    return this._tenantId;
  }
  get name(): string {
    return this._name;
  }
  get description(): string | null {
    return this._description;
  }
  get price(): number {
    return this._price;
  }
  get stock(): number {
    return this._stock;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get createdAt(): Date {
    return this._createdAt;
  }
  get updatedAt(): Date {
    return this._updatedAt;
  }

  // Ações de Domínio
  public deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  public activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public changePrice(newPriceInCents: number): void {
    if (newPriceInCents < 0)
      throw new Error('O preço do produto não pode ser negativo.');
    this._price = newPriceInCents;
    this._updatedAt = new Date();
  }
}
