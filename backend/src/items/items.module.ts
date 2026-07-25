import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ItemsController } from './items.controller';
import { ItemsService } from './items.service';

@Module({
  imports: [HttpModule],
  controllers: [ItemsController],
  providers: [ItemsService],
})
export class ItemsModule {}
