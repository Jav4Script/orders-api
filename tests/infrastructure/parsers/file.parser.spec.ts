import { FileParser } from '@/infrastructure/services/file-parser.service';

describe('FileParser', () => {
  let parser: FileParser;

  beforeEach(() => {
    parser = new FileParser();
  });

  it('should parse and normalize data correctly from a valid file content', () => {
    const validData = 
`0000000070                              Palmer Prosacco00000007530000000003     1836.7420210308
0000000075                                  Bobbie Batz00000007980000000002     1578.5720211116`;

    const result = parser.parseAndNormalize(validData);

    expect(result).toEqual([
      {
        user_id: 70,
        name: 'Palmer Prosacco',
        orders: [
          {
            order_id: 753,
            total: 1836.74,
            date: '2021-03-08',
            products: [
              { product_id: 3, value: 1836.74 },
            ],
          },
        ],
      },
      {
        user_id: 75,
        name: 'Bobbie Batz',
        orders: [
          {
            order_id: 798,
            total: 1578.57,
            date: '2021-11-16',
            products: [
              { product_id: 2, value: 1578.57 },
            ],
          },
        ],
      },
    ]);
  });

  it('should handle empty file content gracefully', () => {
    const result = parser.parseAndNormalize('');
    expect(result).toEqual([]);
  });

  it('should use placeholders for invalid numeric data and continue processing', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    const invalidData = 
`invalid line data
0000000070                              Palmer Prosacco00000007530000000003     invalid20210308`;

    const result = parser.parseAndNormalize(invalidData);

    expect(result).toHaveLength(2); // Should process valid lines and lines with placeholders
    expect(result[0].user_id).toBe(0); // Placeholder for invalid userId
    expect(result[0].name).toBe('invalid line data'.substring(10, 10 + 45).trim()); // The whole line becomes the name
    expect(result[0].orders[0].order_id).toBe(0); // Placeholder for invalid orderId
    expect(result[0].orders[0].products[0].product_id).toBe(0); // Placeholder for invalid productId
    expect(result[0].orders[0].products[0].value).toBe(0); // Placeholder for invalid productValue

    expect(result[1].user_id).toBe(70);
    expect(result[1].name).toBe('Palmer Prosacco');
    expect(result[1].orders[0].products[0].value).toBe(0); // Placeholder for invalid productValue

    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid userId'));
    expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid productValue'));

    consoleWarnSpy.mockRestore();
  });
});
