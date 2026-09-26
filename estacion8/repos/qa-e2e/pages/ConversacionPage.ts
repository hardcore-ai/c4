import { Page, Locator } from '@playwright/test';

/**
 * Page Object: Gestión del historial de conversaciones.
 * Encapsula el panel de historial y las acciones de navegación entre conversaciones.
 */
export class ConversacionPage {
  readonly page: Page;
  readonly historialConversacion: Locator;
  readonly mensajesUsuario: Locator;
  readonly mensajesAgente: Locator;
  readonly botonNuevaConversacion: Locator;
  readonly listaConversaciones: Locator;

  constructor(page: Page) {
    this.page = page;
    this.historialConversacion = page.locator('[data-testid="conversation-history"]');
    this.mensajesUsuario = page.locator('[data-testid="user-message"]');
    this.mensajesAgente = page.locator('[data-testid="agent-message"]');
    this.botonNuevaConversacion = page.getByRole('button', { name: /nueva conversación|new conversation/i });
    this.listaConversaciones = page.locator('[data-testid="conversation-list"]');
  }

  async iniciarNuevaConversacion() {
    await this.botonNuevaConversacion.click();
  }

  async obtenerMensajesDelAgente(): Promise<string[]> {
    return this.mensajesAgente.allTextContents();
  }

  async contarMensajes(): Promise<{ usuario: number; agente: number }> {
    return {
      usuario: await this.mensajesUsuario.count(),
      agente: await this.mensajesAgente.count(),
    };
  }

  async seleccionarConversacion(index: number) {
    await this.listaConversaciones.locator('li').nth(index).click();
  }
}
