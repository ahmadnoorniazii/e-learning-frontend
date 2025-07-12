const qs = require('qs');

console.log('=== Testing the new API client implementation ===\n');

// Simulate the exact call from checkEnrollmentStatus
const params = {
  filters: {
    student: { id: { $eq: 10 } },
    course: { id: { $eq: 22 } }
  }
};

// Simulate the new API client logic
const queryParams = {};

// Handle filters - convert nested format to Strapi v5 format
if (params?.filters) {
  for (const [entity, entityFilters] of Object.entries(params.filters)) {
    if (typeof entityFilters === 'object' && entityFilters !== null) {
      for (const [field, fieldFilter] of Object.entries(entityFilters)) {
        if (typeof fieldFilter === 'object' && fieldFilter !== null && '$eq' in fieldFilter) {
          // Convert $eq format to array format for Strapi v5
          queryParams[`filters[${entity}][${field}]`] = [fieldFilter.$eq];
        } else {
          // Direct value assignment
          queryParams[`filters[${entity}][${field}]`] = Array.isArray(fieldFilter) ? fieldFilter : [fieldFilter];
        }
      }
    }
  }
}

console.log('Input filters:', JSON.stringify(params.filters, null, 2));
console.log('Transformed queryParams:', JSON.stringify(queryParams, null, 2));

const queryString = qs.stringify(queryParams, { 
  encode: false,
  arrayFormat: 'brackets',
  allowDots: true
});

console.log('Generated query string:', queryString);
console.log('Full URL:', `/enrollments?${queryString}`);
console.log('Expected format: filters[student][id][]=10&filters[course][id][]=22');
console.log('Match?', queryString.includes('filters[student][id][]=10') && queryString.includes('filters[course][id][]=22'));
