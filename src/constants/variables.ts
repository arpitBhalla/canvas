import type { Variable } from '../types'

export const VARIABLES: Variable[] = [
  { name: 'firstName', label: 'First Name', placeholder: '{{firstName}}', category: 'contact' },
  { name: 'lastName', label: 'Last Name', placeholder: '{{lastName}}', category: 'contact' },
  { name: 'email', label: 'Email', placeholder: '{{email}}', category: 'contact' },
  { name: 'phone', label: 'Phone', placeholder: '{{phone}}', category: 'contact' },
  { name: 'address', label: 'Address', placeholder: '{{address}}', category: 'contact' },
  { name: 'city', label: 'City', placeholder: '{{city}}', category: 'contact' },
  { name: 'company', label: 'Company', placeholder: '{{company}}', category: 'company' },
  { name: 'title', label: 'Job Title', placeholder: '{{title}}', category: 'company' },
  { name: 'department', label: 'Department', placeholder: '{{department}}', category: 'company' },
  { name: 'custom1', label: 'Custom 1', placeholder: '{{custom1}}', category: 'custom' },
  { name: 'custom2', label: 'Custom 2', placeholder: '{{custom2}}', category: 'custom' },
  { name: 'custom3', label: 'Custom 3', placeholder: '{{custom3}}', category: 'custom' },
]

export const VARIABLE_CATEGORIES = [
  { key: 'contact' as const, label: 'Contact' },
  { key: 'company' as const, label: 'Company' },
  { key: 'custom' as const, label: 'Custom' },
]
