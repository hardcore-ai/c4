import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Página principal del asistente IA.
 * Encapsula todos los elementos y acciones de la interfaz de chat.
 */
export class HomePage {
  readonly page: Page;
  readonly chatInput: Locator;
  readonly sendButton: Locator;
  readonly latestAgentMessage: Locator;
  readonly loadingIndicator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chatInput = page.getByRole('textbox', { name: /mensaje|escribe|message/i });
    this.sendButton = page.getByRole('button', { name: /enviar|send/i });
    this.latestAgentMessage = page.locator('[data-testid="agent-message"]').last();
    this.loadingIndicator = page.locator('[data-testid="loading"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async sendMessage(message: string) {
    await this.chatInput.fill(message);
    await this.sendButton.click();
  }

  async waitForResponse(): Promise<string> {
    await this.loadingIndicator.waitFor({ state: 'hidden', timeout: 15_000 });
    await this.latestAgentMessage.waitFor({ state: 'visible' });
    return (await this.latestAgentMessage.textContent()) ?? '';
  }

  async sendMessageAndWait(message: string): Promise<string> {
    await this.sendMessage(message);
    return this.waitForResponse();
  }
}
