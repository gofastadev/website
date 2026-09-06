const meta = {
  // Full-stack scaffold first
  scaffold: "scaffold",

  // Per-layer scaffolders
  model: "model",
  repository: "repository",
  service: "service",
  controller: "controller",
  dto: "dto",
  migration: "migration",
  route: "route",
  resolver: "resolver",
  provider: "provider",

  // Surface-add commands (operate on existing resources)
  method: "method",
  "repo-method": "repo-method",
  field: "field",
  endpoint: "endpoint",
  middleware: "middleware",
  relation: "relation",
  rename: "rename",

  // Async surface
  job: "job",
  task: "task",
  "email-template": "email-template",

  // Test scaffolding
  mock: "mock",
};

export default meta;
