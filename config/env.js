import 'dotenv/config';

export const ENV = {
  PORT: Number(process.env.PORT || 4000),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/schooldocs',
  UPLOAD_DIR: 'uploads',
};
