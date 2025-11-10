import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SignInPage from './page';

describe('SignInPage', () => {
  const originalFetch = global.fetch;
  const originalLocation = window.location;

  beforeEach(() => {
    vi.resetAllMocks();
    // @ts-expect-error override
    delete (window as any).location;
    // @ts-expect-error override
    window.location = { href: '' } as any;
  });

  afterEach(() => {
    global.fetch = originalFetch as any;
    window.location = originalLocation;
  });

  it('shows validation error when fields are empty', async () => {
    render(<SignInPage />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Please enter your email and password.');
  });

  it('redirects to home on successful sign in', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', email: 'a@b.com' } }),
    } as any);

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'StrongPass123!' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    // Wait for redirect effect
    await screen.findByRole('button', { name: /sign in/i });

    expect(window.location.href).toBe('/');

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/auth/sign-in/email',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
    );
  });

  it('shows BetterAuth error code message when API fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ code: 'INVALID_EMAIL_OR_PASSWORD', message: 'Failed to sign in.' }),
    } as any);

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Wrong!' } });

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Failed to sign in. (INVALID_EMAIL_OR_PASSWORD)');
  });
});
