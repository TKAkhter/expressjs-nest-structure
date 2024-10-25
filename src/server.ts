import app from './app';
import { logger } from './common/winston/winston';

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));