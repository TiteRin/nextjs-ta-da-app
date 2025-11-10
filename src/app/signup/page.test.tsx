import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SignUpPage from './page';

const flushPromises = () => new Promise((r) => setTimeout(r));

describe('SignUpPage', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
  });

  it('renders fields and disabled language selector', () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();

    const language = screen.getByLabelText('Language') as HTMLSelectElement;
    expect(language).toBeInTheDocument();
    expect(language).toBeDisabled();
    expect(language.value).toBe('en');
  });

  it('shows validation error when submitting empty form', async () => {
    render(<SignUpPage />);

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Please fill in all fields.');
  });

  it('submits and shows success, then clears inputs', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'john@example.com' } }),
    } as any);

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/account has been created/i);

    // Wait for state updates to propagate
    await flushPromises();

    expect(screen.getByLabelText('Username')).toHaveValue('');
    expect(screen.getByLabelText('Email')).toHaveValue('');
    expect(screen.getByLabelText('Password')).toHaveValue('');

    // Ensure correct API call
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/sign-up/email',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('shows BetterAuth error code when API fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ code: 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL', message: 'User already exists' }),
    } as any);

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('User already exists (USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL)');
  });
});
