import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { AddTaskComponent } from './add-task.component';
import { TaskService } from '../../services/task.service';
import { TaskPriority } from '../../models/task.model';
import { By } from '@angular/platform-browser';

describe('AddTaskComponent', () => {
  let component: AddTaskComponent;
  let fixture: ComponentFixture<AddTaskComponent>;
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', ['addTask']);

    await TestBed.configureTestingModule({
      imports: [
        AddTaskComponent, // Angular 16 Standalone Component
        ReactiveFormsModule
      ],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddTaskComponent);
    component = fixture.componentInstance;
    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Initialization', () => {
    it('should initialize form with default values', () => {
      expect(component.taskForm.get('title')?.value).toBe('');
      expect(component.taskForm.get('description')?.value).toBe('');
      expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
      expect(component.taskForm.get('dueDate')?.value).toBe('');
    });

    it('should have required validation on title field', () => {
      const titleControl = component.taskForm.get('title');
      
      titleControl?.setValue('');
      expect(titleControl?.hasError('required')).toBe(true);
      
      titleControl?.setValue('ab');
      expect(titleControl?.hasError('minlength')).toBe(true);
      
      titleControl?.setValue('abc');
      expect(titleControl?.valid).toBe(true);
    });
  });

  describe('Angular 16 @if Control Flow - Validation Messages', () => {
    it('should show required error message when title is empty and touched', () => {
      const titleInput = fixture.debugElement.query(By.css('#title'));
      
      // Simulate user interaction
      titleInput.nativeElement.focus();
      titleInput.nativeElement.blur();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent.trim()).toContain('Title is required');
    });

    it('should show minlength error message when title is too short', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('ab');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.nativeElement.textContent.trim()).toContain('Title must be at least 3 characters');
    });

    it('should not show error message when title is valid', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('Valid Title');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const errorMessage = fixture.debugElement.query(By.css('.error-message'));
      expect(errorMessage).toBeFalsy();
    });
  });

  describe('Form Validation Methods', () => {
    it('should correctly identify invalid fields', () => {
      const titleControl = component.taskForm.get('title');
      
      // Field is invalid but not touched
      titleControl?.setValue('');
      expect(component.isFieldInvalid('title')).toBe(false);
      
      // Field is invalid and touched
      titleControl?.markAsTouched();
      expect(component.isFieldInvalid('title')).toBe(true);
      
      // Field is valid
      titleControl?.setValue('Valid Title');
      expect(component.isFieldInvalid('title')).toBe(false);
    });
  });

  describe('Form Submission', () => {
    it('should not submit when form is invalid', () => {
      component.taskForm.get('title')?.setValue(''); // Invalid
      
      component.onSubmit();
      
      expect(taskService.addTask).not.toHaveBeenCalled();
      expect(component.isSubmitting).toBe(false);
    });

    it('should submit valid form and call taskService.addTask', (done) => {
      // Set valid form values
      component.taskForm.patchValue({
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.HIGH,
        dueDate: '2023-12-31T10:00'
      });

      component.onSubmit();
      
      expect(component.isSubmitting).toBe(true);
      
      // Wait for async operation to complete
      setTimeout(() => {
        expect(taskService.addTask).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test Description',
          priority: TaskPriority.HIGH,
          completed: false,
          dueDate: new Date('2023-12-31T10:00')
        });
        expect(component.isSubmitting).toBe(false);
        expect(component.showSuccessMessage).toBe(true);
        done();
      }, 600);
    });

    it('should handle form submission without optional fields', (done) => {
      component.taskForm.patchValue({
        title: 'Simple Task',
        description: '',
        priority: TaskPriority.LOW,
        dueDate: ''
      });

      component.onSubmit();
      
      setTimeout(() => {
        expect(taskService.addTask).toHaveBeenCalledWith({
          title: 'Simple Task',
          description: '',
          priority: TaskPriority.LOW,
          completed: false,
          dueDate: undefined
        });
        done();
      }, 600);
    });

    it('should reset form after successful submission', (done) => {
      component.taskForm.patchValue({
        title: 'Test Task',
        description: 'Test Description'
      });

      component.onSubmit();
      
      setTimeout(() => {
        expect(component.taskForm.get('title')?.value).toBe('');
        expect(component.taskForm.get('description')?.value).toBe('');
        expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
        done();
      }, 600);
    });
  });

  describe('Success Message Display', () => {
    it('should show success message after form submission', (done) => {
      component.taskForm.patchValue({
        title: 'Test Task'
      });

      component.onSubmit();
      
      setTimeout(() => {
        fixture.detectChanges();
        
        const successMessage = fixture.debugElement.query(By.css('.success-message'));
        expect(successMessage).toBeTruthy();
        expect(successMessage.nativeElement.textContent.trim()).toContain('Task added successfully!');
        done();
      }, 600);
    });

    it('should hide success message after timeout', (done) => {
      component.taskForm.patchValue({
        title: 'Test Task'
      });

      component.onSubmit();
      
      setTimeout(() => {
        expect(component.showSuccessMessage).toBe(false);
        done();
      }, 3600);
    });
  });

  describe('Form Reset', () => {
    it('should reset form to default values', () => {
      // Set some values
      component.taskForm.patchValue({
        title: 'Test Task',
        description: 'Test Description',
        priority: TaskPriority.HIGH,
        dueDate: '2023-12-31T10:00'
      });

      component.onReset();

      expect(component.taskForm.get('title')?.value).toBe('');
      expect(component.taskForm.get('description')?.value).toBe('');
      expect(component.taskForm.get('priority')?.value).toBe(TaskPriority.MEDIUM);
      expect(component.taskForm.get('dueDate')?.value).toBe('');
      expect(component.showSuccessMessage).toBe(false);
    });
  });

  describe('Button States', () => {
    it('should disable submit button when form is invalid', () => {
      component.taskForm.get('title')?.setValue(''); // Invalid
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(true);
    });

    it('should enable submit button when form is valid', () => {
      component.taskForm.get('title')?.setValue('Valid Title');
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.disabled).toBe(false);
    });

    it('should show loading text when submitting', () => {
      component.isSubmitting = true;
      fixture.detectChanges();

      const submitButton = fixture.debugElement.query(By.css('button[type="submit"]'));
      expect(submitButton.nativeElement.textContent.trim()).toBe('Adding...');
    });
  });

  describe('Form Input Styling', () => {
    it('should apply error class to invalid fields', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const titleInput = fixture.debugElement.query(By.css('#title'));
      expect(titleInput.nativeElement.classList).toContain('error');
    });

    it('should not apply error class to valid fields', () => {
      const titleControl = component.taskForm.get('title');
      titleControl?.setValue('Valid Title');
      titleControl?.markAsTouched();
      fixture.detectChanges();

      const titleInput = fixture.debugElement.query(By.css('#title'));
      expect(titleInput.nativeElement.classList).not.toContain('error');
    });
  });
});
