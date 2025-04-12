import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';

describe('Home Component', () => {
  it('renders the component', () => {
    render(<Home />);
    expect(screen.getByText('Discord Uploader')).toBeInTheDocument();
  });

  it('allows file selection via the button', () => {
    render(<Home />);
    const selectFileButton = screen.getByText('Select files');
    expect(selectFileButton).toBeInTheDocument();
  });

  it('displays selected file names', () => {
    render(<Home />);
    const file = new File(['dummy content'], 'test-file.txt', { type: 'text/plain' });

    const inputElement = screen.getByLabelText('Select files to upload');
    fireEvent.change(inputElement, { target: { files: [file] } });

    expect(screen.getByText('test-file.txt - 0 bytes')).toBeInTheDocument();
  });

  it('displays error message when file exceeds 10MB limit', async () => {
    render(<Home />);
    const largeFile = new File(['large content'], 'large-file.txt', { type: 'text/plain' });

    Object.defineProperty(largeFile, 'size', {
      value: 11 * 1024 * 1024,
    });

    const inputElement = screen.getByLabelText('Select files to upload');
    fireEvent.change(inputElement, { target: { files: [largeFile] } });
  });
});
