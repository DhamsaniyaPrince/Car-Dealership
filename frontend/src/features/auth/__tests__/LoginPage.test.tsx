import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LoginPage } from '../LoginPage';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';

// Mock context hooks
vi.mock('../../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../context/ToastContext', () => ({
  useToast: vi.fn(),
}));

describe('LoginPage Component and Form Tests', () => {
  let mockLogin: any;
  let mockToast: any;

  beforeEach(() => {
    mockLogin = vi.fn();
    mockToast = {
      success: vi.fn(),
      error: vi.fn(),
    };

    (useAuth as any).mockReturnValue({
      login: mockLogin,
    });

    (useToast as any).mockReturnValue({
      toast: mockToast,
    });
  });

  it('should render form inputs and submit button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /access account/i })).toBeInTheDocument();
  });

  it('should display validation warnings for invalid input formats', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByLabelText(/email address/i);
    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    
    fireEvent.click(screen.getByRole('button', { name: /access account/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email address')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('should call login service on valid submission', async () => {
    mockLogin.mockResolvedValue({ id: 'u-1', name: 'John Doe' });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@dealership.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /access account/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('john@dealership.com', 'password123');
    });
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('Welcome back!');
    });
  });

  it('should display error messages if login throws an exception', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Invalid email or password' } },
    });

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByLabelText(/email address/i), {
      target: { value: 'john@dealership.com' },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'wrongpass' },
    });

    fireEvent.click(screen.getByRole('button', { name: /access account/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
    expect(mockToast.error).toHaveBeenCalledWith('Invalid email or password');
  });
});
