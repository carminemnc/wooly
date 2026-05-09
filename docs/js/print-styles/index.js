// print-styles/index.js — Registry of available print templates

import * as elegant from './elegant.js';

export const templates = [
  elegant
];

export function getTemplate(id) {
  return templates.find(t => t.id === id) || templates[0];
}
