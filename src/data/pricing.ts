import { PricingPlan } from '../types';

export const pricingPlans: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for occasional use',
    features: [
      'Up to 50MB file size',
      '3 tasks per day',
      'Core PDF tools',
      'Auto-delete after 2 hours',
      'Basic support',
      'Google Drive & Dropbox sync'
    ],
    limitations: [
      'No e-signature features',
      'Limited file size',
      'Daily task limit',
      'No batch processing'
    ],
    popular: false,
    maxFileSize: 50,
    tasksLimit: 3
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 199,
    period: 'per month',
    description: 'Great for professionals',
    features: [
      'Up to 100MB file size',
      'Unlimited tasks',
      'All PDF tools',
      'Basic e-signature',
      'Priority support',
      'Cloud sync',
      'Advanced OCR',
      'Batch processing (up to 10 files)'
    ],
    limitations: [
      'Limited signature features',
      'No team collaboration',
      'No advanced certificates'
    ],
    popular: true,
    maxFileSize: 100,
    tasksLimit: -1
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 299,
    period: 'per month',
    description: 'For teams and power users',
    features: [
      'Unlimited file size',
      'Unlimited tasks',
      'All PDF tools',
      'Full signature suite',
      'Advanced batch processing',
      'Team collaboration',
      'Priority support',
      'Advanced security',
      'Digital certificates',
      'API access',
      'White-label options'
    ],
    limitations: [],
    popular: false,
    maxFileSize: -1,
    tasksLimit: -1
  }
];