import { validateSignupInput } from '../../src/modules/auth/auth.validation.js';

const base = {
  name: 'Test Creator',
  email: ' Creator@Example.com ',
  password: 'StrongPassword123!',
  role: 'creator' as const,
};

describe('Role-specific signup validation', () => {
  test('accepts Creator accounts without social profiles', () => {
    const result = validateSignupInput(base);
    expect(result.email).toBe('creator@example.com');
    expect(result.instagramUsername).toBeUndefined();
    expect(result.youtubeChannelUrl).toBeUndefined();
  });

  test('normalises an Instagram handle and preserves a YouTube channel link', () => {
    const result = validateSignupInput({
      ...base,
      instagramUsername: ' @creator.studio ',
      youtubeChannelUrl: ' https://www.youtube.com/@creatorstudio ',
    });
    expect(result.instagramUsername).toBe('creator.studio');
    expect(result.youtubeChannelUrl).toBe('https://www.youtube.com/@creatorstudio');
  });

  test('treats empty social fields as optional', () => {
    const result = validateSignupInput({ ...base, instagramUsername: ' ', youtubeChannelUrl: '' });
    expect(result.instagramUsername).toBeUndefined();
    expect(result.youtubeChannelUrl).toBeUndefined();
  });

  test('rejects invalid Instagram usernames', () => {
    expect(() => validateSignupInput({ ...base, instagramUsername: '@creator..studio' })).toThrow('Enter a valid Instagram username');
  });

  test('rejects non-YouTube URLs', () => {
    expect(() => validateSignupInput({ ...base, youtubeChannelUrl: 'https://youtube.com.evil.example/@creator' })).toThrow('Enter a valid HTTPS YouTube channel link');
  });

  test('rejects insecure YouTube URLs', () => {
    expect(() => validateSignupInput({ ...base, youtubeChannelUrl: 'http://www.youtube.com/@creator' })).toThrow('Enter a valid HTTPS YouTube channel link');
  });

  test('accepts brand accounts using the existing name field', () => {
    const result = validateSignupInput({ ...base, name: 'Meme Brand India', role: 'brand' });
    expect(result.name).toBe('Meme Brand India');
    expect(result.role).toBe('brand');
  });

  test('rejects social profiles supplied for brand accounts', () => {
    expect(() => validateSignupInput({ ...base, role: 'brand', instagramUsername: 'creator' })).toThrow('Social profiles can only be added to Creator accounts');
  });
});
