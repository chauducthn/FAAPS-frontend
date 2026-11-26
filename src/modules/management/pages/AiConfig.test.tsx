import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AiConfigPage from './AiConfig';

const listConfigs = vi.fn();
const listPresets = vi.fn();

vi.mock('../services/ai-config.service', () => ({
  aiConfigService: {
    list: (...args: unknown[]) => listConfigs(...args),
    listPresets: (...args: unknown[]) => listPresets(...args),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
}));

const CONFIGS = [
  {
    id: 'c1',
    name: 'Gemini Chat',
    provider: 'GEMINI',
    modelName: 'gemini-2.0-flash',
    purpose: 'CHAT',
    temperature: 0.7,
    maxTokens: 2048,
    isActive: true,
    apiKeyMasked: '***1234',
    updatedAt: '2026-11-20T10:00:00Z',
  },
  {
    id: 'c2',
    name: 'Gemini Embed',
    provider: 'GEMINI',
    modelName: 'text-embedding-004',
    purpose: 'EMBEDDING',
    temperature: 0.0,
    maxTokens: 1024,
    isActive: false,
    apiKeyMasked: '***5678',
    updatedAt: '2026-11-20T10:00:00Z',
  },
];

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AiConfigPage />
    </QueryClientProvider>,
  );
}

describe('AiConfigPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    listPresets.mockResolvedValue([]);
    listConfigs.mockImplementation(async (params?: { search?: string; isActive?: boolean; purpose?: string }) => {
      let items = CONFIGS;
      if (params?.search) {
        const q = params.search.toLowerCase();
        items = items.filter((c) => c.name.toLowerCase().includes(q));
      }
      if (params?.isActive !== undefined) {
        items = items.filter((c) => c.isActive === params.isActive);
      }
      if (params?.purpose) {
        items = items.filter((c) => c.purpose === params.purpose);
      }
      return { items, page: 0, size: 10, totalItems: items.length, totalPages: 1 };
    });
  });

  it('displays 0 instead of an em-dash when a filter matches zero configurations', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Gemini Chat')).toBeInTheDocument();
    await user.type(screen.getByRole('searchbox'), 'nonexistent-model');

    await waitFor(() => expect(screen.queryByText('Gemini Chat')).not.toBeInTheDocument());
    const totalLabel = screen.getByText('Total configurations');
    expect(totalLabel.parentElement?.textContent).toContain('0');
    expect(totalLabel.parentElement?.textContent).not.toContain('—');
  });

  it('toggles Active and Chat stat tiles independently', async () => {
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Gemini Chat')).toBeInTheDocument();

    await user.click(screen.getByText('Chat on page'));
    await waitFor(() => {
      expect(listConfigs.mock.calls.at(-1)?.[0]).toMatchObject({ purpose: 'CHAT' });
    });

    await user.click(screen.getByText('Active on page'));
    await waitFor(() => {
      expect(listConfigs.mock.calls.at(-1)?.[0]).toMatchObject({ purpose: 'CHAT', isActive: true });
    });

    await user.click(screen.getByText('Total configurations'));
    await waitFor(() => {
      const last = listConfigs.mock.calls.at(-1)?.[0];
      expect(last?.purpose).toBeUndefined();
      expect(last?.isActive).toBeUndefined();
    });
  });
});
