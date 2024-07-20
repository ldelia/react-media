import 'react';

declare module 'react' {
  interface FunctionComponent<P = {}> {
    __docgenInfo?: {
      description?: string;
      displayName?: string;
      props?: {
        [key: string]: {
          description?: string;
          required?: boolean;
          tsType?: {
            name: string;
            elements?: { name: string }[]; // Handle array types
            raw?: string;
            type?: string; // Handle various types
          };
          defaultValue?: {
            value: string;
            computed: boolean;
          };
        };
      };
      methods?: {
        name: string;
        type?: string; // Handle method types
        signature?: {
          arguments: {
            type: { name: string };
            name: string;
          }[];
          return: { name: string };
        }; // Handle method signatures
      }[];
    };
  }
}