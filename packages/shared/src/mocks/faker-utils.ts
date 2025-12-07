// Mock data generator without external dependencies
// Using built-in crypto for randomization

const crypto = typeof window !== 'undefined' ? window.crypto : require('crypto');

function randomInt(min: number, max: number): number {
  const range = max - min + 1;
  const bytes = Math.ceil(Math.log2(range) / 8);
  const array = new Uint8Array(bytes);
  
  if (typeof window !== 'undefined') {
    crypto.getRandomValues(array);
  } else {
    crypto.randomFillSync(array);
  }
  
  let result = 0;
  for (let i = 0; i < bytes; i++) {
    result = result * 256 + array[i];
  }
  
  return min + (result % range);
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

function randomBoolean(probability = 0.5): boolean {
  return Math.random() < probability;
}

function randomDate(startDays: number, endDays: number): Date {
  const now = Date.now();
  const start = now - startDays * 24 * 60 * 60 * 1000;
  const end = now - endDays * 24 * 60 * 60 * 1000;
  return new Date(start + Math.random() * (end - start));
}

// Name generators
const firstNames = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Abigail', 'Michael',
  'Emily', 'Daniel', 'Elizabeth', 'Matthew', 'Sofia', 'Jackson', 'Avery',
  'Sebastian', 'Ella', 'David', 'Scarlett', 'Joseph', 'Grace', 'Carter'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez',
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Lewis'
];

const companyNames = [
  'TechCorp', 'DataSys', 'CloudFirst', 'DevOps Inc', 'Agile Solutions',
  'Quality Labs', 'TestPro', 'Automation Co', 'Digital Ventures', 'Innovation Hub',
  'SoftWare Inc', 'Platform Systems', 'Enterprise Tech', 'Modern Apps', 'Web Services'
];

const adjectives = ['Fast', 'Efficient', 'Reliable', 'Secure', 'Modern', 'Advanced', 'Smart', 'Dynamic'];
const nouns = ['Platform', 'System', 'Service', 'Engine', 'Framework', 'Suite', 'Portal', 'Hub'];

export function generateName(): string {
  const first = randomChoice(firstNames);
  const last = randomChoice(lastNames);
  return `${first} ${last}`;
}

export function generateEmail(name?: string): string {
  if (name) {
    const parts = name.toLowerCase().split(' ');
    return `${parts[0]}.${parts[1]}@shifty.ai`;
  }
  const first = randomChoice(firstNames).toLowerCase();
  const last = randomChoice(lastNames).toLowerCase();
  return `${first}.${last}@shifty.ai`;
}

export function generateCompanyName(): string {
  return randomChoice(companyNames);
}

export function generateProjectName(): string {
  const adj = randomChoice(adjectives);
  const noun = randomChoice(nouns);
  return `${adj} ${noun}`;
}

export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

export function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export { randomInt, randomChoice, randomBoolean, randomDate };
