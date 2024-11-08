import logger from 'pino';
// @ts-ignore
import dayjs from "dayjs";

/// logger
// @ts-ignore
const log = logger({
        base: {
            pid: false,
        },
        transport: {
            target: 'pino-pretty',
            options: {
                colorize: true
            }
        },
        timestamp: () => `, "time": "${dayjs().format()}"`,
    }
);

export default log;