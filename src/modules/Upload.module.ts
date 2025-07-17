import * as Cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import envConfig from '../configs/envConfig';
import { Service } from 'typedi';

@Service()
export class UploadModule {
  private cloudinary: typeof Cloudinary.v2;
  public uploads: multer.Multer;

  constructor() {
    this.setUpCloudinary();
  }

  private setUpCloudinary() {
    this.cloudinary = Cloudinary.v2;

    this.cloudinary.config({
      cloud_name: envConfig.CLOUDINARY_CLOUD_NAME,
      api_key: envConfig.CLOUDINARY_API_KEY,
      api_secret: envConfig.CLOUDINARY_API_SECRET,
    });

    const storage = new CloudinaryStorage({
      cloudinary: this.cloudinary,
      params: async (_req, _file) => {
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

  async uploadBase64File(base64: string, encoding?: string) {
    const finalString = `${encoding || ''}${base64}`;
    try {
      const result = await this.cloudinary.uploader.upload(finalString);

      return result.secure_url;
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }
}
