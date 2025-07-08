import * as Cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import envConfig from '../configs/envConfig';

export class UploadModule {
  private cloudinary: typeof Cloudinary.v2;
  public uploads: multer.Multer;

  constructor() {
    this.setUpCloudinary();
  }

  private setUpCloudinary() {
    this.cloudinary = Cloudinary.v2;

    this.cloudinary.config({
      // cloud_name: envConfig.cloudinaryCloudName,
      // api_key: envConfig.cloudinaryApiKey,
      // api_secret: envConfig.cloudinaryApiSecret,
    });

    const storage = new CloudinaryStorage({
      cloudinary: this.cloudinary,
      params: async () => {
        return {
          resource_type: 'auto',
        };
      },
    });

    this.uploads = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
    });
  }
}
