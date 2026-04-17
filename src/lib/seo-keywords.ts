/**
 * Centralized SEO keywords for every page on the site.
 *
 * Base keywords are appended to every page automatically.
 * Page-specific keywords are keyed by their URL path (without trailing slash).
 */

const BASE_KEYWORDS = [
  "Go",
  "Golang",
  "Gofasta",
  "web framework",
  "backend",
];

const PAGE_KEYWORDS: Record<string, string[]> = {
  // Landing
  "/": [
    "code generation",
    "scaffolding",
    "CLI",
    "REST API",
    "GraphQL",
    "Go web services",
    "production-ready",
  ],

  // Docs index
  "/docs": [
    "documentation",
    "API reference",
    "guides",
    "CLI reference",
  ],

  // White Paper
  "/docs/white-paper": [
    "white paper",
    "technical paper",
    "architecture",
    "design principles",
    "code generation",
    "dependency injection",
    "Google Wire",
    "GORM",
    "chi router",
    "compile-time DI",
    "scaffolding",
    "REST API",
    "GraphQL",
    "authentication",
    "JWT",
    "RBAC",
    "background jobs",
    "task queue",
    "asynq",
    "observability",
    "Prometheus",
    "OpenTelemetry",
    "circuit breaker",
    "resilience",
    "retry",
    "database migrations",
    "PostgreSQL",
    "MySQL",
    "SQLite",
    "deployment",
    "Docker",
    "Kubernetes",
    "CI/CD",
    "health checks",
    "middleware",
    "CORS",
    "rate limiting",
    "email",
    "notifications",
    "WebSocket",
    "caching",
    "Redis",
    "feature flags",
    "i18n",
    "encryption",
    "sessions",
    "file storage",
    "S3",
    "validation",
    "open source",
    "MIT license",
    "Go toolkit",
    "Go web services",
    "production-ready",
    "batteries-included",
  ],

  // Getting Started
  "/docs/getting-started/introduction": [
    "introduction",
    "getting started",
    "overview",
    "why Gofasta",
  ],
  "/docs/getting-started/installation": [
    "install",
    "setup",
    "CLI install",
    "Go install",
  ],
  "/docs/getting-started/quick-start": [
    "quick start",
    "tutorial",
    "first project",
    "hello world",
  ],
  "/docs/getting-started/project-structure": [
    "project structure",
    "directory layout",
    "folder structure",
    "project organization",
  ],

  // Guides
  "/docs/guides/rest-api": [
    "REST API",
    "HTTP handlers",
    "routes",
    "endpoints",
    "JSON API",
  ],
  "/docs/guides/graphql": [
    "GraphQL",
    "resolvers",
    "schema",
    "queries",
    "mutations",
  ],
  "/docs/guides/database-and-migrations": [
    "database",
    "migrations",
    "SQL",
    "PostgreSQL",
    "schema migrations",
  ],
  "/docs/guides/authentication": [
    "authentication",
    "auth",
    "JWT",
    "login",
    "sessions",
  ],
  "/docs/guides/code-generation": [
    "code generation",
    "scaffolding",
    "generators",
    "boilerplate",
  ],
  "/docs/guides/background-jobs": [
    "background jobs",
    "workers",
    "async tasks",
    "job queue",
  ],
  "/docs/guides/email-and-notifications": [
    "email",
    "notifications",
    "SMTP",
    "mailer",
    "templates",
  ],
  "/docs/guides/testing": [
    "testing",
    "unit tests",
    "integration tests",
    "test utilities",
  ],
  "/docs/guides/deployment": [
    "deployment",
    "Docker",
    "production",
    "CI/CD",
    "hosting",
  ],
  "/docs/guides/configuration": [
    "configuration",
    "environment variables",
    "config files",
    "settings",
  ],

  // CLI Reference
  "/docs/cli-reference/new": [
    "CLI",
    "new project",
    "create project",
    "gofasta new",
  ],
  "/docs/cli-reference/init": [
    "CLI",
    "init",
    "initialize",
    "gofasta init",
  ],
  "/docs/cli-reference/dev": [
    "CLI",
    "dev server",
    "development",
    "hot reload",
    "gofasta dev",
  ],
  "/docs/cli-reference/migrate": [
    "CLI",
    "migrate",
    "database migrations",
    "gofasta migrate",
  ],
  "/docs/cli-reference/seed": [
    "CLI",
    "seed",
    "database seeding",
    "test data",
    "gofasta seed",
  ],
  "/docs/cli-reference/serve": [
    "CLI",
    "serve",
    "production server",
    "gofasta serve",
  ],
  "/docs/cli-reference/wire": [
    "CLI",
    "wire",
    "dependency injection",
    "gofasta wire",
  ],
  "/docs/cli-reference/swagger": [
    "CLI",
    "swagger",
    "OpenAPI",
    "API docs",
    "gofasta swagger",
  ],

  // CLI Reference - Generate
  "/docs/cli-reference/generate/scaffold": [
    "scaffold",
    "generate",
    "CRUD",
    "full resource",
    "gofasta generate",
  ],
  "/docs/cli-reference/generate/model": [
    "generate model",
    "ORM",
    "database model",
    "struct",
  ],
  "/docs/cli-reference/generate/repository": [
    "generate repository",
    "data access",
    "repository pattern",
  ],
  "/docs/cli-reference/generate/service": [
    "generate service",
    "business logic",
    "service layer",
  ],
  "/docs/cli-reference/generate/controller": [
    "generate controller",
    "HTTP handler",
    "request handler",
  ],
  "/docs/cli-reference/generate/dto": [
    "generate DTO",
    "data transfer object",
    "request body",
    "response body",
  ],
  "/docs/cli-reference/generate/migration": [
    "generate migration",
    "database migration",
    "schema change",
  ],
  "/docs/cli-reference/generate/route": [
    "generate route",
    "HTTP route",
    "endpoint",
    "routing",
  ],
  "/docs/cli-reference/generate/resolver": [
    "generate resolver",
    "GraphQL resolver",
    "query resolver",
  ],
  "/docs/cli-reference/generate/provider": [
    "generate provider",
    "dependency injection",
    "provider pattern",
  ],
  "/docs/cli-reference/generate/job": [
    "generate job",
    "background job",
    "worker",
    "async task",
  ],
  "/docs/cli-reference/generate/task": [
    "generate task",
    "scheduled task",
    "cron job",
    "periodic task",
  ],
  "/docs/cli-reference/generate/email-template": [
    "generate email template",
    "email",
    "HTML email",
    "mail template",
  ],

  // API Reference
  "/docs/api-reference/config": [
    "config API",
    "configuration",
    "database setup",
    "environment",
  ],
  "/docs/api-reference/auth": [
    "auth API",
    "authentication",
    "authorization",
    "JWT",
    "tokens",
  ],
  "/docs/api-reference/cache": [
    "cache API",
    "caching",
    "Redis",
    "in-memory cache",
  ],
  "/docs/api-reference/errors": [
    "errors API",
    "error handling",
    "HTTP errors",
    "error responses",
  ],
  "/docs/api-reference/http-utilities": [
    "HTTP utilities",
    "request helpers",
    "response helpers",
    "HTTP client",
  ],
  "/docs/api-reference/logger": [
    "logger API",
    "logging",
    "structured logging",
    "log levels",
  ],
  "/docs/api-reference/mailer": [
    "mailer API",
    "email sending",
    "SMTP",
    "email templates",
  ],
  "/docs/api-reference/middleware": [
    "middleware API",
    "HTTP middleware",
    "request pipeline",
    "interceptors",
  ],
  "/docs/api-reference/models": [
    "models API",
    "ORM",
    "database models",
    "structs",
    "schema",
  ],
  "/docs/api-reference/notifications": [
    "notifications API",
    "push notifications",
    "alerts",
    "messaging",
  ],
  "/docs/api-reference/queue": [
    "queue API",
    "message queue",
    "job queue",
    "async processing",
  ],
  "/docs/api-reference/resilience": [
    "resilience API",
    "circuit breaker",
    "retry",
    "fault tolerance",
  ],
  "/docs/api-reference/scheduler": [
    "scheduler API",
    "cron",
    "scheduled tasks",
    "periodic jobs",
  ],
  "/docs/api-reference/storage": [
    "storage API",
    "file storage",
    "uploads",
    "S3",
    "file system",
  ],
  "/docs/api-reference/validators": [
    "validators API",
    "validation",
    "input validation",
    "request validation",
  ],
  "/docs/api-reference/websocket": [
    "WebSocket API",
    "real-time",
    "WebSocket",
    "bidirectional",
  ],
  "/docs/api-reference/i18n": [
    "i18n API",
    "internationalization",
    "localization",
    "translations",
  ],
  "/docs/api-reference/observability": [
    "observability API",
    "metrics",
    "tracing",
    "OpenTelemetry",
    "monitoring",
  ],
  "/docs/api-reference/feature-flags": [
    "feature flags API",
    "feature toggles",
    "feature management",
    "rollouts",
  ],
  "/docs/api-reference/sessions": [
    "sessions API",
    "session management",
    "cookies",
    "session store",
  ],
  "/docs/api-reference/encryption": [
    "encryption API",
    "cryptography",
    "hashing",
    "AES",
    "secrets",
  ],
  "/docs/api-reference/seeds": [
    "seeds API",
    "database seeding",
    "test data",
    "fixtures",
  ],
  "/docs/api-reference/types": [
    "types API",
    "TypeScript types",
    "type definitions",
    "interfaces",
  ],
  "/docs/api-reference/utils": [
    "utils API",
    "utilities",
    "helper functions",
    "common utils",
  ],
  "/docs/api-reference/health": [
    "health API",
    "health check",
    "readiness",
    "liveness",
    "monitoring",
  ],
  "/docs/api-reference/test-utilities": [
    "test utilities API",
    "testing helpers",
    "test fixtures",
    "mock helpers",
  ],
};

/**
 * Returns the combined keywords for a given URL path.
 * Base keywords are always included.
 */
export function getKeywordsForPath(path: string): string[] {
  const pageKeywords = PAGE_KEYWORDS[path] ?? [];
  return [...BASE_KEYWORDS, ...pageKeywords];
}
