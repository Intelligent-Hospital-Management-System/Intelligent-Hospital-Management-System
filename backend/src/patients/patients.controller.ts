import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  UnauthorizedException,
  ForbiddenException
} from '@nestjs/common';
import { PatientsService } from './patients.service';
import { Patient } from './patient.interface';
import { FirebaseService } from '../firebase/firebase.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patientsService: PatientsService, private readonly firebaseService: FirebaseService,) {}
  private getRole(email?: string): 'professor' | 'student' {
  return email === 'florenciavarelasc@gmail.com'
    ? 'professor'
    : 'student';
}
  @Get()
  async findAll(
  @Headers('authorization') authorization?: string,
): Promise<Patient[]> {
  if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token no enviado');
  }

  const token = authorization.substring(7);

  try {
    const decodedToken = await this.firebaseService.verifyToken(token);
    const role = this.getRole(decodedToken.email);

    if (role !== 'professor' && role !== 'student') {
    throw new ForbiddenException('Rol no autorizado');
  }

    return this.patientsService.findAll();
  } catch (error) {
    if (error instanceof ForbiddenException) {
      throw error;
  } 
    throw new UnauthorizedException('Token inválido');
  }}

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientsService.findOne(id);
  }

  @Post()
  async create(
  @Body() patient: Partial<Patient>,
  @Headers('authorization') authorization?: string,
): Promise<Patient> {
  if (!authorization?.startsWith('Bearer ')) {
  throw new UnauthorizedException('Token no enviado');
}

const token = authorization.substring(7);

try {
  const decodedToken = await this.firebaseService.verifyToken(token);
  const role = this.getRole(decodedToken.email);

  if (role !== 'professor') {
    throw new ForbiddenException(
      'Solo los profesores pueden crear pacientes',
    );
  }

  return this.patientsService.create(patient);
} catch (error) {
  if (error instanceof ForbiddenException) {
    throw error;
  }

  throw new UnauthorizedException('Token inválido');
}}

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
  async remove(@Param('id') id: string, 
  @Headers('authorization') authorization?: string, 
  ): Promise<{ message: string }> {
    if (!authorization?.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token no enviado');
  }
const token = authorization.substring(7);
const decodedToken = await this.firebaseService.verifyToken(token);
const role = this.getRole(decodedToken.email);

    if (role !== 'professor') {
    throw new ForbiddenException(
    'Solo los profesores pueden eliminar pacientes',
  );
}
    return this.patientsService.remove(id);
}
}