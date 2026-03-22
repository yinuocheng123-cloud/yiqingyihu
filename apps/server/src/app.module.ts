/**
 * 文件说明：服务端根模块。
 * 功能说明：统一装配配置、数据库和当前首批业务模块。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：模块装配
 */
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { LogsModule } from './modules/logs/logs.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OrdersModule } from './modules/orders/orders.module';
import { FollowupsModule } from './modules/followups/followups.module';
import { MembersModule } from './modules/members/members.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { PartnersModule } from './modules/partners/partners.module';
import { ContentAssetsModule } from './modules/content-assets/content-assets.module';
import { SettingsModule } from './modules/settings/settings.module';
import { TasksModule } from './modules/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    RolesModule,
    LogsModule,
    CustomersModule,
    OrdersModule,
    FollowupsModule,
    MembersModule,
    DashboardModule,
    ShipmentsModule,
    PartnersModule,
    ContentAssetsModule,
    SettingsModule,
    TasksModule,
  ],
})
export class AppModule {}
