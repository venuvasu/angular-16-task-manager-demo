import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task, TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-item.component.html',
  styleUrls: ['./task-item.component.scss']
})
export class TaskItemComponent {
  // Angular 16 Required Input
  @Input({ required: true }) task!: Task;
  
  @Output() toggleComplete = new EventEmitter<string>();
  @Output() editTask = new EventEmitter<Task>();
  @Output() deleteTask = new EventEmitter<string>();
  
  onToggleComplete(): void {
    this.toggleComplete.emit(this.task.id);
  }
  
  onEdit(): void {
    this.editTask.emit(this.task);
  }
  
  onDelete(): void {
    this.deleteTask.emit(this.task.id);
  }
  
  isOverdue(): boolean {
    if (!this.task.dueDate || this.task.completed) {
      return false;
    }
    return new Date() > this.task.dueDate;
  }
}
