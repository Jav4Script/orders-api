import { parseAndNormalize, User } from '../src/services/parser';

describe('Parser Service', () => {
  it('should parse and normalize data correctly', () => {
    const mockData = 
`0000000001                              Sammie Baumbach00000000030000000004      895.8720210910
0000000001                              Sammie Baumbach00000000030000000002      873.1220210910`;

    const expected: User[] = [
      {
        user_id: 1,
        name: 'Sammie Baumbach',
        orders: [
          {
            order_id: 3,
            total: 1768.99,
            date: '2021-09-10',
            products: [
              {
                product_id: 4,
                value: '895.87'
              },
              {
                product_id: 2,
                value: '873.12'
              }
            ]
          }
        ]
      }
    ];

    const result = parseAndNormalize(mockData);
    expect(result).toEqual(expected);
  });
});
