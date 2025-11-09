import { Injectable, signal, computed } from '@angular/core';
import { Task, TaskPriority, TaskFilter } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // Angular 16 Signals for reactive state management
  private _tasks = signal<Task[]>([
    {
      id: '1',
      title: 'Learn Angular 16 Signals',
      description: 'Understand the new signals API',
      completed: false,
      priority: TaskPriority.HIGH,
      createdAt: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      id: '2',
      title: 'Implement Standalone Components',
      description: 'Create components without NgModule',
      completed: true,
      priority: TaskPriority.MEDIUM,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
    }
  ]);

  private _filter = signal<TaskFilter>({
    showCompleted: true,
    searchTerm: ''
  });

  // Computed signals for derived state
  tasks = computed(() => this._tasks());
  
  filteredTasks = computed(() => {
    const tasks = this._tasks();
    const filter = this._filter();
    
    return tasks.filter(task => {
      const matchesCompleted = filter.showCompleted || !task.completed;
      const matchesPriority = !filter.priority || task.priority === filter.priority;
      const matchesSearch = !filter.searchTerm || 
        task.title.toLowerCase().includes(filter.searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(filter.searchTerm.toLowerCase());
      
      return matchesCompleted && matchesPriority && matchesSearch;
    });
  });

  completedCount = computed(() => 
    this._tasks().filter(task => task.completed).length
  );

  totalCount = computed(() => this._tasks().length);

  addTask(task: Omit<Task, 'id' | 'createdAt'>): void {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date()
    };
    
    this._tasks.update(tasks => [...tasks, newTask]);
  }

  updateTask(id: string, updates: Partial<Task>): void {
    this._tasks.update(tasks => 
      tasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }

  deleteTask(id: string): void {
    this._tasks.update(tasks => 
      tasks.filter(task => task.id !== id)
    );
  }

  toggleTask(id: string): void {
    this._tasks.update(tasks =>
      tasks.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  updateFilter(filter: Partial<TaskFilter>): void {
    this._filter.update(current => ({ ...current, ...filter }));
  }

  getFilter() {
    return this._filter();
  }
}
