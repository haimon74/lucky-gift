// Minimal React Native mock for vitest (node environment)
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T) => styles,
  flatten: (style: unknown) => style,
};
export const Platform = { OS: 'ios', select: (obj: Record<string, unknown>) => obj.ios ?? obj.default };
export const Dimensions = { get: () => ({ width: 375, height: 812 }) };
export const Alert = { alert: () => {} };

// React Native components as no-ops for unit tests
const noop = () => null;
export const View = noop;
export const Text = noop;
export const TextInput = noop;
export const TouchableOpacity = noop;
export const ScrollView = noop;
export const ActivityIndicator = noop;
export const SafeAreaView = noop;
export const Animated = {
  Value: class { constructor(v: number) {} interpolate() { return {}; } },
  timing: () => ({ start: () => {} }),
  spring: () => ({ start: () => {} }),
  View: noop,
};
