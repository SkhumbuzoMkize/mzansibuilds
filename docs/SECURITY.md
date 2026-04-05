# MzansiBuilds — Security Documentation

## Security Philosophy

Security is not an afterthought in MzansiBuilds — it is built into every layer
of the application from the ground up.

## 1. Authentication & Authorization

- **Supabase Auth** handles all authentication using industry-standard JWT tokens
- Passwords are never stored in plain text — Supabase uses bcrypt hashing
- JWT tokens expire and are automatically refreshed
- All protected routes require a valid session via `PrivateRoute` component

## 2. Row Level Security (RLS)

Every database table has RLS enabled. Users can only access data they are
permitted to see or modify.

### Profiles

- Anyone can view profiles (public platform)
- Only the owner can update their own profile

### Projects

- Anyone can view projects (public feed)
- Only the authenticated owner can create, update or delete their projects

### Comments & Likes

- Anyone can view comments and likes
- Only authenticated users can create comments or likes
- Users can only delete their own likes

### Storage (Avatars)

- Avatar images are publicly readable
- Users can only upload/update their own avatar file

## 3. Environment Variables

All sensitive credentials are stored in environment variables and never
committed to the repository:

- `VITE_SUPABASE_URL` — Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — Public anon key (safe for frontend)
- `.env` files are listed in `.gitignore`
- GitHub Actions uses encrypted repository secrets

## 4. Input Validation

- All form inputs use HTML5 validation (required, minLength, type)
- Email fields enforce valid email format
- Password minimum length of 6 characters enforced
- Tech stack and project fields sanitized before database insertion

## 5. SQL Injection Prevention

- All database queries use Supabase's parameterized query builder
- No raw SQL queries are constructed from user input
- Supabase client handles all query escaping automatically

## 6. XSS Prevention

- React's JSX automatically escapes all dynamic content
- No use of `dangerouslySetInnerHTML`
- All user-generated content is rendered as text, not HTML

## 7. CORS & API Security

- Supabase enforces CORS policies on all API requests
- API keys are scoped — anon key has limited permissions
- Service role key is never exposed to the frontend

## 8. Secure File Upload

- Avatar uploads restricted to image file types only (`accept="image/*"`)
- Files are stored in Supabase Storage with RLS policies
- File names are namespaced by user ID to prevent collisions

## 9. Dependency Security

- `npm audit` run on every CI pipeline execution
- 0 vulnerabilities found in current dependency tree

## Security Checklist

- [x] RLS enabled on all tables
- [x] JWT authentication
- [x] Environment variables for secrets
- [x] Input validation on all forms
- [x] Parameterized queries (no SQL injection)
- [x] XSS prevention via React JSX
- [x] Secure file upload restrictions
- [x] CORS protection via Supabase
- [x] CI/CD pipeline with security checks
