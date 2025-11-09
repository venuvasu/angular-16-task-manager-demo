import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TaskListComponent } from './components/task-list/task-list.component';
import { AddTaskComponent } from './components/add-task/add-task.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TaskListComponent, AddTaskComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Task Manager - Angular 16</h1>
        <p class="subtitle">Showcasing Angular 16 Features</p>
        <div class="features-badge">
          <span class="badge">Standalone Components</span>
          <span class="badge">Signals</span>
          <span class="badge">Control Flow</span>
          <span class="badge">Required Inputs</span>
        </div>
      </header>
      
      <main class="app-main">
        <div class="layout">
          <section class="add-task-section">
            <app-add-task />
          </section>
          
          <section class="task-list-section">
            <app-task-list />
          </section>
        </div>
      </main>
      
      <footer class="app-footer">
        <p>Built with Angular 16 • Ready for upgrade to Angular 19</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 2rem;
      text-align: center;
      box-shadow: 0 2px 20px rgba(0,0,0,0.1);
    }
    
    .app-header h1 {
      margin: 0 0 0.5rem 0;
      color: #333;
      font-size: 2.5rem;
      font-weight: 700;
    }
    
    .subtitle {
      margin: 0 0 1rem 0;
      color: #666;
      font-size: 1.1rem;
    }
    
    .features-badge {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    
    .badge {
      background: #007bff;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 500;
    }
    
    .app-main {
      flex: 1;
      padding: 2rem;
    }
    
    .layout {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      align-items: start;
    }
    
    .add-task-section,
    .task-list-section {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    
    .app-footer {
      background: rgba(0, 0, 0, 0.8);
      color: white;
      text-align: center;
      padding: 1rem;
    }
    
    .app-footer p {
      margin: 0;
      font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
      .app-header h1 {
        font-size: 2rem;
      }
      
      .layout {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .app-main {
        padding: 1rem;
      }
      
      .features-badge {
        justify-content: center;
      }
    }
  `]
})
export class AppComponent {
  title = 'task-manager-ng16';
}
