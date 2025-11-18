# Angular Migration Standards & Best Practices

## Overview
This document outlines organizational standards and best practices for Angular framework migrations, derived from past migration experiences. These guidelines apply to any Angular version upgrade (e.g., Angular 12→16, 16→19, 19→20).

---

## 1. Pre-Migration Assessment

### 1.1 Version Gap Analysis
- **Never skip more than 2 major versions** in a single migration
- Document current version and target version
- Review official Angular update guide: https://update.angular.io
- Identify breaking changes and deprecated APIs

### 1.2 Dependency Audit
- List all third-party libraries and their Angular compatibility
- Identify libraries without active maintenance
- Check for peer dependency conflicts
- Plan library upgrades alongside Angular upgrade

### 1.3 Codebase Health Check
- Run linting and fix existing issues
- Ensure all tests pass before migration
- Document technical debt that may block migration
- Measure current bundle size and performance metrics

---

## 2. Migration Planning

### 2.1 Phased Approach
- **Phase 1**: Update Angular CLI and core framework
- **Phase 2**: Update Angular Material and CDK (if used)
- **Phase 3**: Update third-party dependencies
- **Phase 4**: Refactor deprecated code
- **Phase 5**: Adopt new features (optional)

### 2.2 Branch Strategy
- Create dedicated migration branch from main/master
- Use feature flags for gradual rollout if needed
- Plan for rollback strategy
- Set clear merge criteria

---

## 3. Migration Execution Standards

### 3.1 Use Official Tools
```bash
# Always use Angular CLI update command
ng update @angular/cli @angular/core

# Update other packages individually
ng update @angular/material
```

### 3.2 Incremental Updates
- Update one major version at a time
- Run tests after each version increment
- Commit after each successful version update
- Document issues encountered at each step

### 3.3 Code Modernization Order
1. Fix compilation errors
2. Fix failing tests
3. Address deprecation warnings
4. Refactor to new patterns (standalone, signals, etc.)
5. Optimize performance

---

## 4. Code Standards Post-Migration

### 4.1 Module vs Standalone Decision
- **New applications**: Use standalone components exclusively
- **Existing applications**: Hybrid approach acceptable
- **Migration path**: Convert leaf components first, then containers
- **Deadline**: Set target date for full standalone conversion

**Before (NgModule-based):**
```typescript
// user-profile.module.ts
@NgModule({
  declarations: [UserProfileComponent, UserAvatarComponent],
  imports: [CommonModule, FormsModule, SharedModule],
  exports: [UserProfileComponent]
})
export class UserProfileModule {}

// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {}
```

**After (Standalone):**
```typescript
// user-profile.component.ts
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, UserAvatarComponent],
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {}

// user-avatar.component.ts
@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [CommonModule],
  template: `<img [src]="avatarUrl" [alt]="userName" />`
})
export class UserAvatarComponent {
  @Input({ required: true }) avatarUrl!: string;
  @Input({ required: true }) userName!: string;
}
```

### 4.2 Reactive Patterns
- Prefer Signals over BehaviorSubject for simple state
- Use RxJS for complex async operations
- Avoid mixing Signals and Observables unnecessarily
- Document reactive pattern choices in architecture docs

**Before (BehaviorSubject):**
```typescript
// user.service.ts
export class UserService {
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();
  
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  setUser(user: User) {
    this.userSubject.next(user);
  }

  setLoading(loading: boolean) {
    this.loadingSubject.next(loading);
  }
}

// component.ts
export class ProfileComponent implements OnInit {
  user$ = this.userService.user$;
  loading$ = this.userService.loading$;
  
  constructor(private userService: UserService) {}
}
```

**After (Signals):**
```typescript
// user.service.ts
export class UserService {
  private _user = signal<User | null>(null);
  user = this._user.asReadonly();
  
  private _loading = signal<boolean>(false);
  loading = this._loading.asReadonly();
  
  // Computed values
  isAuthenticated = computed(() => this._user() !== null);
  userName = computed(() => this._user()?.name ?? 'Guest');

  setUser(user: User) {
    this._user.set(user);
  }

  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
}

// component.ts
export class ProfileComponent {
  userService = inject(UserService);
  
  // Direct signal access - no subscription needed
  user = this.userService.user;
  loading = this.userService.loading;
  isAuthenticated = this.userService.isAuthenticated;
}
```

### 4.3 Template Syntax
- Use new control flow (`@if`, `@for`, `@switch`) for new code
- Convert old templates during refactoring cycles
- Use self-closing tags for components without content
- Maintain consistent formatting

**Before (Structural Directives):**
```html
<!-- user-list.component.html -->
<div class="user-list">
  <div *ngIf="loading$ | async" class="loading-spinner">
    Loading users...
  </div>
  
  <div *ngIf="!(loading$ | async) && users.length > 0">
    <div *ngFor="let user of users; trackBy: trackByUserId" 
         class="user-card">
      <app-user-avatar [user]="user"></app-user-avatar>
      <div class="user-info">
        <h3>{{ user.name }}</h3>
        <p *ngIf="user.email">{{ user.email }}</p>
        <span *ngIf="user.isActive" class="badge">Active</span>
      </div>
    </div>
  </div>
  
  <div *ngIf="!(loading$ | async) && users.length === 0" 
       class="empty-state">
    No users found
  </div>
</div>
```

**After (New Control Flow):**
```html
<!-- user-list.component.html -->
<div class="user-list">
  @if (loading()) {
    <div class="loading-spinner">Loading users...</div>
  } @else if (users().length > 0) {
    @for (user of users(); track user.id) {
      <div class="user-card">
        <app-user-avatar [user]="user" />
        <div class="user-info">
          <h3>{{ user.name }}</h3>
          @if (user.email) {
            <p>{{ user.email }}</p>
          }
          @if (user.isActive) {
            <span class="badge">Active</span>
          }
        </div>
      </div>
    }
  } @else {
    <div class="empty-state">No users found</div>
  }
</div>
```

### 4.4 Input/Output Modernization

**Before (Decorator-based):**
```typescript
export class DataTableComponent {
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() pageSize: number = 10;
  @Output() rowClick = new EventEmitter<any>();
  @Output() sortChange = new EventEmitter<SortEvent>();
  
  onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
```

**After (Signal-based - Angular 17+):**
```typescript
export class DataTableComponent {
  data = input.required<any[]>();
  columns = input.required<Column[]>();
  pageSize = input<number>(10);
  
  rowClick = output<any>();
  sortChange = output<SortEvent>();
  
  onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
```

### 4.5 Dependency Injection

**Before (Constructor Injection):**
```typescript
export class OrderService {
  constructor(
    private http: HttpClient,
    private logger: LoggerService,
    private config: ConfigService,
    private auth: AuthService
  ) {}
}
```

**After (inject() function):**
```typescript
export class OrderService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private config = inject(ConfigService);
  private auth = inject(AuthService);
  
  // Constructor now free for initialization logic
  constructor() {
    this.logger.info('OrderService initialized');
  }
}
```

### 4.6 Company-Specific Pattern: Custom Base Components

**Before (Inheritance-based):**
```typescript
// base-form.component.ts
export abstract class BaseFormComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  loading = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();
  
  constructor(
    protected fb: FormBuilder,
    protected notification: NotificationService
  ) {}
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  abstract buildForm(): FormGroup;
  abstract onSubmit(): void;
}

// employee-form.component.ts
export class EmployeeFormComponent extends BaseFormComponent {
  constructor(
    protected fb: FormBuilder,
    protected notification: NotificationService,
    private employeeService: EmployeeService
  ) {
    super(fb, notification);
  }
  
  buildForm(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }
  
  onSubmit() {
    // Implementation
  }
}
```

**After (Composition with Signals):**
```typescript
// form-state.service.ts
@Injectable()
export class FormStateService {
  private _loading = signal(false);
  loading = this._loading.asReadonly();
  
  private _error = signal<string | null>(null);
  error = this._error.asReadonly();
  
  setLoading(loading: boolean) {
    this._loading.set(loading);
  }
  
  setError(error: string | null) {
    this._error.set(error);
  }
  
  clearError() {
    this._error.set(null);
  }
}

// employee-form.component.ts
@Component({
  selector: 'app-employee-form',
  standalone: true,
  providers: [FormStateService],
  imports: [ReactiveFormsModule, CommonModule]
})
export class EmployeeFormComponent {
  private fb = inject(FormBuilder);
  private notification = inject(NotificationService);
  private employeeService = inject(EmployeeService);
  formState = inject(FormStateService);
  
  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]]
  });
  
  onSubmit() {
    if (this.form.valid) {
      this.formState.setLoading(true);
      this.employeeService.save(this.form.value)
        .subscribe({
          next: () => {
            this.notification.success('Employee saved');
            this.formState.setLoading(false);
          },
          error: (err) => {
            this.formState.setError(err.message);
            this.formState.setLoading(false);
          }
        });
    }
  }
}
```

### 4.7 Company-Specific Pattern: API Service Layer

**Before (Traditional Observable Pattern):**
```typescript
// api.service.ts
export class ApiService {
  private baseUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
  }
}

// employee.service.ts
export class EmployeeService {
  private employees$ = new BehaviorSubject<Employee[]>([]);
  
  constructor(private api: ApiService) {}
  
  loadEmployees() {
    this.api.get<Employee[]>('employees').subscribe(
      data => this.employees$.next(data)
    );
  }
  
  getEmployees(): Observable<Employee[]> {
    return this.employees$.asObservable();
  }
}
```

**After (Signal-based with Resource API - Angular 19+):**
```typescript
// employee.service.ts
export class EmployeeService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
  
  // Signal-based resource
  private refreshTrigger = signal(0);
  
  employees = toSignal(
    toObservable(this.refreshTrigger).pipe(
      switchMap(() => this.http.get<Employee[]>(`${this.baseUrl}/employees`))
    ),
    { initialValue: [] }
  );
  
  refresh() {
    this.refreshTrigger.update(v => v + 1);
  }
  
  // Or using rxResource (Angular 19+)
  employeesResource = rxResource({
    request: () => ({ refresh: this.refreshTrigger() }),
    loader: () => this.http.get<Employee[]>(`${this.baseUrl}/employees`)
  });
}
```

### 4.8 TypeScript Strict Mode
```json
{
  "compilerOptions": {
    "strict": true,
    "strictNullChecks": true,
    "strictPropertyInitialization": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

## 5. Testing Requirements

### 5.1 Test Coverage Maintenance
- Maintain or improve test coverage during migration
- Update test utilities for new Angular testing APIs
- Test both old and new patterns during transition
- Add integration tests for critical user flows

### 5.2 Testing Checklist
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass (if applicable)
- [ ] Manual smoke testing completed
- [ ] Performance benchmarks meet baseline
- [ ] Accessibility tests pass

### 5.3 Browser Compatibility
- Test on all supported browsers
- Verify polyfills are correctly configured
- Check for console errors/warnings
- Validate responsive behavior

---

## 6. Performance Standards

### 6.1 Bundle Size
- Document baseline bundle size before migration
- Target: No more than 5% increase post-migration
- Use `ng build --stats-json` and webpack-bundle-analyzer
- Optimize lazy loading and code splitting

### 6.2 Runtime Performance
- Measure Core Web Vitals (LCP, FID, CLS)
- Compare before/after metrics
- Profile change detection performance
- Monitor memory usage

### 6.3 Build Performance
- Document build time before migration
- Optimize build configuration
- Use build cache when available
- Consider esbuild for faster builds (Angular 16+)

---

## 7. Documentation Requirements

### 7.1 Migration Documentation
Create a migration report including:
- Versions upgraded (from → to)
- Breaking changes encountered
- Code patterns changed
- Dependencies updated/removed
- Known issues and workarounds
- Rollback procedure

### 7.2 Developer Guidelines
Update internal documentation:
- Component creation templates
- State management patterns
- Routing conventions
- Form handling standards
- HTTP interceptor patterns

### 7.3 Architecture Decision Records (ADRs)
Document key decisions:
- Why certain patterns were adopted
- Trade-offs considered
- Alternative approaches evaluated
- Future migration considerations

---

## 8. Common Pitfalls & Solutions

### 8.1 Dependency Hell
**Problem**: Incompatible peer dependencies  
**Solution**: Use `--force` or `--legacy-peer-deps` only as last resort; prefer updating dependencies

**Example:**
```bash
# Check for outdated packages
npm outdated

# Update specific package with peer dependency resolution
npm install @angular/material@16 --legacy-peer-deps

# Better approach: Update package.json manually and clean install
rm -rf node_modules package-lock.json
npm install
```

### 8.2 Breaking Changes in Libraries
**Problem**: Third-party library breaks after Angular update  
**Solution**: Check library's GitHub issues, consider alternatives, or fork temporarily

**Example - ngx-charts migration:**
```typescript
// Before (ngx-charts v19)
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
  imports: [NgxChartsModule]
})

// After (ngx-charts v20+ with standalone)
import { LineChartModule } from '@swimlane/ngx-charts';

@Component({
  standalone: true,
  imports: [LineChartModule]
})
```

### 8.3 TypeScript Compatibility
**Problem**: New Angular version requires newer TypeScript  
**Solution**: Update TypeScript first, fix type errors before Angular update

**Example - Strict null checks:**
```typescript
// Before (may cause errors with strict mode)
export class UserComponent {
  user: User;
  
  ngOnInit() {
    this.loadUser();
  }
  
  loadUser() {
    this.userService.getUser().subscribe(user => {
      this.user = user;
    });
  }
  
  getUserName(): string {
    return this.user.name; // Error: user may be undefined
  }
}

// After (TypeScript strict mode compatible)
export class UserComponent {
  user: User | null = null;
  
  ngOnInit() {
    this.loadUser();
  }
  
  loadUser() {
    this.userService.getUser().subscribe(user => {
      this.user = user;
    });
  }
  
  getUserName(): string {
    return this.user?.name ?? 'Unknown';
  }
}
```

### 8.4 Build Configuration Changes
**Problem**: angular.json structure changes between versions  
**Solution**: Review migration schematics output, compare with official docs

**Example - Builder changes:**
```json
// Before (Angular 15)
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser",
          "options": {
            "outputPath": "dist/app"
          }
        }
      }
    }
  }
}

// After (Angular 16+ with esbuild)
{
  "projects": {
    "app": {
      "architect": {
        "build": {
          "builder": "@angular-devkit/build-angular:browser-esbuild",
          "options": {
            "outputPath": "dist/app",
            "buildOptimizer": true
          }
        }
      }
    }
  }
}
```

### 8.5 Lazy Loading Issues
**Problem**: Lazy loaded modules fail after migration  
**Solution**: Verify route configuration, check for circular dependencies

**Before (Module-based lazy loading):**
```typescript
// app-routing.module.ts
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  }
];

// admin.module.ts
@NgModule({
  declarations: [AdminComponent],
  imports: [
    RouterModule.forChild([
      { path: '', component: AdminComponent }
    ])
  ]
})
export class AdminModule {}
```

**After (Standalone lazy loading):**
```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent)
  },
  // Or load multiple routes
  {
    path: 'dashboard',
    loadChildren: () => import('./dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES)
  }
];

// admin.component.ts
@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class AdminComponent {}

// dashboard.routes.ts
export const DASHBOARD_ROUTES: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'analytics', component: AnalyticsComponent }
];
```

### 8.6 RxJS Operator Changes
**Problem**: Deprecated RxJS operators or import paths  
**Solution**: Update to new operator syntax and imports

**Before (RxJS 6):**
```typescript
import { Observable } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';

getData(): Observable<Data> {
  return this.http.get<ApiResponse>('/api/data')
    .pipe(
      map(response => response.data),
      filter(data => data.isValid),
      catchError(error => {
        console.error(error);
        return of(null);
      })
    );
}
```

**After (RxJS 7+):**
```typescript
import { Observable, of } from 'rxjs';
import { map, filter, catchError } from 'rxjs/operators';

getData(): Observable<Data | null> {
  return this.http.get<ApiResponse>('/api/data')
    .pipe(
      map(response => response.data),
      filter((data): data is Data => data?.isValid ?? false),
      catchError(error => {
        console.error(error);
        return of(null);
      })
    );
}
```

### 8.7 Company-Specific: Custom Decorators Breaking
**Problem**: Custom property decorators incompatible with new Angular compiler  
**Solution**: Migrate to functional approach or Angular's built-in features

**Before (Custom decorator):**
```typescript
// custom-decorators.ts
export function LocalStorage(key: string) {
  return function(target: any, propertyKey: string) {
    let value = localStorage.getItem(key);
    
    Object.defineProperty(target, propertyKey, {
      get: () => value,
      set: (newValue) => {
        value = newValue;
        localStorage.setItem(key, newValue);
      }
    });
  };
}

// component.ts
export class SettingsComponent {
  @LocalStorage('theme') theme: string;
}
```

**After (Service-based approach):**
```typescript
// local-storage.service.ts
@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private cache = new Map<string, Signal<any>>();
  
  getSignal<T>(key: string, defaultValue: T): Signal<T> {
    if (!this.cache.has(key)) {
      const stored = localStorage.getItem(key);
      const initial = stored ? JSON.parse(stored) : defaultValue;
      const sig = signal(initial);
      this.cache.set(key, sig);
    }
    return this.cache.get(key)!;
  }
  
  set<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
    const sig = this.cache.get(key);
    if (sig) {
      (sig as any).set(value);
    }
  }
}

// component.ts
export class SettingsComponent {
  private storage = inject(LocalStorageService);
  theme = this.storage.getSignal('theme', 'light');
  
  setTheme(newTheme: string) {
    this.storage.set('theme', newTheme);
  }
}
```

### 8.8 ViewChild/ContentChild Timing Issues
**Problem**: ViewChild queries not working after migration  
**Solution**: Update query options for new timing behavior

**Before:**
```typescript
export class ParentComponent implements AfterViewInit {
  @ViewChild('childComponent') child: ChildComponent;
  
  ngAfterViewInit() {
    this.child.doSomething(); // May be undefined
  }
}
```

**After:**
```typescript
export class ParentComponent implements AfterViewInit {
  @ViewChild('childComponent', { static: false }) child!: ChildComponent;
  
  ngAfterViewInit() {
    // Guaranteed to be available here
    this.child.doSomething();
  }
  
  // Or use viewChild signal (Angular 17+)
  childSignal = viewChild.required<ChildComponent>('childComponent');
  
  ngAfterViewInit() {
    this.childSignal().doSomething();
  }
}
```

---

## 9. Company-Specific Migration Patterns

### 9.1 Shared Component Library Migration

**Scenario**: Organization has a shared component library used across multiple applications

**Strategy:**
1. Migrate library to standalone components first
2. Support both NgModule and standalone imports during transition
3. Deprecate NgModule exports after all apps migrate

**Before (Library with NgModule):**
```typescript
// libs/ui-components/src/lib/button/button.module.ts
@NgModule({
  declarations: [ButtonComponent],
  imports: [CommonModule],
  exports: [ButtonComponent]
})
export class ButtonModule {}

// libs/ui-components/src/public-api.ts
export * from './lib/button/button.module';
```

**After (Hybrid approach):**
```typescript
// libs/ui-components/src/lib/button/button.component.ts
@Component({
  selector: 'ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `<button [class]="buttonClass"><ng-content /></button>`
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  
  get buttonClass(): string {
    return `btn btn-${this.variant}`;
  }
}

// libs/ui-components/src/lib/button/button.module.ts (deprecated)
/** @deprecated Use standalone ButtonComponent directly */
@NgModule({
  imports: [ButtonComponent],
  exports: [ButtonComponent]
})
export class ButtonModule {}

// libs/ui-components/src/public-api.ts
export * from './lib/button/button.component';
export * from './lib/button/button.module'; // Keep for backward compatibility
```

### 9.2 Authentication Guard Migration

**Before (Class-based guard):**
```typescript
// auth.guard.ts
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}
  
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      map(isAuth => {
        if (!isAuth) {
          this.router.navigate(['/login']);
          return false;
        }
        return true;
      })
    );
  }
}

// app-routing.module.ts
const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
  }
];
```

**After (Functional guard):**
```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  return authService.isAuthenticated().pipe(
    map(isAuth => {
      if (!isAuth) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }
      return true;
    })
  );
};

// Or with signals
export const authGuardSignal: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
  return true;
};

// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  }
];
```

### 9.3 HTTP Interceptor Migration

**Before (Class-based interceptor):**
```typescript
// auth.interceptor.ts
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }
    
    return next.handle(req);
  }
}

// app.module.ts
@NgModule({
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
```

**After (Functional interceptor):**
```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
};

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      withInterceptors([authInterceptor, loggingInterceptor])
    )
  ]
};
```

### 9.4 Feature Flag Service Migration

**Before (Observable-based):**
```typescript
// feature-flag.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private flags$ = new BehaviorSubject<Record<string, boolean>>({});
  
  constructor(private http: HttpClient) {
    this.loadFlags();
  }
  
  loadFlags() {
    this.http.get<Record<string, boolean>>('/api/feature-flags')
      .subscribe(flags => this.flags$.next(flags));
  }
  
  isEnabled(flag: string): Observable<boolean> {
    return this.flags$.pipe(
      map(flags => flags[flag] ?? false)
    );
  }
}

// component.ts
export class FeatureComponent {
  showNewUI$ = this.featureFlags.isEnabled('new-ui');
  
  constructor(private featureFlags: FeatureFlagService) {}
}

// template
<div *ngIf="showNewUI$ | async">New UI</div>
```

**After (Signal-based):**
```typescript
// feature-flag.service.ts
@Injectable({ providedIn: 'root' })
export class FeatureFlagService {
  private http = inject(HttpClient);
  private _flags = signal<Record<string, boolean>>({});
  
  flags = this._flags.asReadonly();
  
  constructor() {
    this.loadFlags();
  }
  
  loadFlags() {
    this.http.get<Record<string, boolean>>('/api/feature-flags')
      .subscribe(flags => this._flags.set(flags));
  }
  
  isEnabled(flag: string): Signal<boolean> {
    return computed(() => this._flags()[flag] ?? false);
  }
}

// component.ts
export class FeatureComponent {
  private featureFlags = inject(FeatureFlagService);
  showNewUI = this.featureFlags.isEnabled('new-ui');
}

// template
@if (showNewUI()) {
  <div>New UI</div>
}
```

### 9.5 Data Table Component Migration

**Before (Complex NgModule component):**
```typescript
// data-table.component.ts
@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Output() rowClick = new EventEmitter<any>();
  
  displayedData: any[] = [];
  sortColumn: string | null = null;
  sortDirection: 'asc' | 'desc' = 'asc';
  
  ngOnInit() {
    this.displayedData = [...this.data];
  }
  
  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.displayedData = [...this.data];
      this.applySort();
    }
  }
  
  onSort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySort();
  }
  
  applySort() {
    if (!this.sortColumn) return;
    
    this.displayedData.sort((a, b) => {
      const aVal = a[this.sortColumn!];
      const bVal = b[this.sortColumn!];
      const comparison = aVal > bVal ? 1 : -1;
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }
}
```

**After (Signal-based with computed):**
```typescript
// data-table.component.ts
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DataTableComponent {
  data = input.required<any[]>();
  columns = input.required<TableColumn[]>();
  rowClick = output<any>();
  
  sortColumn = signal<string | null>(null);
  sortDirection = signal<'asc' | 'desc'>('asc');
  
  // Computed sorted data
  displayedData = computed(() => {
    const data = [...this.data()];
    const column = this.sortColumn();
    
    if (!column) return data;
    
    return data.sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];
      const comparison = aVal > bVal ? 1 : -1;
      return this.sortDirection() === 'asc' ? comparison : -comparison;
    });
  });
  
  onSort(column: string) {
    if (this.sortColumn() === column) {
      this.sortDirection.update(dir => dir === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortColumn.set(column);
      this.sortDirection.set('asc');
    }
  }
  
  onRowClick(row: any) {
    this.rowClick.emit(row);
  }
}
```

### 9.6 Multi-Step Form Wizard Migration

**Before (Service with BehaviorSubject):**
```typescript
// wizard.service.ts
@Injectable()
export class WizardService {
  private currentStepSubject = new BehaviorSubject<number>(0);
  currentStep$ = this.currentStepSubject.asObservable();
  
  private formDataSubject = new BehaviorSubject<Partial<FormData>>({});
  formData$ = this.formDataSubject.asObservable();
  
  nextStep() {
    this.currentStepSubject.next(this.currentStepSubject.value + 1);
  }
  
  previousStep() {
    this.currentStepSubject.next(this.currentStepSubject.value - 1);
  }
  
  updateFormData(data: Partial<FormData>) {
    this.formDataSubject.next({
      ...this.formDataSubject.value,
      ...data
    });
  }
}
```

**After (Signal-based service):**
```typescript
// wizard.service.ts
@Injectable()
export class WizardService {
  private _currentStep = signal(0);
  currentStep = this._currentStep.asReadonly();
  
  private _formData = signal<Partial<FormData>>({});
  formData = this._formData.asReadonly();
  
  // Computed properties
  canGoNext = computed(() => this._currentStep() < this.totalSteps - 1);
  canGoPrevious = computed(() => this._currentStep() > 0);
  isLastStep = computed(() => this._currentStep() === this.totalSteps - 1);
  
  totalSteps = 3;
  
  nextStep() {
    if (this.canGoNext()) {
      this._currentStep.update(step => step + 1);
    }
  }
  
  previousStep() {
    if (this.canGoPrevious()) {
      this._currentStep.update(step => step - 1);
    }
  }
  
  updateFormData(data: Partial<FormData>) {
    this._formData.update(current => ({ ...current, ...data }));
  }
  
  reset() {
    this._currentStep.set(0);
    this._formData.set({});
  }
}
```

---

## Resources

- **Official Angular Update Guide**: https://update.angular.io
- **Angular Blog**: https://blog.angular.io
- **Angular GitHub**: https://github.com/angular/angular
- **Angular CLI**: https://angular.io/cli
- **Community Discord**: https://discord.gg/angular

---

**Document Version**: 1.0  
**Last Updated**: 2025-11  
