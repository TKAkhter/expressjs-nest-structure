import corsLibrary from "cors";

const allowedOrigins = (process.env.ALLOW_ORIGIN || "").split(",");

export const config = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    "origin": (origin: string | undefined, callback: any) => {

        if (!origin || allowedOrigins.includes(origin)) {

            callback(null, true);

        } else {

            callback(new Error("Not allowed by CORS"));

        }

    },
    "optionsSuccessStatus": 200,
    "methods": "GET,HEAD,OPTIONS,PUT,POST,DELETE",
    "credentials": true,
    "exposedHeaders": ["Content-Type", "set-cookie"],
    "options": {
        "Access-Control-Allow-Origin": process.env.ALLOW_ORIGIN || "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
        "Access-Control-Allow-Methods": "GET,HEAD,OPTIONS,PUT,POST,DELETE"
    }
};

export const cors = corsLibrary(config);

export default { cors, config };
