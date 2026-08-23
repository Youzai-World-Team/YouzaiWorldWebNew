interface TurnstileWidgetOptions {
  sitekey: string
  action?: string
  size?: 'normal' | 'compact' | 'flexible'
  'refresh-expired'?: 'auto' | 'manual' | 'never'
  callback?: (token: string) => void
  'error-callback'?: () => void
  'expired-callback'?: () => void
  'timeout-callback'?: () => void
}

interface TurnstileApi {
  render: (container: HTMLElement, options: TurnstileWidgetOptions) => string | number
  reset: (widgetId?: string | number) => void
  remove?: (widgetId?: string | number) => void
}

interface Window {
  turnstile?: TurnstileApi
}
