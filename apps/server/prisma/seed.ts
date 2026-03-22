/**
 * 文件说明：数据库种子脚本。
 * 功能说明：初始化超级管理员、基础角色和权限，便于第一阶段直接登录验证。
 *
 * 结构概览：
 *   第一部分：导入依赖
 *   第二部分：种子数据
 *   第三部分：执行入口
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 文件说明：本地环境变量加载器。
 * 功能说明：为直接执行 ts-node 种子脚本时补充 .env 读取，避免运行时拿不到 DATABASE_URL。
 *
 * 结构概览：
 *   第一部分：定位 .env 文件
 *   第二部分：按行解析并写入 process.env
 */
function loadLocalEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^"(.*)"$/, '$1');

    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const prisma = new PrismaClient();

const permissions = [
  ['dashboard:view', '查看看板', 'dashboard', 'view'],
  ['user:view', '查看用户', 'user', 'view'],
  ['user:create', '创建用户', 'user', 'create'],
  ['user:edit', '编辑用户', 'user', 'edit'],
  ['role:view', '查看角色', 'role', 'view'],
  ['role:edit', '编辑角色', 'role', 'edit'],
  ['log:view', '查看日志', 'log', 'view'],
  ['customer:view', '查看客户', 'customer', 'view'],
  ['customer:create', '创建客户', 'customer', 'create'],
  ['customer:edit', '编辑客户', 'customer', 'edit'],
  ['order:view', '查看订单', 'order', 'view'],
  ['order:create', '创建订单', 'order', 'create'],
  ['order:edit', '编辑订单', 'order', 'edit'],
  ['shipment:view', '查看发货', 'shipment', 'view'],
  ['shipment:create', '创建发货', 'shipment', 'create'],
  ['shipment:edit', '编辑发货', 'shipment', 'edit'],
  ['product:view', '查看产品', 'product', 'view'],
  ['followup:view', '查看回访', 'followup', 'view'],
  ['followup:create', '创建回访', 'followup', 'create'],
  ['followup:edit', '编辑回访', 'followup', 'edit'],
  ['member:view', '查看会员', 'member', 'view'],
  ['member:create', '创建会员', 'member', 'create'],
  ['member:edit', '编辑会员', 'member', 'edit'],
  ['partner:view', '查看伙伴', 'partner', 'view'],
  ['partner:create', '创建伙伴', 'partner', 'create'],
  ['partner:edit', '编辑伙伴', 'partner', 'edit'],
  ['task:view', '查看任务', 'task', 'view'],
  ['task:edit', '编辑任务', 'task', 'edit'],
  ['content-asset:view', '查看素材', 'content-asset', 'view'],
  ['content-asset:create', '创建素材', 'content-asset', 'create'],
  ['content-asset:edit', '编辑素材', 'content-asset', 'edit'],
  ['settings:view', '查看设置', 'settings', 'view'],
  ['settings:edit', '编辑设置', 'settings', 'edit'],
] as const;

async function seedDemoData(adminId: string) {
  const customerCount = await prisma.customer.count();
  if (customerCount > 0) {
    return;
  }

  const now = new Date();
  const day = 24 * 60 * 60 * 1000;

  const customerA = await prisma.customer.create({
    data: {
      customerNo: 'C-DEMO-001',
      name: '林岚',
      mobile: '13800000001',
      wechatId: 'linlan_demo',
      sourceChannel: 'wechat_chat',
      customerType: 'personal',
      identityTag: '高复购家庭',
      interestTags: ['厨房清洁', '家居护理'],
      lifecycleStage: '已首购',
      firstContactAt: new Date(now.getTime() - 12 * day),
      firstOrderAt: new Date(now.getTime() - 10 * day),
      lastOrderAt: new Date(now.getTime() - 10 * day),
      purchaseCount: 1,
      totalAmount: 168,
      followupStatus: '回访中',
      nextFollowupAt: new Date(now.getTime() + 1 * day),
      remarks: '演示客户：适合查看待回访和复购链路',
      createdBy: adminId,
    },
  });

  const customerB = await prisma.customer.create({
    data: {
      customerNo: 'C-DEMO-002',
      name: '周宁',
      mobile: '13800000002',
      wechatId: 'zhou_ning_demo',
      sourceChannel: 'xiaohongshu',
      customerType: 'personal',
      identityTag: '会员候选',
      interestTags: ['衣物护理'],
      lifecycleStage: '会员',
      firstContactAt: new Date(now.getTime() - 25 * day),
      firstOrderAt: new Date(now.getTime() - 22 * day),
      lastOrderAt: new Date(now.getTime() - 5 * day),
      purchaseCount: 2,
      totalAmount: 356,
      isMember: true,
      followupStatus: '已跟进',
      remarks: '演示客户：适合查看会员链路',
      createdBy: adminId,
    },
  });

  const customerC = await prisma.customer.create({
    data: {
      customerNo: 'C-DEMO-003',
      name: '陈拓',
      mobile: '13800000003',
      wechatId: 'chentuo_demo',
      sourceChannel: 'taobao',
      customerType: 'partner_intent',
      identityTag: '代理意向',
      interestTags: ['进口周边', '家庭清洁'],
      lifecycleStage: '代理意向',
      firstContactAt: new Date(now.getTime() - 18 * day),
      firstOrderAt: new Date(now.getTime() - 15 * day),
      lastOrderAt: new Date(now.getTime() - 15 * day),
      purchaseCount: 1,
      totalAmount: 299,
      hasPartnerIntent: true,
      followupStatus: '待跟进',
      nextFollowupAt: new Date(now.getTime() + 2 * day),
      remarks: '演示客户：适合查看伙伴转化链路',
      createdBy: adminId,
    },
  });

  const orderA = await prisma.order.create({
    data: {
      orderNo: 'O-DEMO-001',
      customerId: customerA.id,
      orderDate: new Date(now.getTime() - 10 * day),
      orderChannel: '私域成交',
      totalAmount: 168,
      paymentStatus: '已收款',
      paymentMethod: '微信',
      shipmentMode: '自营发货',
      shipmentStatus: '已发货',
      signStatus: '待签收',
      aftersaleStatus: '无售后',
      followupStatus: '回访中',
      isFollowedUp: true,
      remarks: '演示订单：待继续回访',
      createdBy: adminId,
    },
  });

  const orderB = await prisma.order.create({
    data: {
      orderNo: 'O-DEMO-002',
      customerId: customerB.id,
      orderDate: new Date(now.getTime() - 22 * day),
      orderChannel: '小程序',
      totalAmount: 199,
      paymentStatus: '已收款',
      paymentMethod: '小程序支付',
      shipmentMode: '自营发货',
      shipmentStatus: '已签收',
      signStatus: '已签收',
      signedAt: new Date(now.getTime() - 19 * day),
      aftersaleStatus: '无售后',
      followupStatus: '已完成',
      isFollowedUp: true,
      isRepurchaseCandidate: true,
      remarks: '演示订单：已完成回访',
      createdBy: adminId,
    },
  });

  const orderC = await prisma.order.create({
    data: {
      orderNo: 'O-DEMO-003',
      customerId: customerC.id,
      orderDate: new Date(now.getTime() - 15 * day),
      orderChannel: '淘宝',
      totalAmount: 299,
      paymentStatus: '已收款',
      paymentMethod: '淘宝支付',
      shipmentMode: '供应商代发',
      shipmentStatus: '待发货',
      signStatus: '待签收',
      aftersaleStatus: '无售后',
      followupStatus: '未开始',
      isPartnerCandidate: true,
      remarks: '演示订单：待发货',
      createdBy: adminId,
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: orderA.id,
      shipmentNo: 'S-DEMO-001',
      logisticsCompany: '顺丰',
      trackingNo: 'SF-DEMO-001',
      shipmentMode: '自营发货',
      shipmentStatus: '已发货',
      shippedAt: new Date(now.getTime() - 8 * day),
      responsibleId: adminId,
      remarks: '演示发货记录',
    },
  });

  await prisma.shipment.create({
    data: {
      orderId: orderB.id,
      shipmentNo: 'S-DEMO-002',
      logisticsCompany: '京东',
      trackingNo: 'JD-DEMO-002',
      shipmentMode: '自营发货',
      shipmentStatus: '已签收',
      shippedAt: new Date(now.getTime() - 21 * day),
      signedAt: new Date(now.getTime() - 19 * day),
      responsibleId: adminId,
      remarks: '演示签收记录',
    },
  });

  await prisma.followup.create({
    data: {
      followupNo: 'F-DEMO-001',
      orderId: orderA.id,
      customerId: customerA.id,
      shippedAt: new Date(now.getTime() - 8 * day),
      firstFollowupAt: new Date(now.getTime() - 7 * day),
      firstResult: '反馈良好',
      secondFollowupAt: new Date(now.getTime() - 2 * day),
      secondResult: '有复购意向',
      satisfactionScore: 5,
      isRepurchaseFit: true,
      expectedRepurchaseAt: new Date(now.getTime() + 5 * day),
      hasRepurchase: false,
      convertedToMember: false,
      hasPartnerIntent: false,
      responsibleId: adminId,
      remarks: '演示回访：待复购跟进',
      createdBy: adminId,
    },
  });

  await prisma.followup.create({
    data: {
      followupNo: 'F-DEMO-002',
      orderId: orderB.id,
      customerId: customerB.id,
      shippedAt: new Date(now.getTime() - 21 * day),
      signedAt: new Date(now.getTime() - 19 * day),
      firstFollowupAt: new Date(now.getTime() - 18 * day),
      firstResult: '反馈良好',
      secondFollowupAt: new Date(now.getTime() - 16 * day),
      secondResult: '可邀请会员',
      thirdFollowupAt: new Date(now.getTime() - 10 * day),
      thirdResult: '已联系',
      satisfactionScore: 5,
      isRepurchaseFit: true,
      expectedRepurchaseAt: new Date(now.getTime() + 2 * day),
      hasRepurchase: false,
      convertedToMember: true,
      hasPartnerIntent: false,
      responsibleId: adminId,
      remarks: '演示回访：会员转化样例',
      createdBy: adminId,
    },
  });

  await prisma.followup.create({
    data: {
      followupNo: 'F-DEMO-003',
      orderId: orderC.id,
      customerId: customerC.id,
      satisfactionScore: 4,
      isRepurchaseFit: false,
      hasRepurchase: false,
      convertedToMember: false,
      hasPartnerIntent: true,
      responsibleId: adminId,
      remarks: '演示回访：伙伴意向样例',
      createdBy: adminId,
    },
  });

  await prisma.member.create({
    data: {
      memberNo: 'M-DEMO-001',
      customerId: customerB.id,
      joinedAt: new Date(now.getTime() - 9 * day),
      status: '有效',
      level: '轻会员',
      source: '客户转化',
      purchaseCount: 2,
      totalAmount: 356,
      lastOrderAt: new Date(now.getTime() - 5 * day),
      benefitStatus: '已开通',
      responsibleId: adminId,
      remarks: '演示会员',
    },
  });

  await prisma.partner.create({
    data: {
      partnerNo: 'P-DEMO-001',
      customerId: customerC.id,
      name: '陈拓',
      mobile: '13800000003',
      wechatId: 'chentuo_demo',
      region: '杭州',
      identityType: '代理意向',
      sourceType: '客户转化',
      status: '沟通中',
      attendedTraining: false,
      activationStatus: '未激活',
      responsibleId: adminId,
      remarks: '演示伙伴',
      createdBy: adminId,
    },
  });

  await prisma.contentAsset.create({
    data: {
      assetNo: 'A-DEMO-001',
      assetDate: new Date(now.getTime() - 1 * day),
      sourceType: 'followup',
      customerType: 'personal',
      painPoint: '厨房油污难清理',
      customerQuote: '希望一瓶能把重油污和异味都处理掉。',
      usageScenario: '厨房台面与油烟机外壳',
      feedbackResult: '反馈良好',
      contentAngle: '高频家务减负',
      titleHook: '厨房油污总擦不干净？这套组合省一半时间',
      targetPlatform: 'xiaohongshu',
      contentFormat: '图文',
      isPublished: false,
      remarks: '演示内容素材',
      createdBy: adminId,
    },
  });

  const taskBaseDate = new Date(now.getTime() + day);

  await prisma.task.createMany({
    data: [
      {
        taskNo: 'T-DEMO-001',
        taskType: 'FOLLOWUP_PENDING',
        title: '第三次回访：F-DEMO-001',
        description: '演示待办：请继续确认客户复购时间。',
        status: 'OPEN',
        priority: 2,
        sourceType: 'order',
        sourceId: orderA.id,
        dueAt: taskBaseDate,
        responsibleId: adminId,
        createdBy: adminId,
        payload: {
          followupId: 'F-DEMO-001',
          customerId: customerA.id,
          stage: 'third',
        },
      },
      {
        taskNo: 'T-DEMO-002',
        taskType: 'SHIPMENT_PENDING',
        title: '待发货：O-DEMO-003',
        description: '演示待办：请安排这笔淘宝订单发货。',
        status: 'OPEN',
        priority: 1,
        sourceType: 'order',
        sourceId: orderC.id,
        dueAt: new Date(now.getTime() + 2 * day),
        responsibleId: adminId,
        createdBy: adminId,
        payload: {
          orderId: orderC.id,
          customerId: customerC.id,
        },
      },
      {
        taskNo: 'T-DEMO-003',
        taskType: 'MEMBER_REVIEW',
        title: '审核会员转化：F-DEMO-002',
        description: '演示待办：该客户已满足会员转化条件。',
        status: 'IN_REVIEW',
        priority: 2,
        sourceType: 'followup',
        sourceId: 'F-DEMO-002',
        dueAt: new Date(now.getTime() + 3 * day),
        responsibleId: adminId,
        reviewedAt: now,
        createdBy: adminId,
        payload: {
          customerId: customerB.id,
        },
      },
    ],
  });
}

async function main() {
  for (const [code, name, module, action] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: { name, module, action },
      create: { code, name, module, action },
    });
  }

  const roles = [
    { code: 'SUPER_ADMIN', name: '超级管理员', dataScope: 'ALL' },
    { code: 'OPERATOR', name: '运营管理员', dataScope: 'ALL' },
    { code: 'SERVICE', name: '客服', dataScope: 'OWNED' },
    { code: 'WAREHOUSE', name: '仓储协同', dataScope: 'OWNED' },
    { code: 'PARTNER', name: '代理/分销', dataScope: 'OWNED' },
    { code: 'READONLY', name: '只读角色', dataScope: 'READONLY' },
  ] as const;

  for (const roleItem of roles) {
    await prisma.role.upsert({
      where: { code: roleItem.code },
      update: {
        name: roleItem.name,
        dataScope: roleItem.dataScope,
      },
      create: roleItem,
    });
  }

  const allPermissions = await prisma.permission.findMany();
  const superAdminRole = await prisma.role.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  if (superAdminRole) {
    await prisma.rolePermission.deleteMany({
      where: { roleId: superAdminRole.id },
    });

    await prisma.rolePermission.createMany({
      data: allPermissions.map((permission) => ({
        roleId: superAdminRole.id,
        permissionId: permission.id,
      })),
    });
  }

  const passwordHash = await bcrypt.hash('Admin123456', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {
      realName: '系统管理员',
      passwordHash,
      status: 'ENABLED',
    },
    create: {
      username: 'admin',
      realName: '系统管理员',
      passwordHash,
      status: 'ENABLED',
    },
  });

  if (superAdminRole) {
    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    });
  }

  const defaultConfigs = [
    ['source_channel', 'taobao', '淘宝'],
    ['source_channel', 'miniprogram', '小程序'],
    ['source_channel', 'xiaohongshu', '小红书'],
    ['source_channel', 'wechat_chat', '微信私聊'],
    ['source_channel', 'wecom', '企业微信'],
    ['customer_type', 'personal', '个人客户'],
    ['customer_type', 'family', '家庭客户'],
    ['customer_type', 'enterprise', '企业客户'],
    ['customer_type', 'partner_intent', '潜在代理'],
    ['product_category', 'cleaning', '清洁类'],
    ['product_category', 'care', '护理类'],
    ['product_category', 'imported', '严选进口周边'],
    ['content_platform', 'xiaohongshu', '小红书'],
    ['content_platform', 'wechat_moments', '朋友圈'],
    ['content_platform', 'video_channel', '视频号'],
    ['content_platform', 'official_account', '公众号'],
  ] as const;

  for (const [configType, configKey, label] of defaultConfigs) {
    await prisma.systemConfig.upsert({
      where: {
        configType_configKey: {
          configType,
          configKey,
        },
      },
      update: {
        configValue: {
          label,
          value: configKey,
        },
        status: 'ENABLED',
      },
      create: {
        configType,
        configKey,
        configValue: {
          label,
          value: configKey,
        },
        status: 'ENABLED',
      },
    });
  }

  await seedDemoData(admin.id);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
