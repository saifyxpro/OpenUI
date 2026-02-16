export enum EventName {
  EXTENSION_ACTIVATED = 'extension_activated',
  ACTIVATION_ERROR = 'activation_error',
  OPENED_WEB_APP_WORKSPACE = 'opened_web_app_workspace',
  GETTING_STARTED_PANEL_SHOWN = 'getting_started_panel_shown',
  DISMISSED_GETTING_STARTED_PANEL = 'dismissed_getting_started_panel',
  TIME_TO_UPGRADE_PANEL_SHOWN = 'time_to_upgrade_panel_shown',
  DISMISSED_TIME_TO_UPGRADE_PANEL = 'dismissed_getting_started_panel',
  TOOLBAR_CONNECTED = 'toolbar_connected',
  AGENT_PROMPT_TRIGGERED = 'agent_prompt_triggered',
  REMOVE_OLD_TOOLBAR_TRIGGERED = 'remove_old_toolbar_triggered',
}

export class AnalyticsService {
  private static instance: AnalyticsService;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  public initialize(): void {}

  public async trackEvent(
    _eventName: EventName,
    _properties?: Record<string, any>,
  ): Promise<void> {}

  public shutdown(): Promise<void> {
    return Promise.resolve();
  }

  public trackTelemetryStateChange(_enabled: boolean): void {}
}
