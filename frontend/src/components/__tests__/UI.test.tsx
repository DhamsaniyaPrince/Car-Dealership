import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button, Input, Card, Modal } from '../UI';

describe('UI Shared Components Tests', () => {
  describe('Button Component', () => {
    it('should render children content correctly', () => {
      render(<Button>Click Me</Button>);
      expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('should fire click event callback', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByText('Click Me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should disable button and display loading indicator if isLoading is true', () => {
      render(<Button isLoading>Click Me</Button>);
      
      const buttonEl = screen.getByRole('button');
      expect(buttonEl).toBeDisabled();
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('should display label text and input element', () => {
      render(<Input label="Username" placeholder="Enter username" readOnly />);
      
      expect(screen.getByText('Username')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('should output validation error label if present', () => {
      render(<Input label="Email" error="Invalid email structure" readOnly />);
      
      expect(screen.getByText('Invalid email structure')).toBeInTheDocument();
    });
  });

  describe('Card Component', () => {
    it('should render children content cleanly', () => {
      render(
        <Card>
          <div>Card content</div>
        </Card>
      );
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });
  });

  describe('Modal Component', () => {
    it('should display modal content and headers when isOpen is true', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Modal Header">
          <div>Inside Modal</div>
        </Modal>
      );

      expect(screen.getByText('Modal Header')).toBeInTheDocument();
      expect(screen.getByText('Inside Modal')).toBeInTheDocument();
    });

    it('should not render anything when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={() => {}} title="Modal Header">
          <div>Inside Modal</div>
        </Modal>
      );

      expect(screen.queryByText('Modal Header')).not.toBeInTheDocument();
      expect(screen.queryByText('Inside Modal')).not.toBeInTheDocument();
    });
  });
});
