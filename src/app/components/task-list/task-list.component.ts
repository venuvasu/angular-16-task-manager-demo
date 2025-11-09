import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskItemComponent } from '../task-item/task-item.component';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskItemComponent],
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent {
  // Angular 16 inject function
  taskService = inject(TaskService);
  
  searchTerm = '';
  showCompleted = true;
  selectedPriority: TaskPriority | null = null;
  
  constructor() {
    // Initialize filter state from service
    const currentFilter = this.taskService.getFilter();
    this.searchTerm = currentFilter.searchTerm;
    this.showCompleted = currentFilter.showCompleted;
    this.selectedPriority = currentFilter.priority || null;
  }
  
  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.updateFilter();
  }
  
  onShowCompletedChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.showCompleted = target.checked;
    this.updateFilter();
  }
  
  onPriorityFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.selectedPriority = target.value ? target.value as TaskPriority : null;
    this.updateFilter();
  }
  
  private updateFilter(): void {
    this.taskService.updateFilter({
      searchTerm: this.searchTerm,
      showCompleted: this.showCompleted,
      priority: this.selectedPriority || undefined
    });
  }
  
  onToggleComplete(taskId: string): void {
    this.taskService.toggleTask(taskId);
  }
  
  onEditTask(task: Task): void {
    const newTitle = prompt('Edit task title:', task.title);
    if (newTitle && newTitle.trim() && newTitle !== task.title) {
      this.taskService.updateTask(task.id, { title: newTitle.trim() });
    }
  }
  
  onDeleteTask(taskId: string): void {
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(taskId);
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}
