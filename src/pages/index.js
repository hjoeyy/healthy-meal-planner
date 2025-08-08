import { getString } from '../storage.js';

console.log('hello world');
console.log('storage test:', getString('nonexistent', 'fallback'));