import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { AuthUser } from '../auth/types/auth-user.js';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { ManageAppointments } from './appointments.constants.js';
import { AppointmentsService } from './appointments.service.js';
import { CreateAppointmentDto } from './dto/create-appointment.dto.js';
import { ListAppointmentsQueryDto } from './dto/list-appointments.dto.js';
import { UpdateAppointmentDto } from './dto/update-appointment.dto.js';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointments: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointments.create(dto);
  }

  @Get()
  @ManageAppointments()
  list(
    @Query() query: ListAppointmentsQueryDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.appointments.list(query, actor);
  }

  @Get(':appointmentID')
  @ManageAppointments()
  findOne(
    @Param('appointmentID') appointmentID: string,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.appointments.findOne(appointmentID, actor);
  }

  @Patch(':appointmentID')
  @ManageAppointments()
  update(
    @Param('appointmentID') appointmentID: string,
    @Body() dto: UpdateAppointmentDto,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.appointments.update(appointmentID, dto, actor);
  }

  @Post(':appointmentID/confirm')
  @ManageAppointments()
  confirm(
    @Param('appointmentID') appointmentID: string,
    @CurrentUser() actor: AuthUser,
  ) {
    return this.appointments.confirm(appointmentID, actor);
  }
}
