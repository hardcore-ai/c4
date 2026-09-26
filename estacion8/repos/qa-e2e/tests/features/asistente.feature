Feature: Asistente IA — Interacción principal

  Como usuario registrado
  Quiero interactuar con el asistente de IA
  Para obtener respuestas relevantes a mis consultas

  Background:
    Given que el usuario está en la página principal

  Scenario: El usuario recibe respuesta al enviar un mensaje
    When el usuario envía el mensaje "¿Cuáles son sus horarios de atención?"
    Then el agente responde con un mensaje no vacío

  Scenario: El historial refleja el intercambio completo
    When el usuario envía el mensaje "Hola"
    And el agente responde
    And el usuario envía el mensaje "¿Qué servicios ofrecen?"
    And el agente responde
    Then el historial contiene 2 mensajes del usuario
    And el historial contiene 2 respuestas del agente

  Scenario: El agente recuerda el contexto de la conversación
    When el usuario envía el mensaje "Mi nombre es Ana"
    And el agente responde
    When el usuario envía el mensaje "¿Cómo me llamo?"
    Then la respuesta del agente menciona "Ana"

  Scenario: Nueva conversación limpia el historial
    Given que existe una conversación activa con un mensaje
    When el usuario inicia una nueva conversación
    Then el historial queda vacío
