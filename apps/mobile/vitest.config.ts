import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    alias: {
      '@lucky-gift/shared': path.resolve(__dirname, '../../packages/shared/src/index.ts'),
      '@react-native-async-storage/async-storage': path.resolve(__dirname, './__mocks__/async-storage.ts'),
      'react-native': path.resolve(__dirname, './__mocks__/react-native.ts'),
      'expo-linear-gradient': path.resolve(__dirname, './__mocks__/expo-linear-gradient.ts'),
    },
  },
});
