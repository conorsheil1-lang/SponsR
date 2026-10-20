import { Component, computed, signal } from '@angular/core';
import { messageThreads, threadMessages } from '../../core/mock-data';

@Component({
  selector: 'app-messaging',
  standalone: true,
  template: `
    <section class="feature-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Messaging</p>
          <h2>Deal conversations and approvals</h2>
        </div>
        <button class="primary-button">New thread</button>
      </div>

      <div class="chat-layout">
        <aside class="threads-panel">
          @for (thread of threads(); track thread.name) {
            <button class="thread" type="button" [class.active]="selectedThread() === thread.name" (click)="selectThread(thread.name)">
              <div class="thread-meta">
                <strong>{{ thread.name }}</strong>
                <span>{{ thread.time }}</span>
              </div>
              <p>{{ thread.preview }}</p>
            </button>
          }
        </aside>

        <section class="messages-panel">
          <div class="message-header">
            <div>
              <strong>{{ selectedThread() }}</strong>
              <small>Campaign negotiation</small>
            </div>
            <span class="status-pill">Active</span>
          </div>

          <div class="messages">
            @for (message of conversations(); track message.text) {
              <div class="bubble" [class.me]="message.me">
                <p>{{ message.text }}</p>
                <small>{{ message.time }}</small>
              </div>
            }
          </div>

          <div class="composer">
            <input type="text" value="Can we move the approval window to Friday?" />
            <button type="button">Send</button>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [
    `
      .feature-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }
      .panel-header,
      .thread-meta,
      .message-header,
      .composer {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .panel-header {
        gap: 1rem;
      }
      .eyebrow {
        margin: 0 0 0.35rem;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        font-size: 0.72rem;
        color: #7cc9ff;
      }
      h2 {
        margin: 0;
      }
      .primary-button,
      .composer button {
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #7c3aed, #22d3ee);
        color: white;
        padding: 0.75rem 1rem;
        cursor: pointer;
      }
      .chat-layout {
        display: grid;
        grid-template-columns: minmax(220px, 300px) minmax(0, 1fr);
        gap: 1rem;
      }
      .threads-panel,
      .messages-panel {
        background: rgba(15, 23, 42, 0.7);
        border: 1px solid rgba(148, 163, 184, 0.18);
        border-radius: 20px;
        padding: 0.8rem;
      }
      .threads-panel {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .thread {
        width: 100%;
        background: rgba(15, 23, 42, 0.45);
        border: 1px solid rgba(148, 163, 184, 0.15);
        border-radius: 14px;
        color: #e2ecff;
        padding: 0.8rem;
        text-align: left;
        cursor: pointer;
      }
      .thread.active {
        background: rgba(124, 58, 237, 0.22);
        border-color: rgba(124, 58, 237, 0.45);
      }
      .thread-meta {
        margin-bottom: 0.35rem;
      }
      .thread p,
      .message-header small,
      .bubble small {
        color: #9fb0d4;
      }
      .thread p {
        margin: 0;
      }
      .messages-panel {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .message-header {
        padding-bottom: 0.75rem;
        border-bottom: 1px solid rgba(148, 163, 184, 0.12);
      }
      .status-pill {
        background: rgba(16, 185, 129, 0.2);
        color: #6ee7b7;
        padding: 0.3rem 0.6rem;
        border-radius: 999px;
        font-size: 0.72rem;
      }
      .messages {
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .bubble {
        max-width: 78%;
        padding: 0.7rem 0.8rem;
        border-radius: 16px;
        background: rgba(30, 41, 59, 0.95);
      }
      .bubble.me {
        align-self: flex-end;
        background: linear-gradient(135deg, rgba(124, 58, 237, 0.7), rgba(34, 211, 238, 0.4));
      }
      .bubble p,
      .bubble small {
        margin: 0;
      }
      .composer {
        gap: 0.75rem;
        border-top: 1px solid rgba(148, 163, 184, 0.12);
        padding-top: 0.75rem;
      }
      .composer input {
        flex: 1;
        background: rgba(15, 23, 42, 0.75);
        border: 1px solid rgba(148, 163, 184, 0.2);
        border-radius: 12px;
        color: #e2ecff;
        padding: 0.8rem 1rem;
      }
    `
  ]
})
export class MessagingComponent {
  readonly threads = signal(messageThreads);
  readonly selectedThread = signal('Northstar Labs');

  readonly conversations = computed(() => threadMessages[this.selectedThread()] ?? threadMessages['Northstar Labs']);

  selectThread(name: string): void {
    this.selectedThread.set(name);
  }
}
