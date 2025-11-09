import { TestBed } from '@angular/core/testing';
import { TaskService } from './task.service';
import { TaskPriority } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TaskService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Angular 16 Signals', () => {
    it('should initialize with default tasks', () => {
      const tasks = service.tasks();
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Learn Angular 16 Signals');
    });

    it('should compute total count correctly', () => {
      expect(service.totalCount()).toBe(2);
    });

    it('should compute completed count correctly', () => {
      expect(service.completedCount()).toBe(1);
    });

    it('should filter tasks based on completion status', () => {
      service.updateFilter({ showCompleted: false });
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].completed).toBe(false);
    });

    it('should filter tasks by search term', () => {
      service.updateFilter({ searchTerm: 'signals' });
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].title.toLowerCase()).toContain('signals');
    });

    it('should filter tasks by priority', () => {
      service.updateFilter({ priority: TaskPriority.HIGH });
      const filtered = service.filteredTasks();
      expect(filtered.length).toBe(1);
      expect(filtered[0].priority).toBe(TaskPriority.HIGH);
    });
  });

  describe('CRUD Operations', () => {
    it('should add new task and update signals', () => {
      const initialCount = service.totalCount();
      
      service.addTask({
        title: 'Test Task',
        description: 'Test Description',
        completed: false,
        priority: TaskPriority.LOW
      });

      expect(service.totalCount()).toBe(initialCount + 1);
      const tasks = service.tasks();
      const newTask = tasks[tasks.length - 1];
      expect(newTask.title).toBe('Test Task');
      expect(newTask.id).toBeDefined();
      expect(newTask.createdAt).toBeInstanceOf(Date);
    });

    it('should update existing task', () => {
      const tasks = service.tasks();
      const taskId = tasks[0].id;
      
      service.updateTask(taskId, { title: 'Updated Title' });
      
      const updatedTasks = service.tasks();
      const updatedTask = updatedTasks.find(t => t.id === taskId);
      expect(updatedTask?.title).toBe('Updated Title');
    });

    it('should toggle task completion', () => {
      const tasks = service.tasks();
      const taskId = tasks[0].id;
      const originalStatus = tasks[0].completed;
      
      service.toggleTask(taskId);
      
      const updatedTasks = service.tasks();
      const toggledTask = updatedTasks.find(t => t.id === taskId);
      expect(toggledTask?.completed).toBe(!originalStatus);
    });

    it('should delete task', () => {
      const tasks = service.tasks();
      const taskId = tasks[0].id;
      const initialCount = service.totalCount();
      
      service.deleteTask(taskId);
      
      expect(service.totalCount()).toBe(initialCount - 1);
      const remainingTasks = service.tasks();
      expect(remainingTasks.find(t => t.id === taskId)).toBeUndefined();
    });
  });

  describe('Filter Management', () => {
    it('should update filter and maintain state', () => {
      service.updateFilter({ 
        showCompleted: false, 
        searchTerm: 'test',
        priority: TaskPriority.HIGH 
      });
      
      const filter = service.getFilter();
      expect(filter.showCompleted).toBe(false);
      expect(filter.searchTerm).toBe('test');
      expect(filter.priority).toBe(TaskPriority.HIGH);
    });

    it('should partially update filter', () => {
      service.updateFilter({ searchTerm: 'initial' });
      service.updateFilter({ showCompleted: false });
      
      const filter = service.getFilter();
      expect(filter.searchTerm).toBe('initial');
      expect(filter.showCompleted).toBe(false);
    });
  });

  describe('Computed Signals Reactivity', () => {
    it('should update computed signals when tasks change', () => {
      const initialCompleted = service.completedCount();
      
      // Add completed task
      service.addTask({
        title: 'Completed Task',
        description: '',
        completed: true,
        priority: TaskPriority.LOW
      });
      
      expect(service.completedCount()).toBe(initialCompleted + 1);
      expect(service.totalCount()).toBe(3);
    });

    it('should update filtered tasks when filter changes', () => {
      const initialFiltered = service.filteredTasks().length;
      
      service.updateFilter({ showCompleted: false });
      
      const newFiltered = service.filteredTasks().length;
      expect(newFiltered).toBeLessThan(initialFiltered);
    });
  });
});
