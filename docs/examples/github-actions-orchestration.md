# Shifty Test Orchestration - GitHub Actions Examples

## Basic Orchestrated Test Run

```yaml
name: Shifty Orchestrated Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start Shifty orchestration
        id: orchestrate
        run: |
          # Get list of test files
          test_files=$(find tests -name "*.spec.ts" -type f | jq -R -s -c 'split("\n")[:-1]')
          
          # Start orchestration via Shifty API
          response=$(curl -X POST "${{ secrets.SHIFTY_API_URL }}/api/v1/orchestrate" \
            -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}" \
            -H "X-Tenant-ID: ${{ secrets.SHIFTY_TENANT_ID }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"testFiles\": $test_files,
              \"workerCount\": 5,
              \"project\": \"${{ github.repository }}\",
              \"branch\": \"${{ github.ref_name }}\",
              \"commitSha\": \"${{ github.sha }}\"
            }")
          
          run_id=$(echo "$response" | jq -r '.runId')
          echo "run_id=${run_id}" >> $GITHUB_OUTPUT
          echo "Started Shifty orchestration: ${run_id}"
      
      - name: Wait for completion
        run: |
          run_id="${{ steps.orchestrate.outputs.run_id }}"
          
          while true; do
            response=$(curl -s "${{ secrets.SHIFTY_API_URL }}/api/v1/runs/${run_id}" \
              -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}")
            
            status=$(echo "$response" | jq -r '.run.status')
            
            if [ "$status" = "completed" ]; then
              echo "Tests completed successfully"
              break
            elif [ "$status" = "failed" ]; then
              echo "Tests failed"
              exit 1
            fi
            
            echo "Status: ${status}, waiting..."
            sleep 10
          done
      
      - name: Download results
        if: always()
        run: |
          run_id="${{ steps.orchestrate.outputs.run_id }}"
          
          curl -s "${{ secrets.SHIFTY_API_URL }}/api/v1/runs/${run_id}" \
            -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}" \
            -o test-results.json
          
          echo "Test results saved to test-results.json"
      
      - name: Upload results artifact
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: test-results.json
```

## Orchestration with Auto-Healing and PR Creation

```yaml
name: Shifty Tests with Auto-Healing

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Configure Playwright with Shifty reporter
        run: |
          cat > playwright.config.ts << EOF
          import { defineConfig } from '@playwright/test';
          
          export default defineConfig({
            testDir: './tests',
            reporter: [
              ['list'],
              ['@shifty/sdk-reporter', {
                apiUrl: process.env.SHIFTY_API_URL,
                apiKey: process.env.SHIFTY_API_KEY,
                tenantId: process.env.SHIFTY_TENANT_ID,
                uploadArtifacts: true,
              }],
            ],
          });
          EOF
      
      - name: Start orchestrated test run
        id: orchestrate
        env:
          SHIFTY_API_URL: ${{ secrets.SHIFTY_API_URL }}
          SHIFTY_API_KEY: ${{ secrets.SHIFTY_API_KEY }}
          SHIFTY_TENANT_ID: ${{ secrets.SHIFTY_TENANT_ID }}
        run: |
          test_files=$(find tests -name "*.spec.ts" | jq -R -s -c 'split("\n")[:-1]')
          
          response=$(curl -X POST "${SHIFTY_API_URL}/api/v1/orchestrate" \
            -H "Authorization: Bearer ${SHIFTY_API_KEY}" \
            -H "X-Tenant-ID: ${SHIFTY_TENANT_ID}" \
            -H "Content-Type: application/json" \
            -d "{
              \"testFiles\": $test_files,
              \"workerCount\": 5,
              \"project\": \"${{ github.repository }}\",
              \"branch\": \"${{ github.ref_name }}\",
              \"commitSha\": \"${{ github.sha }}\",
              \"metadata\": {
                \"pr_number\": \"${{ github.event.pull_request.number }}\",
                \"actor\": \"${{ github.actor }}\"
              }
            }")
          
          run_id=$(echo "$response" | jq -r '.runId')
          echo "run_id=${run_id}" >> $GITHUB_OUTPUT
          
          # Export for Playwright workers
          echo "SHIFTY_RUN_ID=${run_id}" >> $GITHUB_ENV
      
      - name: Check healing PRs
        if: always()
        run: |
          run_id="${{ steps.orchestrate.outputs.run_id }}"
          
          # Check if healing PR was created
          response=$(curl -s "${{ secrets.SHIFTY_API_URL }}/api/v1/healing/prs?runId=${run_id}" \
            -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}")
          
          pr_url=$(echo "$response" | jq -r '.prs[0].prUrl // empty')
          
          if [ -n "$pr_url" ]; then
            echo "🔧 Auto-healing PR created: ${pr_url}"
            echo "healing_pr=${pr_url}" >> $GITHUB_OUTPUT
          fi
```

## Rerun Failed Tests Only

```yaml
name: Rerun Failed Tests

on:
  workflow_dispatch:
    inputs:
      previous_run_id:
        description: 'Shifty run ID from previous execution'
        required: true
        type: string

jobs:
  rerun:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Fetch failed tests
        id: failed
        uses: ./.github/actions/shifty-rerun-failed
        with:
          shifty-api-url: ${{ secrets.SHIFTY_API_URL }}
          shifty-api-key: ${{ secrets.SHIFTY_API_KEY }}
          run-id: ${{ inputs.previous_run_id }}
      
      - name: Run failed tests
        if: steps.failed.outputs.failed-tests-count > 0
        run: |
          # Read failed test files
          test_files=$(cat failed-tests-grep.txt | jq -R -s -c 'split("\n")[:-1]')
          
          # Start new orchestration with only failed tests
          response=$(curl -X POST "${{ secrets.SHIFTY_API_URL }}/api/v1/orchestrate" \
            -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}" \
            -H "X-Tenant-ID: ${{ secrets.SHIFTY_TENANT_ID }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"testFiles\": $test_files,
              \"workerCount\": 3,
              \"project\": \"${{ github.repository }}\",
              \"branch\": \"${{ github.ref_name }}\",
              \"commitSha\": \"${{ github.sha }}\",
              \"metadata\": {
                \"rerun_of\": \"${{ inputs.previous_run_id }}\"
              }
            }")
          
          echo "$response" | jq '.'
```

## Parallel Testing with Matrix Strategy

```yaml
name: Shifty Parallel Tests

on:
  push:
    branches: [main]

jobs:
  orchestrate:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Start orchestration for ${{ matrix.browser }}
        run: |
          test_files=$(find tests -name "*.spec.ts" | jq -R -s -c 'split("\n")[:-1]')
          
          response=$(curl -X POST "${{ secrets.SHIFTY_API_URL }}/api/v1/orchestrate" \
            -H "Authorization: Bearer ${{ secrets.SHIFTY_API_KEY }}" \
            -H "X-Tenant-ID: ${{ secrets.SHIFTY_TENANT_ID }}" \
            -H "Content-Type: application/json" \
            -d "{
              \"testFiles\": $test_files,
              \"workerCount\": 3,
              \"project\": \"${{ github.repository }}\",
              \"branch\": \"${{ github.ref_name }}\",
              \"commitSha\": \"${{ github.sha }}\",
              \"metadata\": {
                \"browser\": \"${{ matrix.browser }}\"
              }
            }")
          
          echo "$response" | jq '.'
```

## Environment Variables

All workflows require these secrets to be configured in your repository:

- `SHIFTY_API_URL`: Your Shifty API URL (e.g., `https://api.shifty.ai`)
- `SHIFTY_API_KEY`: Your Shifty API key
- `SHIFTY_TENANT_ID`: Your Shifty tenant ID

## Features Demonstrated

1. **Basic Orchestration**: Start distributed test execution with smart sharding
2. **Auto-Healing**: Automatic selector healing during test execution
3. **PR Creation**: Automatic PRs for healed selectors
4. **Rerun Failed**: Rerun only failed tests from previous run
5. **Parallel Browsers**: Run tests across multiple browsers in parallel
6. **Real-time Monitoring**: Poll run status and stream results

## Next Steps

- See [API Reference](../architecture/api-reference.md) for complete API documentation
- Check [Worker Configuration](../development/worker-configuration.md) for scaling options
- Review [Healing Strategies](../architecture/healing-strategies.md) for selector healing details
