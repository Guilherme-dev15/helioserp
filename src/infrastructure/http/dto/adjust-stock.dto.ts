/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsIn, IsInt, IsPositive } from 'class-validator';

export class AdjustStockDto {
  @IsIn(['IN', 'OUT'], { message: 'O tipo deve ser IN ou OUT.' })
  type!: 'IN' | 'OUT';

  @IsInt({ message: 'A quantidade deve ser um número inteiro.' })
  @IsPositive({ message: 'A quantidade deve ser maior que zero.' })
  quantity!: number;
}
