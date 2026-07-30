import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './patient.interface';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Get()
  async findAll(): Promise<Patient[]> {
    return this.patientsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  async create(@Body() patient: Partial<Patient>): Promise<Patient> {
    return this.patientsService.create(patient);
  }

  @Put(':id')
  async replace(
    @Param('id') id: string,
    @Body() patient: Partial<Patient>,
  ): Promise<Patient> {
    return this.patientsService.replace(id, patient);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() patient: Partial<Patient>,
  ): Promise<Patient> {
    return this.patientsService.update(id, patient);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.patientsService.remove(id);
  }
}
