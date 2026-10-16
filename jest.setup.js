// jest setup — runs before each test file
jest.mock('react-native/Libraries/EventEmitter/NativeEventEmitter');

// react-native-reanimated v3 ships its own mock; require it explicitly so
// tests don't trip on the animation API surface.
require('react-native-reanimated').setUpTests?.();

// Silence noisy warnings from RN's AsyncStorage in the test environment.
jest.spyOn(console, 'warn').mockImplementation(() => {});
