# Build Instructions

## Prerequisites
- **Node.js**: 22.x (`nvm use 22`)
- **AWS CLI**: Configured with credentials for us-east-1
- **Vercel CLI**: `npm install -g vercel` + `vercel login`
- **Terraform**: ≥1.0 with AWS provider ~>5.0

## Build Steps

### 1. Backend
```bash
cd backend
npm install
npx tsc --noEmit          # TypeScript check
node esbuild.config.mjs   # Bundle to dist/index.js (CJS)
```

### 2. Frontend
```bash
cd frontend
npm install
npx next build            # Static pages + serverless functions
```

### 3. Infrastructure
```bash
cd infra
TF_VAR_admin_token="<token>" TF_VAR_new_relic_license_key="<key>" terraform plan
terraform apply
```

## Build Artifacts
| Unit | Artifact | Location |
|---|---|---|
| Backend | Lambda zip | `backend/dist/deploy.zip` |
| Frontend | Next.js build | `frontend/.next/` |
| Infra | Terraform state | `infra/terraform.tfstate` |

## Troubleshooting
See `troubleshooting.md` in project root for common build issues (ESM vs CJS, Tailwind v4 + Node 22, etc.)
