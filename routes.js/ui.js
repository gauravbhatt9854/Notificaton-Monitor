import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

router.use(express.static(path.join(__dirname, 'public')));

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..' ,'public', 'homepage.html'));
});

export default router;