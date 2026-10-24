import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe';
import { CreateStudentDto } from './dto/create-student.dto';
import { ListStudentsQueryDto } from './dto/list-students-query.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentEntity, StudentListEntity } from './entities/student.entity';
import { StudentsService } from './students.service';

@ApiTags('students')
@Controller('students')
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Post()
  create(@Body() dto: CreateStudentDto): Promise<StudentEntity> {
    return this.students.create(dto);
  }

  @Get()
  findAll(@Query() query: ListStudentsQueryDto): Promise<StudentListEntity> {
    return this.students.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIdPipe) id: number): Promise<StudentEntity> {
    return this.students.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIdPipe) id: number,
    @Body() dto: UpdateStudentDto,
  ): Promise<StudentEntity> {
    return this.students.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIdPipe) id: number): Promise<void> {
    return this.students.remove(id);
  }
}
