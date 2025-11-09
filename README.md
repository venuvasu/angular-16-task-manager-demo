# Angular 16 Task Manager

A demonstration application showcasing **Angular 16 features** with a simple task management interface. This project is designed to highlight the key improvements and new capabilities introduced in Angular 16, and serves as a foundation for upgrading to Angular 19.

## 🚀 Angular 16 Features Demonstrated

### 1. **Standalone Components**
- No `NgModule` required
- Simplified component architecture
- Direct imports in component decorators

```typescript
@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [CommonModule],
  // ...
})
```

### 2. **Signals for Reactive State Management**
- Signal-based state management
- Computed signals for derived state
- Better performance and reactivity

```typescript
private _tasks = signal<Task[]>([]);
tasks = computed(() => this._tasks());
completedCount = computed(() => 
  this._tasks().filter(task => task.completed).length
);
```

### 3. **New Control Flow Syntax**
- `@if`, `@for`, `@switch` instead of structural directives
- Better performance and readability
- Improved template syntax

```typescript
@if (tasks().length > 0) {
  @for (task of tasks(); track task.id) {
    <app-task-item [task]="task" />
  }
} @else {
  <p>No tasks available</p>
}
```

### 4. **Required Inputs**
- Input validation at compile time
- Better type safety
- Cleaner component APIs

```typescript
@Input({ required: true }) task!: Task;
```

### 5. **Self-Closing Tags**
- Modern HTML syntax support
- Cleaner templates
- Better developer experience

```html
<app-task-item [task]="task" />
<input type="text" />
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── add-task/           # Form component with validation
│   │   ├── task-item/          # Individual task display
│   │   └── task-list/          # Task list with filtering
│   ├── models/
│   │   └── task.model.ts       # Task interfaces and enums
│   ├── services/
│   │   └── task.service.ts     # Signal-based state management
│   ├── app.component.ts        # Main app component
│   └── main.ts                 # Standalone bootstrap
```

## 🧪 Testing Features

The project includes comprehensive unit tests demonstrating:

- **Signals testing** - Testing reactive state management
- **Standalone component testing** - Testing without NgModule
- **Control flow testing** - Testing @if/@for conditions
- **Required inputs testing** - Testing input validation
- **Reactive forms testing** - Testing form validation and submission

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Angular CLI 16

### Installation

1. **Clone and install dependencies:**
```bash
cd task-manager-ng16
npm install
```

2. **Start development server:**
```bash
npm start
```

3. **Run tests:**
```bash
npm test
```

4. **Build for production:**
```bash
npm run build
```

## 📱 Features

- ✅ **Add Tasks** - Create new tasks with title, description, priority, and due date
- ✅ **Task Management** - Mark tasks as complete/incomplete
- ✅ **Filtering** - Filter by completion status, priority, and search terms
- ✅ **Validation** - Form validation with real-time feedback
- ✅ **Responsive Design** - Works on desktop and mobile devices

## 🔄 Upgrade Path to Angular 19

This application is structured to demonstrate the evolution from Angular 16 to Angular 19. Key areas that will show differences after upgrade:

### Code Changes Expected:
- **Enhanced Control Flow** - More optimized @if/@for performance
- **Signal Inputs/Outputs** - `input.required<T>()` and `output<T>()`
- **Material 3 Design** - Updated UI components and theming
- **Improved Hydration** - Better SSR performance
- **New Lifecycle Hooks** - `afterNextRender()` and others

### Performance Improvements:
- Faster compilation and build times
- Better runtime performance
- Enhanced developer experience

## 🛠️ Technology Stack

- **Angular 16.2** - Framework
- **TypeScript 5.1** - Language
- **RxJS 7.8** - Reactive programming
- **Jasmine/Karma** - Testing
- **SCSS** - Styling

## 📚 Learning Resources

- [Angular 16 Release Notes](https://blog.angular.io/angular-v16-is-here-4d7a28ec680d)
- [Signals Documentation](https://angular.io/guide/signals)
- [Standalone Components Guide](https://angular.io/guide/standalone-components)
- [New Control Flow Syntax](https://angular.io/guide/templates/control-flow)

## 🤝 Contributing

This is a demonstration project. Feel free to fork and experiment with Angular 16 features!

## 📄 License

MIT License - feel free to use this project for learning and demonstration purposes.

---

**Built with Angular 16 • Ready for upgrade to Angular 19** 🚀
