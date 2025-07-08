import envConfig from '../configs/envConfig';

const isProduction = envConfig.NODE_ENV === 'production';
export default isProduction;