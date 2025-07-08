import { Router } from 'express';

interface TController {
  getAll(req: any, res: any, next: any): void;
  getOne(req: any, res: any, next: any): void;
}

export function generateGetterRoutes(router: Router, controller: TController) {
  router.get('/', (req, res, next) => {
    controller.getAll(req, res, next);
  });

  router.get('/:id', (req, res, next) => {
    controller.getOne(req, res, next);
  });
}
