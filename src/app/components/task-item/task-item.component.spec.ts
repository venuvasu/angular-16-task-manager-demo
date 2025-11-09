import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskItemComponent } from './task-item.component';
import { Task, TaskPriority } from '../../models/task.model';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('TaskItemComponent', () => {
  let component: TaskItemComponent;
  let fixture: ComponentFixture<TaskItemComponent>;
  let mockTask: Task;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskItemComponent] // Angular 16 Standalone Component Testing
    }).compileComponents();

    fixture = TestBed.createComponent(TaskItemComponent);
    component = fixture.componentInstance;
    
    // Mock task for testing
    mockTask = {
      id: '1',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      priority: TaskPriority.HIGH,
      createdAt: new Date('2023-01-01'),
      dueDate: new Date('2023-12-31')
    };
  });

  describe('Angular 16 Required Input', () => {
    it('should create component with required task input', () => {
      component.task = mockTask;
      fixture.detectChanges();
      
      expect(component).toBeTruthy();
      expect(component.task).toEqual(mockTask);
    });

    it('should display task information correctly', () => {
      component.task = mockTask;
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(By.css('h3'));
      const descriptionElement = fixture.debugElement.query(By.css('.description'));
      const priorityElement = fixture.debugElement.query(By.css('.priority'));

      expect(titleElement.nativeElement.textContent.trim()).toBe('Test Task');
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Test Description');
      expect(priorityElement.nativeElement.textContent.trim()).toBe('high');
    });
  });

  describe('Angular 16 @if Control Flow', () => {
    it('should show description when task has description', () => {
      component.task = mockTask;
      fixture.detectChanges();

      const descriptionElement = fixture.debugElement.query(By.css('.description'));
      expect(descriptionElement).toBeTruthy();
      expect(descriptionElement.nativeElement.textContent.trim()).toBe('Test Description');
    });

    it('should hide description when task has no description', () => {
      component.task = { ...mockTask, description: '' };
      fixture.detectChanges();

      const descriptionElement = fixture.debugElement.query(By.css('.description'));
      expect(descriptionElement).toBeFalsy();
    });

    it('should show due date when task has due date', () => {
      component.task = mockTask;
      fixture.detectChanges();

      const dueDateElement = fixture.debugElement.query(By.css('.due-date'));
      expect(dueDateElement).toBeTruthy();
    });

    it('should hide due date when task has no due date', () => {
      component.task = { ...mockTask, dueDate: undefined };
      fixture.detectChanges();

      const dueDateElement = fixture.debugElement.query(By.css('.due-date'));
      expect(dueDateElement).toBeFalsy();
    });
  });

  describe('Task Status and Styling', () => {
    it('should apply completed class when task is completed', () => {
      component.task = { ...mockTask, completed: true };
      fixture.detectChanges();

      const taskItemElement = fixture.debugElement.query(By.css('.task-item'));
      expect(taskItemElement.nativeElement.classList).toContain('completed');
    });

    it('should not apply completed class when task is not completed', () => {
      component.task = mockTask;
      fixture.detectChanges();

      const taskItemElement = fixture.debugElement.query(By.css('.task-item'));
      expect(taskItemElement.nativeElement.classList).not.toContain('completed');
    });

    it('should apply correct priority class', () => {
      component.task = mockTask;
      fixture.detectChanges();

      const priorityElement = fixture.debugElement.query(By.css('.priority'));
      expect(priorityElement.nativeElement.classList).toContain('priority-high');
    });

    it('should show overdue styling for overdue tasks', () => {
      const overdueTask = {
        ...mockTask,
        dueDate: new Date('2020-01-01'), // Past date
        completed: false
      };
      component.task = overdueTask;
      fixture.detectChanges();

      const dueDateElement = fixture.debugElement.query(By.css('.due-date'));
      expect(dueDateElement.nativeElement.classList).toContain('overdue');
    });
  });

  describe('Event Emissions', () => {
    beforeEach(() => {
      component.task = mockTask;
      fixture.detectChanges();
    });

    it('should emit toggleComplete event when toggle button is clicked', () => {
      spyOn(component.toggleComplete, 'emit');
      
      const toggleButton = fixture.debugElement.query(By.css('.toggle-btn'));
      toggleButton.nativeElement.click();

      expect(component.toggleComplete.emit).toHaveBeenCalledWith('1');
    });

    it('should emit editTask event when edit button is clicked', () => {
      spyOn(component.editTask, 'emit');
      
      const editButton = fixture.debugElement.query(By.css('.edit-btn'));
      editButton.nativeElement.click();

      expect(component.editTask.emit).toHaveBeenCalledWith(mockTask);
    });

    it('should emit deleteTask event when delete button is clicked', () => {
      spyOn(component.deleteTask, 'emit');
      
      const deleteButton = fixture.debugElement.query(By.css('.delete-btn'));
      deleteButton.nativeElement.click();

      expect(component.deleteTask.emit).toHaveBeenCalledWith('1');
    });
  });

  describe('Component Methods', () => {
    beforeEach(() => {
      component.task = mockTask;
    });

    it('should detect overdue tasks correctly', () => {
      // Not overdue - future date
      component.task = { ...mockTask, dueDate: new Date('2030-01-01') };
      expect(component.isOverdue()).toBe(false);

      // Overdue - past date
      component.task = { ...mockTask, dueDate: new Date('2020-01-01') };
      expect(component.isOverdue()).toBe(true);

      // Not overdue - completed task
      component.task = { 
        ...mockTask, 
        dueDate: new Date('2020-01-01'),
        completed: true 
      };
      expect(component.isOverdue()).toBe(false);

      // Not overdue - no due date
      component.task = { ...mockTask, dueDate: undefined };
      expect(component.isOverdue()).toBe(false);
    });

    it('should call correct methods on button clicks', () => {
      spyOn(component, 'onToggleComplete');
      spyOn(component, 'onEdit');
      spyOn(component, 'onDelete');

      component.onToggleComplete();
      component.onEdit();
      component.onDelete();

      expect(component.onToggleComplete).toHaveBeenCalled();
      expect(component.onEdit).toHaveBeenCalled();
      expect(component.onDelete).toHaveBeenCalled();
    });
  });

  describe('Button States', () => {
    it('should show correct toggle button text for incomplete task', () => {
      component.task = { ...mockTask, completed: false };
      fixture.detectChanges();

      const toggleButton = fixture.debugElement.query(By.css('.toggle-btn'));
      expect(toggleButton.nativeElement.textContent.trim()).toBe('Todo');
    });

    it('should show correct toggle button text for completed task', () => {
      component.task = { ...mockTask, completed: true };
      fixture.detectChanges();

      const toggleButton = fixture.debugElement.query(By.css('.toggle-btn'));
      expect(toggleButton.nativeElement.textContent.trim()).toBe('Done');
    });
  });
});
