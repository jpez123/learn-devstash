# Start Action

1. Read current-feature.md - verify Goals are populated
2. If empty, error: "Run /feature load first"
3. Set Status to "In Progress"
4. Create and checkout the feature branch (derive name from H1 heading)
5. List the goals, then implement them one by one
6. After implementation: run `npm test` (unit tests) and `npm run build` (type check + build). Fix any failures before proceeding. NEVER skip this step.