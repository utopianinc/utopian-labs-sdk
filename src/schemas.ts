// src/schemas.ts
import { z } from "zod";

// Common schemas
export const zResponse = z.object({ _status: z.number().optional() });

export const zMetadata = z.record(z.any());

const LANGUAGE_CODES = [
  "en-US",
  "en-UK",
  "en-AU",
  "nl",
  "de",
  "lb",
  "fr",
  "es",
  "pt",
  "it",
  "gr",
  "ru",
  "tr",
  "da",
  "sv",
  "fi",
  "is",
  "no",
  "zh",
  "ja",
  "hi",
  "th",
  "vi",
  "my",
  "ko",
  "et",
  "lt",
  "lv",
  "mk",
  "id",
  "cs",
  "pl",
  "sl",
  "sk",
  "bg",
  "bs",
  "hu",
  "uk",
  "sr",
  "ro",
  "sq",
  "hy",
  "he",
  "ar",
] as const;

export type LanguageCode = (typeof LANGUAGE_CODES)[number];

export const zLanguageCode = z.enum(LANGUAGE_CODES, {
  message:
    "Language not recognized or supported; please contact support in case you'd like to add support for a language.",
});

const isValidDomainOrUrl = (value: string) => {
  // Check if it's already a valid URL
  try {
    new URL(value);
    return true;
  } catch {
    // Check if adding https:// makes it valid
    try {
      new URL(`https://${value}`);
      return true;
    } catch {
      return false;
    }
  }
};

const zPerson = z.object({
  full_name: z
    .string()
    .min(1, "full name is required")
    .max(100, "full name must be less than 100 characters"),
  linkedin_url: z
    .string()
    .max(500, "linkedin url must be less than 500 characters")
    .refine(isValidDomainOrUrl, "Please enter a valid URL or domain")
    .optional(),
  email: z
    .string()
    .email()
    .max(100, "email must be less than 100 characters")
    .optional(),
  job_title: z
    .string()
    .max(100, "job title must be less than 100 characters")
    .optional(),
});

const zCompany = z.object({
  website: z
    .string()
    .refine(isValidDomainOrUrl, "Please enter a valid URL or domain"),
  name: z
    .string()
    .max(100, "company name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(10_000, "company description must be less than 10,000 characters")
    .optional(),
});

export const zPostAgentRunBaseRequest = z.object({
  lead: z.object({
    company: zCompany,
    person: zPerson.optional(),
  }),
  user: z
    .object({
      company: zCompany,
      person: zPerson.optional(),
    })
    .optional(),
  events: z
    .array(
      z.object({
        description: z
          .string()
          .max(10_000, "event description must be less than 10,000 characters"), // a description of what happened
        timestamp_ms: z.number().optional(),
      })
    )
    .max(100, "you can only provide up to 100 events")
    .optional(),
  context: z
    .string()
    .max(10_000, "context must be less than 10,000 characters")
    .optional(), // free-format string, like a system prompt
  min_research_steps: z.number().min(0).max(20).optional(),
  max_research_steps: z.number().min(0).max(100).optional(),
  callback_url: z
    .string()
    .url()
    .refine((url) => {
      const allowedPatterns = ["https://integrations.utopianlabs.ai"];
      const blockedPatterns = [
        "localhost",
        "127.0.0.1",
        "utopianlabs",
        "utopian-labs",
        "luna.ai",
        "getluna.dev",
      ];
      return (
        allowedPatterns.some((pattern) =>
          url.toLowerCase().includes(pattern.toLowerCase())
        ) ||
        !blockedPatterns.some((pattern) =>
          url.toLowerCase().includes(pattern.toLowerCase())
        )
      );
    }, "This callback URL is not allowed")
    .optional(),
  use_memory: z.boolean().optional(), // if true, the agent will remember what it found in previous research runs
});

export const zPostResearchAgentRunRequest = zPostAgentRunBaseRequest.extend({
  agent: z.enum(["r1", "r1-light"]),
});

export const zPostQualifyingAgentRunRequest = zPostAgentRunBaseRequest.extend({
  agent: z.enum(["r1-qualification", "r1-qualification-light"]),
});

export const zPostCopywritingAgentRunRequest = zPostAgentRunBaseRequest.extend({
  agent: z.enum(["r1-copywriting", "r1-copywriting-light"]),
  language: zLanguageCode.optional().default("en-US"),
  sequence_length: z.number().int().min(1).max(10).optional().default(1),
});

export const zPostTimingAgentRunRequest = zPostAgentRunBaseRequest.extend({
  agent: z.enum(["r1-timing", "r1-timing-light"]),
});

export const zPostClassificationAgentRunRequest =
  zPostAgentRunBaseRequest.extend({
    agent: z.enum(["r1-classification", "r1-classification-light"]),
    options: z
      .array(
        z.object({
          name: z.string().min(1),
          description: z.string().optional(),
        })
      )
      .min(2, "you must provide at least 2 options")
      .max(10, "you can only provide up to 10 options"),
  });

export const zPostAgentRunRequestWithoutMetadata = z.discriminatedUnion(
  "agent",
  [
    zPostResearchAgentRunRequest,
    zPostQualifyingAgentRunRequest,
    zPostCopywritingAgentRunRequest,
    zPostTimingAgentRunRequest,
    zPostClassificationAgentRunRequest,
  ]
);

export const zPostAgentRunRequest = zPostAgentRunRequestWithoutMetadata.and(
  z.object({ metadata: zMetadata.optional() })
);

export const zPostAgentRunResponse = zResponse.extend({ id: z.string() });

export const zGetAgentRunRequest = z.object({
  agent: z
    .enum([
      "r1",
      "r1-light",
      "r1-qualification",
      "r1-qualification-light",
      "r1-copywriting",
      "r1-copywriting-light",
      "r1-timing",
      "r1-timing-light",
      "r1-classification",
      "r1-classification-light",
    ])
    .optional(),
  run: z.string(),
});

const zResearchStep = z.object({
  action: z.string(),
  outcome: z.string().optional(),
});

const zGetQueuedRunResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum([
    "r1",
    "r1-light",
    "r1-qualification",
    "r1-qualification-light",
    "r1-copywriting",
    "r1-copywriting-light",
    "r1-timing",
    "r1-timing-light",
    "r1-classification",
    "r1-classification-light",
  ]),
  status: z.literal("queued"),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetFailedRunResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum([
    "r1",
    "r1-light",
    "r1-qualification",
    "r1-qualification-light",
    "r1-copywriting",
    "r1-copywriting-light",
    "r1-timing",
    "r1-timing-light",
    "r1-classification",
    "r1-classification-light",
  ]),
  status: z.literal("failed"),
  error: z.string().optional(),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetResearchRunWithResultResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum(["r1", "r1-light"]),
  status: z.enum(["completed", "running"]),
  result: z.object({
    research: z
      .object({
        steps: z.array(zResearchStep),
        conclusion: z.string().optional(),
      })
      .nullish(),
  }),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetQualifyingRunWithResultResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum(["r1-qualification", "r1-qualification-light"]),
  status: z.enum(["completed", "running"]),
  result: z.object({
    research: zGetResearchRunWithResultResponse.shape.result.shape.research,
    qualification: z
      .object({
        score: z.enum(["high", "medium", "low"]),
        reason: z.string(),
      })
      .nullish(),
  }),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetTimingRunWithResultResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum(["r1-timing", "r1-timing-light"]),
  status: z.enum(["completed", "running"]),
  result: z.object({
    research: zGetResearchRunWithResultResponse.shape.result.shape.research,
    timing: z
      .object({
        score: z.enum(["high", "medium", "low"]),
        reason: z.string(),
      })
      .nullish(),
  }),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetCopywritingRunWithResultResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum(["r1-copywriting", "r1-copywriting-light"]),
  status: z.enum(["completed", "running"]),
  result: z.object({
    research: zGetResearchRunWithResultResponse.shape.result.shape.research,
    message: z
      .object({
        body: z
          .object({
            markdown: z.string(),
            html: z.string(),
          })
          .nullish(),
        subject: z.string().nullish(),
      })
      .nullish(),
    sequence: z
      .array(
        z.object({
          body: z
            .object({
              markdown: z.string(),
              html: z.string(),
            })
            .nullish(),
          subject: z.string().nullish(),
        })
      )
      .optional(),
  }),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetClassificationRunWithResultResponse = zResponse.extend({
  id: z.string(),
  agent: z.enum(["r1-classification", "r1-classification-light"]),
  status: z.enum(["completed", "running"]),
  result: z.object({
    research: zGetResearchRunWithResultResponse.shape.result.shape.research,
    classification: z
      .object({
        choice: z.string(), // will return "unknown" if the agent couldn't make a choice
        reason: z.string(),
      })
      .nullish(),
  }),
  metadata: zMetadata.optional(),
  created_at: z.number(),
});

const zGetRunWithResultResponse = z.discriminatedUnion("agent", [
  zGetResearchRunWithResultResponse,
  zGetQualifyingRunWithResultResponse,
  zGetCopywritingRunWithResultResponse,
  zGetTimingRunWithResultResponse,
  zGetClassificationRunWithResultResponse,
]);

export const zGetAgentRunResponse = zGetQueuedRunResponse
  .or(zGetFailedRunResponse)
  .or(zGetRunWithResultResponse);

export const zGetMeResponse = z.object({
  status: z.enum(["success", "error"]),
  orgName: z.string().optional(),
  error: z.string().optional(),
});

export type GetMeResponse = z.infer<typeof zGetMeResponse>;
