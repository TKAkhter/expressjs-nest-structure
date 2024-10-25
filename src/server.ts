import app from "./app";
import { logger } from "./common/winston/winston";

const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV;

app.listen(PORT, () => logger.info(`Server running ==> PORT: ${PORT} ==> ENV: ${ENV}`));
