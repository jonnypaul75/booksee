// Barrel exports for the API layer. Components can do:
//   import { listContent, search, CURRENT_USER_ID } from '../api';
//
// Keeping this single import surface makes it easy to swap implementations
// (e.g. mock for Storybook) later.
export * from './client';
export * from './types';
export * from './contentApi';
export * from './userApi';
export * from './playbackApi';
export * from './searchApi';
export * from './recommendationsApi';
