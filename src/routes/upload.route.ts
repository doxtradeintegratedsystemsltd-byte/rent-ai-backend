import { Router } from 'express';
import { Container } from 'typedi';
import { UploadModule } from '../modules/Upload.module';
import { UploadController } from '../controllers/Upload.controller';

const router = Router();

const controller = Container.get(UploadController);
const uploadModule = Container.get(UploadModule);

router.post(
  '/single',
  uploadModule.uploads.single('file'),
  (req, res, next) => {
    controller.uploadOneFile(req, res, next);
  }
);

router.post('/multi', uploadModule.uploads.array('files'), (req, res, next) => {
  controller.uploadMultiFiles(req, res, next);
});

const UploadRoutes = router;
export default UploadRoutes;
