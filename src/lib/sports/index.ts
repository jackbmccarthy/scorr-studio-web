// Sports Index - Exports all sport configurations

// Core types and registry
export * from './registry';

// Import all sport configurations (they self-register)
import './table-tennis';
import './basketball';
import './soccer';
import './tennis';
import './badminton';
import './volleyball';
import './snooker';
import './pickleball';
import './squash';
import './darts';
import './cricket';
import './baseball';
import './american-football';
import './handball';
import './padel';
import './boxing';
import './mma';
import './rugby';
import './ice-hockey';
import './field-hockey';

// Re-export the sports registry for convenience
export { sports, getSportConfig, getAllSports, registerSport } from './registry';
