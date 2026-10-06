import { Controller, Get } from '@nestjs/common';
import { BranchesService } from './branches.service.js';

@Controller('branches')
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  list() {
    return this.branches.list();
  }
}
