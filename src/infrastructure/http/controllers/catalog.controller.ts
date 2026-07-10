import { Controller, Get, Param } from '@nestjs/common';
import { ListPublicCatalogUseCase } from '../../../application/use-cases/list-public-catalog.use-case';

@Controller('catalog') // Rota base: /catalog
export class CatalogController {
  constructor(private readonly listPublicCatalog: ListPublicCatalogUseCase) {}

  @Get(':slug') // Rota: GET /catalog/nome-da-loja
  async getCatalog(@Param('slug') slug: string) {
    return this.listPublicCatalog.execute(slug);
  }
}
