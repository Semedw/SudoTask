import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'
import * as authApi from '@/lib/api/auth'

vi.mock('@/lib/api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  getMe: vi.fn(),
  logout: vi.fn(),
}))

vi.mock('@/lib/auth/savedAccounts', () => ({
  saveAccount: vi.fn(),
}))

describe('useAuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: null,
      isInitialized: false,
      isLoading: false,
    })
  })

  it('has initial state', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isInitialized).toBe(false)
    expect(state.isLoading).toBe(false)
  })

  it('initialize sets user when authenticated', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      role: 'STUDENT' as const,
      first_name: 'Test',
      last_name: 'User',
      created_at: '2024-01-01',
    }

    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)

    await useAuthStore.getState().initialize()

    const state = useAuthStore.getState()
    expect(state.user).toEqual(mockUser)
    expect(state.isInitialized).toBe(true)
  })

  it('initialize sets user to null when not authenticated', async () => {
    vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'))

    await useAuthStore.getState().initialize()

    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isInitialized).toBe(true)
  })

  it('login sets user on success', async () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      role: 'STUDENT' as const,
      first_name: 'Test',
      last_name: 'User',
      created_at: '2024-01-01',
    }

    vi.mocked(authApi.login).mockResolvedValue({ user: mockUser })
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)

    const result = await useAuthStore.getState().login('test@test.com', 'password')

    expect(authApi.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    })
    expect(result).toEqual(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('login throws error on failure', async () => {
    vi.mocked(authApi.login).mockRejectedValue(new Error('Login failed'))

    await expect(
      useAuthStore.getState().login('test@test.com', 'wrongpassword')
    ).rejects.toThrow('Login failed')

    expect(useAuthStore.getState().isLoading).toBe(false)
  })

  it('logout clears user', async () => {
    vi.mocked(authApi.logout).mockResolvedValue()

    await useAuthStore.getState().logout()

    expect(authApi.logout).toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('setUser updates user state', () => {
    const mockUser = {
      id: 1,
      email: 'test@test.com',
      username: 'testuser',
      role: 'STUDENT' as const,
      first_name: 'Test',
      last_name: 'User',
      created_at: '2024-01-01',
    }

    useAuthStore.getState().setUser(mockUser)

    expect(useAuthStore.getState().user).toEqual(mockUser)
  })

  it('register creates user and sets state', async () => {
    const mockUser = {
      id: 1,
      email: 'new@test.com',
      username: 'newuser',
      role: 'TEACHER' as const,
      first_name: 'New',
      last_name: 'User',
      created_at: '2024-01-01',
    }

    vi.mocked(authApi.register).mockResolvedValue({ user: mockUser })
    vi.mocked(authApi.getMe).mockResolvedValue(mockUser)

    const result = await useAuthStore.getState().register({
      email: 'new@test.com',
      username: 'newuser',
      password: 'pass123',
      password2: 'pass123',
      role: 'TEACHER',
      first_name: 'New',
      last_name: 'User',
    })

    expect(authApi.register).toHaveBeenCalled()
    expect(result).toEqual(mockUser)
    expect(useAuthStore.getState().user).toEqual(mockUser)
  })
})