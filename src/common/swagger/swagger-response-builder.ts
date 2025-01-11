import { ServiceResponseSchema } from "@/common/swagger/swagger-response";
import { StatusCodes } from "http-status-codes";
import type { z } from "zod";

export function createApiResponse(
  schema: z.ZodTypeAny,
  description: string,
  statusCode = StatusCodes.OK,
) {
  return {
    [statusCode]: {
      description,
      content: {
        "application/json": {
          schema: ServiceResponseSchema(schema),
        },
      },
    },
  };
}

// Use if you want multiple responses for a single endpoint

// Import { ResponseConfig } from '@asteasolutions/zod-to-openapi';
// Import { ApiResponseConfig } from '@common/models/openAPIResponseConfig';
// Export type ApiResponseConfig = {
//   Schema: z.ZodTypeAny;
//   Description: string;
//   StatusCode: StatusCodes;
// };
// Export function createApiResponses(configs: ApiResponseConfig[]) {
//   Const responses: { [key: string]: ResponseConfig } = {};
//   Configs.forEach(({ schema, description, statusCode }) => {
//     Responses[statusCode] = {
//       Description,
//       Content: {
//         'application/json': {
//           Schema: ServiceResponseSchema(schema),
//         },
//       },
//     };
//   });
//   Return responses;
// }
