import { Controller, Get, Param, Query } from '@nestjs/common';
import { ListPublicCatalogUseCase } from '../../../application/use-cases/list-public-catalog.use-case';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly listPublicCatalog: ListPublicCatalogUseCase) {}

  @Get(':slug')
  async getCatalog(
    @Param('slug') slug: string,
    @Query('search') search?: string, // 👈 Recebe a pesquisa da URL (ex: ?search=cerveja)
  ) {
    return this.listPublicCatalog.execute(slug, search);
  }
}
