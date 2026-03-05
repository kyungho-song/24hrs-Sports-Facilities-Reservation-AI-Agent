# AI Phone Reservation Service Blueprint

## 1. Overview

This document outlines the development plan for a voice-based AI assistant that handles futsal field reservations over the phone. The system is designed to be available 24/7, providing a seamless and automated booking experience for customers.

The core workflow is as follows: **[Incoming Call → Speech-to-Text (STT) → AI Logic (LLM) → Text-to-Speech (TTS) → Action Execution]**.

## 2. Core Features (MVP)

*   **24/7 Automated Phone Answering:** The AI will answer incoming calls, providing information and handling reservation requests without human intervention.
*   **Real-time Schedule Inquiry:** The AI will check an external data source (e.g., Google Calendar or a database) to determine available time slots.
*   **Reservation Booking:** The AI will be able to book, confirm, and cancel reservations based on the user's voice commands.
*   **SMS Confirmation:** Upon successful booking, the system will automatically send a confirmation SMS to the user with the reservation details.

## 3. Proposed Tech Stack

*   **Telephony & Voice Interface (CPaaS):** Vapi or Retell AI will be used to manage phone numbers, handle real-time call streaming, and integrate STT/TTS services.
*   **AI Brain (LLM):** Google's Gemini 1.5 Pro or Flash will power the core logic, understanding user intent and managing the conversation flow.
*   **Voice Synthesis (TTS):** ElevenLabs is recommended for its natural-sounding Korean voice.
*   **Automation & Integration:** Make.com or n8n will be used as a workflow automation layer to connect the AI logic to external services like Google Calendar (for scheduling) and an SMS provider (for notifications).

## 4. Development Plan

### Phase 1: Core Logic & Simulation (Server-side)

1.  **Update Blueprint:** Redefine the project goals and architecture in `blueprint.md` (this file).
2.  **Establish Data Source:** Create a simple `database.json` file to simulate the futsal field's availability schedule. This will act as our temporary database.
3.  **Develop AI Logic:** Create a server-side script (`server.js` or a Python equivalent) that contains the core conversational logic. This script will:
    *   Accept transcribed user text as input.
    *   Process the text to understand intent (e.g., inquire, book, cancel).
    *   Check availability in `database.json`.
    *   Generate an appropriate text response for the TTS engine.
    *   Define an action to be taken (e.g., `UPDATE_CALENDAR`, `SEND_SMS`).

### Phase 2: API Exposure

1.  **Build a Web Server:** Wrap the core AI logic in a simple web server (e.g., using Node.js/Express).
2.  **Create API Endpoint:** Expose a single API endpoint (e.g., `/handle-call`) that the CPaaS platform (Vapi/Retell) can call with the transcribed audio from the user. The endpoint will return the AI's response and any necessary actions in a JSON format.

### Phase 3: Integration & Deployment

1.  **CPaaS Integration:** Configure Vapi or Retell AI to point to the deployed API endpoint.
2.  **Workflow Automation:** Set up a Make.com/n8n scenario that listens for webhooks from our API to perform actions:
    *   Update a Google Calendar event.
    *   Trigger an SMS via a provider like Twilio.
3.  **Testing:** Conduct end-to-end testing by calling the provisioned phone number and verifying the entire workflow.

### Phase 4: Business Expansion

*   **White-Labeling:** Package the core logic as a standalone API for other businesses to integrate.
*   **No-Show Prevention:** Develop a proactive reminder service where the AI calls users an hour before their reservation.
