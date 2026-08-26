# Deployment Architecture — Backend

## Build Pipeline
```
TypeScript source → esbuild (CJS bundle) → zip → aws lambda update-function-code
```

## Deployment Script (`scripts/deploy.sh`)
1. `npm run build` (esbuild → `dist/index.js`)
2. `zip dist/deploy.zip index.js index.js.map`
3. `aws lambda update-function-code --function-name skillwall-dev-api --zip-file fileb://dist/deploy.zip`

## Provisioned Resources
- **Lambda**: `skillwall-dev-api` (`arn:aws:lambda:us-east-1:<ACCOUNT_ID>:function:skillwall-dev-api`)
- **DynamoDB**: `skillwall-dev-participants`
- **S3**: `skillwall-dev-photos-<ACCOUNT_ID>`
- **API Gateway**: `https://abc123xyz0.execute-api.us-east-1.amazonaws.com/`

## Key Decisions
- **CJS format**: Lambda nodejs22.x treats `.js` as CommonJS by default. ESM requires `package.json` with `"type": "module"` in the zip.
- **Source maps**: Enabled via `NODE_OPTIONS=--enable-source-maps` for readable stack traces.
- **Single bundle**: All dependencies bundled by esbuild — no `node_modules` in zip.
