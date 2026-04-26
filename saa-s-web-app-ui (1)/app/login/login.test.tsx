import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as authStore from '@/lib/auth/authStore'
import * as savedAccounts from '@/lib/auth/savedAccounts'
import * as useAuth from '@/lib/auth/useAuth'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

vi.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

vi.mock('@/components/ui/label', () => ({
  Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}))

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  CardHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
}))

vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsList: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TabsTrigger: ({ children, ...props }: any) => <button {...props}>{children}</button>,
}))

vi.mock('@/components/theme-toggle', () => ({
  ThemeToggle: () => <button>Theme</button>,
}))

vi.mock('@/lib/auth/authStore', () => ({
  useAuthStore: vi.fn(),
}))

vi.mock('@/lib/auth/useAuth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/lib/auth/savedAccounts', () => ({
  getSavedAccounts: vi.fn(),
  removeSavedAccount: vi.fn(),
  getAccountInitials: vi.fn(),
}))

const mockUser = {
  id: 1,
  email: 'test@test.com',
  username: 'testuser',
  role: 'STUDENT' as const,
  first_name: 'Test',
  last_name: 'User',
  created_at: '2024-01-01',
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(authStore.useAuthStore).mockReturnValue({
      login: vi.fn().mockResolvedValue(mockUser),
      user: null,
      isInitialized: false,
      isLoading: false,
    } as any)

    vi.mocked(useAuth.useAuth).mockReturnValue({
      user: null,
      isInitialized: true,
    })

    vi.mocked(savedAccounts.getSavedAccounts).mockReturnValue([])
    vi.mocked(savedAccounts.getAccountInitials).mockReturnValue('TU')
  })

  it('renders login form with submit buttons', async () => {
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByRole('button', { name: /sign in as teacher/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in as student/i })).toBeInTheDocument()
  })

  it('renders sign up link', async () => {
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute('href', '/register')
  })

  it('shows saved accounts when available', async () => {
    const savedAccountsList = [
      {
        email: 'teacher@test.com',
        firstName: 'Test',
        lastName: 'Teacher',
        role: 'TEACHER' as const,
      },
    ]

    vi.mocked(savedAccounts.getSavedAccounts).mockReturnValue(savedAccountsList)
    vi.mocked(savedAccounts.getAccountInitials).mockReturnValue('TT')

    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getByText(/choose an account/i)).toBeInTheDocument()
    expect(screen.getByText('Test Teacher')).toBeInTheDocument()
  })

  it('renders login form with input fields', async () => {
    const { default: LoginPage } = await import('@/app/login/page')
    render(<LoginPage />)

    expect(screen.getAllByRole('textbox')).toHaveLength(2)
    expect(screen.getByPlaceholderText(/you@student.edu/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/you@university.edu/i)).toBeInTheDocument()
  })
})