import {describe, expect, it} from 'vitest';

import {decodeNotification} from '@/types/Notification';

describe('decodeNotification', () => {
  it('maps a row to the DTO, converting createdAt to an ISO string', () => {
    const createdAt = new Date('2026-06-20T03:04:05.000Z');
    const dto = decodeNotification({
      id: 'n1',
      type: 'MATCH_FORMED',
      title: 'マッチング成立',
      body: '...',
      linkUrl: '/applications',
      isRead: false,
      createdAt,
    });

    expect(dto).toEqual({
      id: 'n1',
      type: 'MATCH_FORMED',
      title: 'マッチング成立',
      body: '...',
      linkUrl: '/applications',
      isRead: false,
      createdAt: '2026-06-20T03:04:05.000Z',
    });
  });

  it('preserves a null linkUrl', () => {
    const dto = decodeNotification({
      id: 'n2',
      type: 'DOCUMENT_APPROVED',
      title: '書類が認証されました',
      body: '...',
      linkUrl: null,
      isRead: true,
      createdAt: new Date('2026-06-20T00:00:00.000Z'),
    });

    expect(dto.linkUrl).toBeNull();
    expect(dto.isRead).toBe(true);
  });
});
