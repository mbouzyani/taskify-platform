# PROJECT SPECIFICATION DRAFT

## Taskify - Task Management Platform

### Version: 1.0.0
### Date: August 18, 2025

---

## PROJECT OVERVIEW

**Taskify** is a comprehensive task management platform designed for teams and organizations to efficiently manage projects, tasks, and team collaboration. The platform provides real-time dashboard analytics, project tracking, task assignment, and team management capabilities.

### Core Purpose
- Streamline project and task management workflows
- Provide real-time insights through interactive dashboards
- Enable seamless team collaboration and task tracking
- Offer secure, role-based access control for organizations

### Target Users
- **Project Managers**: Oversee projects, assign tasks, monitor progress
- **Team Members**: Track assigned tasks, update progress, collaborate
- **Administrators**: Manage users, configure system settings, view analytics

---

## SYSTEM ARCHITECTURE

### Architecture Pattern
**Clean Architecture with CQRS (Command Query Responsibility Segregation)**

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
├─────────────────────┬───────────────────────────────────────┤
│   Frontend (React)  │        Backend API (.NET Core)       │
│   Port: 5173        │        Port: 5217                     │
└─────────────────────┴───────────────────────────────────────┘
                              │
                    ┌─────────────────────┐
                    │  APPLICATION LAYER  │
                    │  (CQRS + MediatR)   │
                    └─────────────────────┘
                              │
                    ┌─────────────────────┐
                    │   DOMAIN LAYER      │
                    │ (Business Logic)    │
                    └─────────────────────┘
                              │
                    ┌─────────────────────┐
                    │ INFRASTRUCTURE      │
                    │ (Data Access)       │
                    └─────────────────────┘
                              │
                    ┌─────────────────────┐
                    │   SQL SERVER 2022   │
                    │   Port: 1433        │
                    └─────────────────────┘
```

### Technology Stack

#### Backend (.NET 9.0)
- **Framework**: ASP.NET Core Web API
- **Architecture**: Clean Architecture + CQRS
- **Authentication**: JWT Bearer Token
- **ORM**: Entity Framework Core 8.0
- **Database**: SQL Server 2022
- **Validation**: FluentValidation
- **Mapping**: AutoMapper
- **Mediator**: MediatR
- **Testing**: xUnit, FluentAssertions, Moq
- **Documentation**: Swagger/OpenAPI

#### Frontend (React 18.3.1)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.4
- **Routing**: React Router DOM 6.28
- **Icons**: Lucide React
- **State Management**: React Hooks + Context API
- **HTTP Client**: Native Fetch API

#### DevOps & Deployment
- **Containerization**: Docker & Docker Compose
- **Database**: SQL Server 2022 (Docker container)
- **Development**: Hot reload for both frontend and backend
- **Health Checks**: Container health monitoring

---

## DOMAIN MODEL

### Core Entities

#### 1. User Entity
```csharp
public class User : BaseEntity
{
    public string Name { get; private set; }
    public string Email { get; private set; }
    public string? Avatar { get; private set; }
    public UserRole Role { get; private set; }
    public Position Position { get; private set; }
    public string? Department { get; private set; }
    public string PasswordHash { get; private set; }
    
    // Navigation Properties
    public ICollection<Task> AssignedTasks { get; private set; }
    public ICollection<Project> AssignedProjects { get; private set; }
}
```

**Business Rules:**
- Email must be unique across the system
- Password must be securely hashed using BCrypt
- Users can be assigned to multiple projects
- Users can have multiple tasks assigned

#### 2. Project Entity
```csharp
public class Project : BaseIntEntity, IAggregateRoot
{
    public string Name { get; private set; }
    public string Description { get; private set; }
    public string Color { get; private set; }
    public ProjectStatus Status { get; private set; }
    
    // Navigation Properties
    public ICollection<Task> Tasks { get; private set; }
    public ICollection<User> AssignedUsers { get; private set; }
}
```

**Business Rules:**
- Project names must be unique within the organization
- Color must be a valid hex color code (7 characters)
- Projects can contain multiple tasks
- Projects support many-to-many relationships with users

#### 3. Task Entity
```csharp
public class Task : BaseEntity, IAggregateRoot
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public TaskStatus Status { get; private set; }
    public TaskPriority Priority { get; private set; }
    public int ProjectId { get; private set; }
    public Guid? AssigneeId { get; private set; }
    public DateTime? DueDate { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    
    // Navigation Properties
    public Project Project { get; private set; }
    public User? Assignee { get; private set; }
}
```

**Business Rules:**
- Tasks must belong to a project
- Tasks can optionally be assigned to a user
- Completion timestamp is automatically set when status changes to Completed
- Due dates are optional but recommended for priority tracking

#### 4. ActivityLog Entity
```csharp
public class ActivityLog : BaseIntEntity
{
    public string Title { get; private set; }
    public string Description { get; private set; }
    public DateTime Timestamp { get; private set; }
    public ActivityType Type { get; private set; }
    public Guid? UserId { get; private set; }
    
    // Navigation Properties
    public User? User { get; private set; }
}
```

### Enumerations

#### Task Status
```csharp
public enum TaskStatus
{
    Todo = 0,        // Not started
    InProgress = 1,  // Currently being worked on
    Review = 2,      // Awaiting review/approval
    Completed = 3    // Finished
}
```

#### Task Priority
```csharp
public enum TaskPriority
{
    Low = 0,      // Nice to have
    Medium = 1,   // Should have
    High = 2,     // Must have
    Urgent = 3    // Critical/blocking
}
```

#### Project Status
```csharp
public enum ProjectStatus
{
    Active = 0,     // Currently active
    OnHold = 1,     // Temporarily paused
    Completed = 2,  // Successfully finished
    Archived = 3    // No longer active
}
```

#### User Roles
```csharp
public enum UserRole
{
    Member = 0,         // Regular team member
    ProjectManager = 1, // Can manage projects and teams
    Admin = 2          // Full system access
}
```

#### Position Types
```csharp
public enum Position
{
    TeamMember = 0, TeamLead = 1, ProjectManager = 2,
    Director = 3, Executive = 4, FrontendDeveloper = 5,
    BackendDeveloper = 6, FullStackDeveloper = 7,
    DevOpsEngineer = 8, QAEngineer = 9, UIUXDesigner = 10,
    DataAnalyst = 11, ProductManager = 12, TechnicalLead = 13,
    SoftwareArchitect = 14, BusinessAnalyst = 15,
    SystemAdministrator = 16, DatabaseAdministrator = 17,
    SecurityEngineer = 18, MobileAppDeveloper = 19
}
```

---

## API DESIGN

### Authentication Endpoints
```
POST /api/auth/login
    Request: { email: string, password: string }
    Response: { accessToken: string, refreshToken: string, user: UserInfo }
    
POST /api/auth/logout
    Headers: Authorization: Bearer {token}
    Response: 204 No Content
```

### Dashboard Endpoints
```
GET /api/dashboard
    Headers: Authorization: Bearer {token}
    Response: DashboardDataResponse
    
GET /health
    Response: "Healthy" (200 OK)
```

### Projects Endpoints
```
GET /api/projects
    Response: List<ProjectDto>
    
GET /api/projects/{id}
    Response: ProjectDto
    
POST /api/projects
    Request: CreateProjectCommand
    Response: ProjectDto (201 Created)
    
PUT /api/projects/{id}
    Request: UpdateProjectCommand
    Response: ProjectDto
    
DELETE /api/projects/{id}
    Response: 204 No Content
```

### Tasks Endpoints
```
GET /api/tasks
    Query: ?status={status}&priority={priority}&projectId={id}
    Response: List<TaskDto>
    
GET /api/tasks/{id}
    Response: TaskDto
    
POST /api/tasks
    Request: CreateTaskCommand
    Response: TaskDto (201 Created)
    
PUT /api/tasks/{id}
    Request: UpdateTaskCommand
    Response: TaskDto
    
DELETE /api/tasks/{id}
    Response: 204 No Content
```

### Team Endpoints
```
GET /api/team/members
    Response: List<UserDto>
    
GET /api/team/members/{id}
    Response: UserDto
    
POST /api/team/members
    Request: CreateUserCommand
    Response: UserDto (201 Created)
    
PUT /api/team/members/{id}
    Request: UpdateUserCommand
    Response: UserDto
    
DELETE /api/team/members/{id}
    Response: 204 No Content
```

---

## USER INTERFACE DESIGN

### Design System

#### Color Palette
- **Primary**: Blue (#3B82F6, #2563EB, #1D4ED8)
- **Success**: Green (#10B981, #059669)
- **Warning**: Amber (#F59E0B, #D97706)
- **Danger**: Red (#EF4444, #DC2626)
- **Neutral**: Gray (#6B7280, #9CA3AF, #D1D5DB)

#### Typography
- **Font Family**: System fonts (San Francisco, Segoe UI, Roboto)
- **Headings**: Font weights 600-700
- **Body Text**: Font weight 400
- **Captions**: Font weight 500

#### Component Library
- **Cards**: Rounded corners (12px), subtle shadows
- **Buttons**: Gradient backgrounds, smooth transitions
- **Forms**: Consistent padding, focus states
- **Charts**: Interactive, color-coded, responsive

### Page Structure

#### 1. Dashboard Page
- **Header**: User info, search, notifications
- **Stats Cards**: Total tasks, completed, in-progress, overdue
- **Charts Section**: 
  - Tasks by status (donut chart)
  - Tasks by priority (bar chart)
  - Weekly completion trend (line chart)
- **Quick Actions**: Create task, view reports
- **Recent Activity**: Latest system activities

#### 2. Tasks Page
- **Filters**: Status, priority, assignee, due date
- **Task List**: Sortable, paginated table
- **Task Details**: Expandable rows with full information
- **Actions**: Create, edit, delete, assign, change status

#### 3. Projects Page
- **Project Cards**: Visual grid with progress indicators
- **Project Details**: Tasks count, completion percentage
- **Team Assignment**: User management per project
- **Progress Tracking**: Visual progress bars

#### 4. Team Page
- **Member Cards**: Avatar, name, role, department
- **Role Management**: Admin can change user roles
- **Activity Tracking**: Recent user activities
- **Department Filtering**: Group by departments

#### 5. Login Page
- **Centered Form**: Clean, professional design
- **Default Credentials**: Clearly displayed for demo
- **Error Handling**: Clear error messages
- **Responsive**: Works on all device sizes

---

## SECURITY & AUTHENTICATION

### Authentication Flow
1. **Login**: User submits credentials
2. **Validation**: Server validates against database
3. **Token Generation**: JWT token created with user claims
4. **Storage**: Token stored in localStorage (frontend)
5. **Authorization**: Token included in API requests
6. **Validation**: Server validates token on each request

### JWT Token Structure
```json
{
  "nameid": "user-guid",
  "name": "User Name",
  "email": "user@example.com",
  "role": "Admin|ProjectManager|Member",
  "position": "Position Name",
  "department": "Department Name",
  "exp": 1234567890,
  "iss": "TaskifyAPI",
  "aud": "TaskifyClient"
}
```

### Role-Based Access Control (RBAC)
- **Admin**: Full system access, user management
- **Project Manager**: Project and team management
- **Member**: Own tasks and assigned projects only

### Security Measures
- **Password Hashing**: BCrypt with salt
- **HTTPS**: Required for production
- **CORS**: Configured for specific origins
- **Token Expiration**: 1 hour access tokens
- **Refresh Tokens**: 7-day expiration
- **Input Validation**: Server-side validation for all inputs

---

## FEATURES & FUNCTIONALITY

### Core Features

#### 1. Task Management
- ✅ Create, read, update, delete tasks
- ✅ Task status tracking (Todo → In Progress → Review → Completed)
- ✅ Priority levels (Low, Medium, High, Urgent)
- ✅ Due date management
- ✅ Task assignment to team members
- ✅ Bulk task operations

#### 2. Project Management
- ✅ Project creation and management
- ✅ Project status tracking
- ✅ Team member assignment to projects
- ✅ Project-specific task organization
- ✅ Progress tracking and analytics
- ✅ Color-coded project identification

#### 3. Team Management
- ✅ User account management
- ✅ Role-based permissions
- ✅ Department organization
- ✅ Team member profiles
- ✅ Activity tracking

#### 4. Dashboard & Analytics
- ✅ Real-time statistics
- ✅ Interactive charts and graphs
- ✅ Progress visualization
- ✅ Activity feed
- ✅ Performance metrics
- ✅ Trend analysis

#### 5. User Experience
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Dark/light theme support (planned)
- ✅ Search and filtering
- ✅ Real-time notifications
- ✅ Intuitive navigation
- ✅ Accessibility compliance

### Advanced Features (Future Roadmap)
- 🔄 Real-time collaboration (WebSockets)
- 🔄 File attachments
- 🔄 Time tracking
- 🔄 Gantt charts
- 🔄 Email notifications
- 🔄 API integrations
- 🔄 Mobile application
- 🔄 Advanced reporting

---

## DATABASE DESIGN

### Database Schema

#### Tables Overview
1. **Users** - User accounts and authentication
2. **Projects** - Project information and metadata
3. **Tasks** - Individual tasks and their properties
4. **ActivityLogs** - System activity tracking
5. **UserProjects** - Many-to-many relationship table
6. **__EFMigrationsHistory** - Entity Framework migrations

#### Relationships
```
Users (1) ←→ (N) Tasks (AssigneeId)
Projects (1) ←→ (N) Tasks (ProjectId)
Users (N) ←→ (N) Projects (UserProjects junction table)
Users (1) ←→ (N) ActivityLogs (UserId)
```

#### Indexes
- **Users**: Email (unique), Role
- **Tasks**: Status, Priority, ProjectId, AssigneeId
- **Projects**: Status, Name
- **ActivityLogs**: Timestamp, Type, UserId

#### Data Constraints
- **Foreign Keys**: Cascade delete for Projects→Tasks
- **Set Null**: Task assignee when user deleted
- **Required Fields**: Names, emails, titles
- **Data Types**: GUIDs for Users/Tasks, integers for Projects

---

## DEPLOYMENT & INFRASTRUCTURE

### Development Environment

#### Prerequisites
- Docker Desktop
- Node.js 18+
- .NET 9.0 SDK
- Git

#### Quick Start
```bash
# Clone repository
git clone https://github.com/mbouzyani/taskify-platform.git
cd taskify-platform

# Start backend services
cd Taskify-Backend
docker-compose up --build -d

# Start frontend (in new terminal)
cd ../taskify-frontend
npm install
npm run dev
```

#### Default Access
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5217
- **Database**: localhost:1433
- **Default Admin**: admin@taskify.com / Admin123!

### Production Considerations

#### Scalability
- **Horizontal Scaling**: Multiple API instances behind load balancer
- **Database**: SQL Server with read replicas
- **Caching**: Redis for session management
- **CDN**: Static asset delivery

#### Monitoring
- **Health Checks**: Container and application health
- **Logging**: Structured logging with Serilog
- **Metrics**: Application performance monitoring
- **Alerts**: Critical error notifications

#### Security
- **HTTPS**: Required for all communications
- **Secrets Management**: Azure Key Vault or similar
- **Environment Variables**: Configuration management
- **Backup Strategy**: Regular database backups

---

## TESTING STRATEGY

### Backend Testing

#### Unit Tests (25 tests implemented)
- **Controllers**: 100% coverage for API endpoints
- **Handlers**: Command and query handler testing
- **Domain Logic**: Business rule validation
- **Services**: Authentication and business services

#### Test Structure
```csharp
// Example controller test
[Fact]
public async Task CreateProject_WithValidData_ReturnsCreatedResult()
{
    // Arrange
    var command = new CreateProjectCommand { Name = "Test Project" };
    var expectedResult = new ProjectDto { Id = 1, Name = "Test Project" };
    
    // Act
    var result = await _controller.CreateProject(command);
    
    // Assert
    result.Should().BeOfType<CreatedAtActionResult>();
}
```

#### Testing Tools
- **xUnit**: Testing framework
- **FluentAssertions**: Assertion library
- **Moq**: Mocking framework
- **AutoFixture**: Test data generation

### Frontend Testing (Planned)
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: User interaction flows
- **E2E Tests**: Complete user scenarios
- **Accessibility Tests**: WCAG compliance

---

## 📚 DOCUMENTATION

### API Documentation
- **Swagger/OpenAPI**: Interactive API documentation
- **Endpoint Documentation**: Request/response examples
- **Authentication Guide**: JWT implementation details
- **Error Handling**: Standard error response formats

### User Documentation
- **Setup Guide**: Installation and configuration
- **User Manual**: Feature explanations and workflows
- **Admin Guide**: Administrative tasks and configuration
- **Troubleshooting**: Common issues and solutions

### Developer Documentation
- **Architecture Guide**: System design principles
- **Contributing Guidelines**: Development standards
- **Code Style**: Formatting and naming conventions
- **Deployment Guide**: Production deployment steps

---

## 🔄 VERSION HISTORY

### Version 1.0.0 (Current)
**Release Date**: August 18, 2025

#### Features Implemented
- ✅ Complete backend API with Clean Architecture
- ✅ React frontend with TypeScript
- ✅ JWT authentication system
- ✅ Docker containerization
- ✅ Task management (CRUD operations)
- ✅ Project management
- ✅ Team management
- ✅ Interactive dashboard with charts
- ✅ Role-based access control
- ✅ Database migrations
- ✅ Comprehensive testing suite
- ✅ API documentation

#### Technical Achievements
- ✅ Clean Architecture implementation
- ✅ CQRS pattern with MediatR
- ✅ Entity Framework Core integration
- ✅ Responsive UI design
- ✅ Container orchestration
- ✅ Health monitoring
- ✅ Error handling and validation

### Planned Future Versions

#### Version 1.1.0 (Q1 2026)
- Real-time notifications
- File attachment support
- Enhanced charts and reporting
- Email integration
- Performance optimizations

#### Version 1.2.0 (Q2 2026)
- Mobile application
- Time tracking features
- Gantt chart visualization
- Advanced filtering and search
- Bulk operations

#### Version 2.0.0 (Q3 2026)
- Multi-tenant architecture
- Advanced analytics
- Third-party integrations
- Workflow automation
- Enterprise features

---

## 🎯 PROJECT GOALS & SUCCESS METRICS

### Primary Objectives
1. **User Productivity**: Increase task completion rates by 30%
2. **Team Collaboration**: Improve project visibility and communication
3. **Management Insights**: Provide actionable analytics and reporting
4. **System Reliability**: Achieve 99.9% uptime
5. **User Satisfaction**: Maintain user satisfaction score above 4.5/5

### Key Performance Indicators
- **Response Time**: API responses under 200ms
- **User Adoption**: 80% active user rate
- **Bug Rate**: Less than 1 critical bug per month
- **Test Coverage**: Maintain above 80% code coverage
- **Documentation**: 100% API endpoint documentation

### Success Criteria
- ✅ Successful deployment in containerized environment
- ✅ Complete feature implementation as specified
- ✅ Comprehensive testing coverage
- ✅ Security implementation with role-based access
- ✅ Responsive and intuitive user interface
- ✅ Performance optimization and monitoring

---

## 🤝 TEAM & STAKEHOLDERS

### Development Team
- **Backend Developer**: .NET Core, Entity Framework, SQL Server
- **Frontend Developer**: React, TypeScript, Tailwind CSS
- **DevOps Engineer**: Docker, CI/CD, Cloud deployment
- **QA Engineer**: Testing automation, quality assurance
- **UI/UX Designer**: User interface and experience design

### Stakeholders
- **Product Owner**: Feature prioritization and requirements
- **Project Manager**: Timeline and resource management
- **End Users**: Feedback and acceptance testing
- **System Administrators**: Infrastructure and security
- **Business Analysts**: Requirements gathering and validation

---

## 📞 SUPPORT & MAINTENANCE

### Support Channels
- **Documentation**: Comprehensive guides and API references
- **Issue Tracking**: GitHub Issues for bug reports and feature requests
- **Community**: Developer community forums and discussions
- **Professional Support**: Enterprise support packages

### Maintenance Schedule
- **Regular Updates**: Monthly feature releases
- **Security Patches**: Immediate critical security updates
- **Dependency Updates**: Quarterly dependency reviews
- **Performance Reviews**: Monthly performance analysis
- **Backup Verification**: Weekly backup integrity checks

### SLA Commitments
- **Uptime**: 99.9% availability
- **Response Time**: 4-hour response for critical issues
- **Resolution Time**: 24-hour resolution for critical bugs
- **Updates**: Monthly feature and security updates
- **Data Backup**: Daily automated backups with 30-day retention

---

*This document serves as the comprehensive specification for the Taskify Task Management Platform. It will be updated as the project evolves and new features are implemented.*
