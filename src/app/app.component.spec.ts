import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { TaskService } from './services/task.service';
import { By } from '@angular/platform-browser';

describe('AppComponent', () => {
  let taskService: jasmine.SpyObj<TaskService>;

  beforeEach(async () => {
    const taskServiceSpy = jasmine.createSpyObj('TaskService', [
      'tasks', 'filteredTasks', 'totalCount', 'completedCount', 
      'addTask', 'updateTask', 'deleteTask', 'toggleTask', 'updateFilter', 'getFilter'
    ]);

    await TestBed.configureTestingModule({
      imports: [AppComponent], // Angular 16 Standalone Component Testing
      providers: [
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    taskService = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('task-manager-ng16');
  });

  it('should render Angular 16 features in header', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const headerElement = fixture.debugElement.query(By.css('.app-header h1'));
    expect(headerElement.nativeElement.textContent).toContain('Task Manager - Angular 16');
    
    const subtitleElement = fixture.debugElement.query(By.css('.subtitle'));
    expect(subtitleElement.nativeElement.textContent).toContain('Showcasing Angular 16 Features');
  });

  it('should display Angular 16 feature badges', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const badges = fixture.debugElement.queryAll(By.css('.badge'));
    expect(badges.length).toBe(4);
    
    const badgeTexts = badges.map(badge => badge.nativeElement.textContent);
    expect(badgeTexts).toContain('Standalone Components');
    expect(badgeTexts).toContain('Signals');
    expect(badgeTexts).toContain('Control Flow');
    expect(badgeTexts).toContain('Required Inputs');
  });

  it('should include add-task and task-list components', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const addTaskComponent = fixture.debugElement.query(By.css('app-add-task'));
    const taskListComponent = fixture.debugElement.query(By.css('app-task-list'));
    
    expect(addTaskComponent).toBeTruthy();
    expect(taskListComponent).toBeTruthy();
  });

  it('should have proper layout structure', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const appContainer = fixture.debugElement.query(By.css('.app-container'));
    const header = fixture.debugElement.query(By.css('.app-header'));
    const main = fixture.debugElement.query(By.css('.app-main'));
    const footer = fixture.debugElement.query(By.css('.app-footer'));
    
    expect(appContainer).toBeTruthy();
    expect(header).toBeTruthy();
    expect(main).toBeTruthy();
    expect(footer).toBeTruthy();
  });

  it('should display footer with upgrade message', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    
    const footerText = fixture.debugElement.query(By.css('.app-footer p'));
    expect(footerText.nativeElement.textContent).toContain('Built with Angular 16');
    expect(footerText.nativeElement.textContent).toContain('Ready for upgrade to Angular 19');
  });
});
