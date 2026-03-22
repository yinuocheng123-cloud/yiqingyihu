/**
 * 文件说明：系统权限码定义。
 * 功能说明：集中维护首批后台模块的权限编码，避免散落硬编码。
 *
 * 结构概览：
 *   第一部分：权限枚举
 */
export enum PermissionCode {
  DashboardView = 'dashboard:view',
  UserView = 'user:view',
  UserCreate = 'user:create',
  UserEdit = 'user:edit',
  RoleView = 'role:view',
  RoleEdit = 'role:edit',
  LogView = 'log:view',
  CustomerView = 'customer:view',
  CustomerCreate = 'customer:create',
  CustomerEdit = 'customer:edit',
  OrderView = 'order:view',
  OrderCreate = 'order:create',
  OrderEdit = 'order:edit',
  ShipmentView = 'shipment:view',
  ShipmentCreate = 'shipment:create',
  ShipmentEdit = 'shipment:edit',
  ProductView = 'product:view',
  FollowupView = 'followup:view',
  FollowupCreate = 'followup:create',
  FollowupEdit = 'followup:edit',
  MemberView = 'member:view',
  MemberCreate = 'member:create',
  MemberEdit = 'member:edit',
  PartnerView = 'partner:view',
  PartnerCreate = 'partner:create',
  PartnerEdit = 'partner:edit',
  TaskView = 'task:view',
  TaskEdit = 'task:edit',
  ContentAssetView = 'content-asset:view',
  ContentAssetCreate = 'content-asset:create',
  ContentAssetEdit = 'content-asset:edit',
  SettingsView = 'settings:view',
  SettingsEdit = 'settings:edit',
}
