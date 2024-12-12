import multer from 'multer';

// 配置上传文件存储到内存中
const storage = multer.memoryStorage();

export const upload = multer({ storage });