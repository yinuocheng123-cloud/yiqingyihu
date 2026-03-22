/**
 * 文件说明：任务控制器。
 * 功能说明：提供待办列表和任务状态流转接口。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：控制器实现
 */
import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { PermissionCode } from '../../common/enums/permission.enum';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { BulkUpdateTasksDto } from './dto/bulk-update-tasks.dto';
import { QueryTasksDto } from './dto/query-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('inbox')
  @Permissions(PermissionCode.TaskView)
  findInbox(@Query() query: QueryTasksDto) {
    return this.tasksService.findInbox(query);
  }

  @Patch('bulk/status')
  @Permissions(PermissionCode.TaskEdit)
  bulkUpdate(@Body() dto: BulkUpdateTasksDto) {
    return this.tasksService.bulkUpdate(dto.ids, dto.status);
  }

  @Patch(':id')
  @Permissions(PermissionCode.TaskEdit)
  updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto);
  }

  @Patch(':id/status')
  @Permissions(PermissionCode.TaskEdit)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTaskStatusDto) {
    return this.tasksService.updateStatus(id, dto.status, dto.note);
  }
}
