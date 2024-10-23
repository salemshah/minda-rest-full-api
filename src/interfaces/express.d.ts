import { Child, Parent } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      parent: Parent;
      child: Child;
    }
  }
}
