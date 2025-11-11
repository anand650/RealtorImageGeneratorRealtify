declare module '@prisma/nextjs-monorepo-workaround-plugin' {
  import type { Compiler } from 'webpack';

  interface PrismaPluginOptions {
    [key: string]: unknown;
  }

  export class PrismaPlugin {
    constructor(options?: PrismaPluginOptions);
    apply(compiler: Compiler): void;
  }
}


