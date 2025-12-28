import type { AwsIntegration } from '../types'

export function renderAwsIntegrationModal(
  integration: AwsIntegration | null,
  cloudFormationUrl?: string
) {
  const isConnected = integration?.status === 'connected'
  
  if (isConnected && integration) {
    return renderConnectedModal(integration)
  } else {
    return renderConnectModal(integration, cloudFormationUrl)
  }
}

function renderConnectedModal(integration: AwsIntegration) {
  const lastCheck = integration.lastHealthCheck || 'Never'
  const permissions = integration.permissions?.join(', ') || 'Create & read S3, EC2, RDS'
  const resourceCounts = integration.resourceCounts || { s3Buckets: 0, ec2Instances: 0, rdsDatabases: 0 }
  
  return `
    <div id="awsIntegrationModal" class="aws-modal" style="display: none;">
      <div class="aws-modal-backdrop" onclick="window.handleCloseAwsModal()"></div>
      <div class="aws-modal-content">
        <button class="aws-modal-close" onclick="window.handleCloseAwsModal()" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="aws-modal-header">
          <h2 class="aws-modal-title">AWS integration</h2>
          <p class="aws-modal-subtitle">You're connected to AWS. Here's the account we use to manage your infrastructure.</p>
        </div>
        
        <div class="aws-modal-body">
          <div class="aws-summary-card">
            <div class="aws-status-chip">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              <span>Connected</span>
            </div>
            
            <div class="aws-summary-grid">
              <div class="aws-summary-item">
                <label>Account ID</label>
                <value>${integration.accountId || 'N/A'}</value>
              </div>
              <div class="aws-summary-item">
                <label>Default region</label>
                <value>${integration.defaultRegion || 'N/A'}</value>
              </div>
              <div class="aws-summary-item">
                <label>Last health check</label>
                <value>${lastCheck}</value>
              </div>
              <div class="aws-summary-item">
                <label>Permissions</label>
                <value>${permissions}</value>
              </div>
            </div>
          </div>
          
          <div class="aws-resources-section">
            <h3 class="aws-resources-title">Resources managed by this account</h3>
            <p class="aws-resources-description">High-level overview of the resources we've created or are monitoring.</p>
            
            <div class="aws-resource-chips">
              <div class="aws-resource-chip">
                <span class="aws-resource-label">S3 buckets</span>
                <span class="aws-resource-count">${resourceCounts.s3Buckets}</span>
              </div>
              <div class="aws-resource-chip">
                <span class="aws-resource-label">EC2 instances</span>
                <span class="aws-resource-count">${resourceCounts.ec2Instances}</span>
              </div>
              <div class="aws-resource-chip">
                <span class="aws-resource-label">RDS databases</span>
                <span class="aws-resource-count">${resourceCounts.rdsDatabases}</span>
              </div>
            </div>
            
            <p class="aws-resources-hint">Detailed resources are visible from each project card in the dashboard.</p>
          </div>
        </div>
        
        <div class="aws-modal-footer">
          <button class="aws-modal-btn-disconnect" onclick="window.handleDisconnectAws()">
            Disconnect AWS
          </button>
          <button class="aws-modal-btn-primary" onclick="window.handleCloseAwsModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `
}

function renderConnectModal(
  integration: AwsIntegration | null,
  cloudFormationUrl?: string
) {
  const accountId = integration?.accountId || ''
  const hasUrl = !!cloudFormationUrl
  
  if (hasUrl) {
    return renderCloudFormationSteps(cloudFormationUrl!)
  }
  
  return `
    <div id="awsIntegrationModal" class="aws-modal" style="display: none;">
      <div class="aws-modal-backdrop" onclick="window.handleCloseAwsModal()"></div>
      <div class="aws-modal-content">
        <button class="aws-modal-close" onclick="window.handleCloseAwsModal()" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="aws-modal-header">
          <h2 class="aws-modal-title">Connect your AWS account</h2>
          <p class="aws-modal-subtitle">Link AWS so we can create and monitor your infrastructure (S3, EC2, RDS, and more).</p>
        </div>
        
        <div class="aws-modal-body">
          <form id="awsConnectForm" class="aws-connect-form">
            <div class="aws-form-group">
              <label for="awsAccountId">AWS Account ID</label>
              <input 
                type="text" 
                id="awsAccountId" 
                placeholder="123456789012"
                class="aws-form-input"
                value="${accountId}"
                maxlength="12"
                pattern="[0-9]{12}"
                required
              />
              <div class="aws-form-helper">12-digit AWS account ID that owns your resources.</div>
            </div>
          </form>
        </div>
        
        <div class="aws-modal-footer">
          <button class="aws-modal-btn-secondary" onclick="window.handleCloseAwsModal()">
            Cancel
          </button>
          <button 
            class="aws-modal-btn-primary" 
            id="awsSetupBtn"
            disabled
          >
            Setup Connection
          </button>
        </div>
      </div>
    </div>
  `
}

function renderCloudFormationSteps(cloudFormationUrl: string) {
  // Extract stack name from URL if possible
  const urlObj = new URL(cloudFormationUrl)
  const stackNameMatch = urlObj.hash.match(/stackName=([^&]+)/)
  const stackName = stackNameMatch ? decodeURIComponent(stackNameMatch[1]) : 'VitruviuxIntegrationStack'
  
  // Extract parameters from URL
  const params: Record<string, string> = {}
  urlObj.hash.split('&').forEach(param => {
    if (param.startsWith('param_')) {
      const [key, value] = param.split('=')
      if (key && value) {
        params[key.replace('param_', '')] = decodeURIComponent(value)
      }
    }
  })
  
  const templateUrl = urlObj.hash.match(/templateURL=([^&]+)/)?.[1]
  const templateUrlDecoded = templateUrl ? decodeURIComponent(templateUrl) : ''
  
  // Build AWS CLI command
  const awsCliCommand = `aws cloudformation create-stack \\
  --stack-name ${stackName} \\
  --template-url "${templateUrlDecoded}" \\
  --parameters \\
    ParameterKey=GitHubOwner,ParameterValue="${params.GitHubOwner || ''}" \\
    ParameterKey=GitHubEnvironment,ParameterValue="${params.GitHubEnvironment || ''}" \\
    ParameterKey=ControlPlaneAccountId,ParameterValue="${params.ControlPlaneAccountId || ''}" \\
  --capabilities CAPABILITY_NAMED_IAM`
  
  return `
    <div id="awsIntegrationModal" class="aws-modal">
      <div class="aws-modal-backdrop" onclick="window.handleCloseAwsModal()"></div>
      <div class="aws-modal-content aws-modal-content-large">
        <button class="aws-modal-close" onclick="window.handleCloseAwsModal()" aria-label="Close">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        <div class="aws-modal-header">
          <h2 class="aws-modal-title">Create CloudFormation Stack</h2>
          <p class="aws-modal-subtitle">Complete the AWS connection by creating the CloudFormation stack using one of the methods below.</p>
        </div>
        
        <div class="aws-modal-body">
          <div class="aws-tabs">
            <button class="aws-tab-btn aws-tab-active" data-tab="console" onclick="window.handleSwitchTab('console')">
              AWS Console
            </button>
            <button class="aws-tab-btn" data-tab="terminal" onclick="window.handleSwitchTab('terminal')">
              macOS Terminal
            </button>
          </div>
          
          <div class="aws-tab-content" id="awsTabConsole">
            <div class="aws-cloudformation-info">
              <h3 class="aws-info-title">What is a CloudFormation Stack?</h3>
              <p class="aws-info-text">
                AWS CloudFormation is a service that helps you model and set up AWS resources. A stack is a collection of AWS resources that you can manage as a single unit. In this case, the stack will create the necessary IAM roles and permissions for Vitruviux to manage your AWS infrastructure.
              </p>
              
              <h3 class="aws-info-title">Steps to Create the Stack:</h3>
              <ol class="aws-steps-list">
                <li>Click the button below to open the AWS CloudFormation console in a new browser tab.</li>
                <li>Review the stack template and parameters. The stack is pre-configured with the correct settings.</li>
                <li>Scroll down and click the <strong>"Create stack"</strong> button at the bottom of the page.</li>
                <li>Wait for the stack creation to complete (usually takes 1-2 minutes).</li>
                <li>Once the stack status shows "CREATE_COMPLETE", return here and click "Check Connection Status" to verify.</li>
              </ol>
              
              <div class="aws-action-section">
                <a href="${cloudFormationUrl}" target="_blank" rel="noopener noreferrer" class="aws-modal-btn-primary" id="awsOpenConsoleBtn">
                  Open AWS CloudFormation Console
                </a>
              </div>
            </div>
          </div>
          
          <div class="aws-tab-content" id="awsTabTerminal" style="display: none;">
            <div class="aws-cloudformation-info">
              <h3 class="aws-info-title">Using AWS CLI</h3>
              <p class="aws-info-text">
                If you have AWS CLI installed and configured on your macOS terminal, you can create the stack using the command below.
              </p>
              
              <div class="aws-code-block">
                <div class="aws-code-header">
                  <span>Terminal Command</span>
                  <button class="aws-copy-btn" onclick="window.handleCopyCommand()" title="Copy to clipboard">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </button>
                </div>
                <pre class="aws-code-content"><code id="awsCliCommand">${awsCliCommand}</code></pre>
              </div>
              
              <div class="aws-cli-steps">
                <h3 class="aws-info-title">Steps:</h3>
                <ol class="aws-steps-list">
                  <li>Open Terminal on your Mac.</li>
                  <li>Ensure AWS CLI is installed: <code>aws --version</code></li>
                  <li>Ensure you're authenticated: <code>aws sts get-caller-identity</code></li>
                  <li>Copy and run the command above.</li>
                  <li>Wait for the stack creation to complete.</li>
                  <li>Return here and click "Check Connection Status" to verify.</li>
                </ol>
              </div>
            </div>
          </div>
          
          <div class="aws-refresh-section">
            <button type="button" class="aws-refresh-btn" onclick="window.handleCheckAwsStatus()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Check Connection Status
            </button>
            <p class="aws-refresh-hint">Click this button after creating the stack to verify the connection.</p>
            <div id="awsStatusResult" class="aws-status-result" style="display: none;"></div>
          </div>
        </div>
        
        <div class="aws-modal-footer">
          <button class="aws-modal-btn-secondary" onclick="window.handleCloseAwsModal()">
            Close
          </button>
        </div>
      </div>
    </div>
  `
}

