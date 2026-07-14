import * as vscode from 'vscode'
import { CodexAPIClient } from '../codex-client'
import { AuthData, RateLimits, RateLimitWindow } from '../types'
import {
  updateStatusBar,
  showUpdating,
  showFetchError,
  showUpdateError,
} from '../ui/status-bar'

let apiClient: CodexAPIClient | undefined
let currentAuthData: AuthData | undefined

/**
 * Initialize the usage monitor with authentication data
 */
export function initializeMonitor(authData: AuthData) {
  currentAuthData = authData
  apiClient = new CodexAPIClient(authData)
}

/**
 * Update usage statistics
 */
export async function updateUsage() {
  console.log('updateUsage called')
  console.log('apiClient exists:', !!apiClient)
  console.log('currentAuthData exists:', !!currentAuthData)

  if (!apiClient || !currentAuthData) {
    console.log('Missing apiClient or authData, returning')
    return
  }

  try {
    console.log('Setting status bar to updating...')
    showUpdating()

    // Send a simple message to get rate limits
    console.log('Calling getRateLimits...')
    const rateLimits = await apiClient.getRateLimits()
    console.log('getRateLimits returned:', rateLimits)

    if (rateLimits) {
      updateStatusBar(rateLimits, currentAuthData)

      // Check if we should show notifications
      const config = vscode.workspace.getConfiguration('codexUsage')
      const showNotifications = config.get<boolean>('showNotifications')

      if (showNotifications) {
        checkRateLimitWarnings(rateLimits)
      }
    } else {
      console.log('No rate limits received')
      showFetchError()
    }
  } catch (error) {
    console.error('Error updating usage:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    showUpdateError(error)
  }
}

/**
 * Check rate limits and show warnings if needed
 */
function checkRateLimitWarnings(rateLimits: RateLimits) {
  const warnings: string[] = []

  if (rateLimits.primary && rateLimits.primary.used_percent > 90) {
    warnings.push(
      `${formatLimitLabel(rateLimits.primary, 'Short window')} limit is ${rateLimits.primary.used_percent.toFixed(1)}% used`,
    )
  }

  if (rateLimits.secondary && rateLimits.secondary.used_percent > 90) {
    warnings.push(
      `${formatLimitLabel(rateLimits.secondary, 'Weekly')} limit is ${rateLimits.secondary.used_percent.toFixed(1)}% used`,
    )
  }

  if (warnings.length > 0) {
    vscode.window.showWarningMessage(
      `Codex Stats Warning: ${warnings.join(', ')}`,
    )
  }
}

function formatLimitLabel(
  limit: RateLimitWindow,
  fallbackLabel: string,
): string {
  if (!limit.window_minutes) {
    return fallbackLabel
  }

  if (limit.window_minutes < 60 * 24) {
    const hours = Math.max(1, Math.round(limit.window_minutes / 60))
    return `${hours}h`
  }

  const days = Math.max(1, Math.round(limit.window_minutes / (60 * 24)))
  return `${days}d`
}

/**
 * Get current auth data
 */
export function getCurrentAuthData(): AuthData | undefined {
  return currentAuthData
}
