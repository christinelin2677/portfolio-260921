import { createLucideIcon } from 'lucide-react';

// Original Lucide LinkedIn outline (ISC), retained after brand icons were removed.
// https://github.com/lucide-icons/lucide/blob/0.544.0/icons/linkedin.svg
const LinkedinIcon = createLucideIcon('Linkedin', [
  ['path', { d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z', key: 'profile' }],
  ['rect', { width: '4', height: '12', x: '2', y: '9', key: 'stem' }],
  ['circle', { cx: '4', cy: '4', r: '2', key: 'dot' }],
]);

export default LinkedinIcon;
