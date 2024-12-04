import React, { useMemo } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';
import { Package } from 'lucide-react';

type ProductMixProps = {
  cases: any[];
};

const ProductMix: React.FC<ProductMixProps> = ({ cases }) => {
  const productData = useMemo(() => {
    const productCounts: { [key: string]: number } = {};
    cases.forEach(c => {
      c.appInsProducts.forEach((p: any) => {
        const productName = p.productId.name;
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      });
      c.appInvProducts.forEach((p: any) => {
        const productName = p.categoryId.name;
        productCounts[productName] = (productCounts[productName] || 0) + 1;
      });
    });
    return Object.entries(productCounts).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="mr-2" />
          Product Mix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={productData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {productData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend
              wrapperStyle={{
                fontSize: '14px', // Reduce font size
                paddingTop: '5px' // Add some padding at the top
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ProductMix;