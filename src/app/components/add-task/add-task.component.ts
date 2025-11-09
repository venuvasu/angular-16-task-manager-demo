import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { TaskPriority } from '../../models/task.model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-task.component.html',
  styleUrls: ['./add-task.component.scss']
})
export class AddTaskComponent {
  // Angular 16 inject function
  private fb = inject(FormBuilder);
  private taskService = inject(TaskService);
  
  taskForm: FormGroup;
  isSubmitting = false;
  showSuccessMessage = false;
  
  constructor() {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      priority: [TaskPriority.MEDIUM],
      dueDate: ['']
    });
  }
  
  isFieldInvalid(fieldName: string): boolean {
    const field = this.taskForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
  
  onSubmit(): void {
    if (this.taskForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      const formValue = this.taskForm.value;
      const task = {
        title: formValue.title?.trim(),
        description: formValue.description?.trim() || '',
        priority: formValue.priority,
        completed: false,
        dueDate: formValue.dueDate ? new Date(formValue.dueDate) : undefined
      };
      
      // Simulate async operation
      setTimeout(() => {
        try {
          this.taskService.addTask(task);
          this.isSubmitting = false;
          this.showSuccessMessage = true;
          this.taskForm.reset({
            priority: TaskPriority.MEDIUM
          });
          
          // Hide success message after 3 seconds
          setTimeout(() => {
            this.showSuccessMessage = false;
          }, 3000);
        } catch (error) {
          console.error('Error adding task:', error);
          this.isSubmitting = false;
          // In real app, show error message to user
        }
      }, 500);
    }
  }
  
  onReset(): void {
    this.taskForm.reset({
      priority: TaskPriority.MEDIUM
    });
    this.showSuccessMessage = false;
  }
}
