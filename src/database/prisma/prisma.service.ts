import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    this.$extends({
      model: {
        $allModels: {
          async delete<M, A>(
            this: M,
            where: Prisma.Args<M, 'delete'>,
          ): Promise<Prisma.Result<M, A, 'update'>> {
            const context = Prisma.getExtensionContext(this);

            if (!('deletedAt' in (context as any).fields)) {
              return (context as any).delete(where);
            }

            return (context as any).update({
              ...where,
              data: { deletedAt: new Date() },
            });
          },
        },
      },
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
