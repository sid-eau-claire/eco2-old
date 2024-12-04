import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getProducts, createProduct, updateProduct } from '../_actions/InsuranceProducts';

const InsuranceProducts = ({ carrier }: { carrier: any }) => {
  const [products, setProducts] = useState<any[]>([]);
  const [productCategoryList, setProductCategoryList] = useState<{id: string, name: string}[]>([]);
  const [groupedProducts, setGroupedProducts] = useState<{ [key: string]: any[] }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState({ isOpen: false, title: '', message: '' });
  const [selectedCategoryGroup, setSelectedCategoryGroup] = useState<string | null>(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ isOpen: false, productId: null });

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await getProducts(carrier.id);
      setProducts(fetchedProducts);
      
      const uniqueProductCategoryLists = new Set();
      const convertedProducts = fetchedProducts.reduce((acc: any[], product: any) => {
        const name = product.productcategoryId.name;
        const id = product.productcategoryId.id;
        if (!uniqueProductCategoryLists.has(name)) {
          uniqueProductCategoryLists.add(name);
          acc.push({ id: id.toString(), name: name });
        }
        return acc;
      }, []);
      setProductCategoryList(convertedProducts);
      
      groupProductsByCategory(fetchedProducts);
    };
    fetchProducts();
  }, [carrier, isDialogOpen]);

  const groupProductsByCategory = (products: any[]) => {
    const filteredProducts = selectedCategoryGroup
      ? products.filter(p => p.productcategoryId.id.toString() === selectedCategoryGroup)
      : products;

    const grouped = filteredProducts.reduce((acc, product) => {
      const categoryId = product.productcategoryId.id.toString();
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(product);
      return acc;
    }, {});
    setGroupedProducts(grouped);
    setExpandedCategories(Object.keys(grouped).reduce((acc: any, categoryId) => {
      acc[categoryId] = false;
      return acc;
    }, {}));
  };

  useEffect(() => {
    groupProductsByCategory(products);
  }, [selectedCategoryGroup, products]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddEdit = (product = null) => {
    setCurrentProduct(product);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (productId: any) => {
    setDeleteConfirmDialog({ isOpen: true, productId });
  };

  const handleDelete = async () => {
    const productId = deleteConfirmDialog.productId;
    if (productId) {
      try {
        await updateProduct(productId, { isActive: false });
        setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));
        setFeedbackDialog({
          isOpen: true,
          title: "Product Deleted",
          message: "The product has been successfully deleted."
        });
      } catch (error) {
        console.error('Failed to delete product:', error);
        setFeedbackDialog({
          isOpen: true,
          title: "Error",
          message: "Failed to delete the product. Please try again."
        });
      }
    }
    setDeleteConfirmDialog({ isOpen: false, productId: null });
  };

  const handleSave = async (productData: any) => {
    console.log('Save product:', productData);
    try {
      let savedProduct;
      if (productData.id) {
        savedProduct = await updateProduct(productData.id, productData);
      } else {
        savedProduct = await createProduct(productData);
      }
      setIsDialogOpen(false);
      setFeedbackDialog({
        isOpen: true,
        title: productData.id ? "Product Updated" : "Product Created",
        message: `Successfully ${productData.id ? 'updated' : 'created'} product: ${savedProduct.name}`,
      });
    } catch (error) {
      console.error('Failed to save product:', error);
      setFeedbackDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to ${productData.id ? 'update' : 'create'} product. Please try again.`,
      });
    }
  };

  const handleCategoryGroupChange = (value: string) => {
    setSelectedCategoryGroup(value === 'all' ? null : value);
  };

  const renderProductGroups = () => {
    const sortedEntries = Object.entries(groupedProducts).sort(([aId, a], [bId, b]) => {
      const aCategory = productCategoryList.find(cat => cat.id === aId);
      const bCategory = productCategoryList.find(cat => cat.id === bId);
      if (!aCategory) return 1;  // Move "Uncategorized" to the end
      if (!bCategory) return -1; // Move "Uncategorized" to the end
      return aCategory.name.localeCompare(bCategory.name);
    });

    return sortedEntries.map(([categoryId, categoryProducts]) => {
      const category = productCategoryList.find(cat => cat.id === categoryId);
      return (
        <Collapsible
          key={categoryId}
          open={expandedCategories[categoryId]}
          onOpenChange={() => toggleCategory(categoryId)}
          className="mb-4 border rounded-lg"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium">
            <span>{category?.name || 'Uncategorized'}</span>
            {expandedCategories[categoryId] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>FYC</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryProducts.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.FYC}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => handleAddEdit(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      );
    });
  };

  return (
    <div className="p-0">
      <div className="flex flex-row justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Insurance products</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedCategoryGroup || 'all'}
            onValueChange={handleCategoryGroupChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {productCategoryList.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => handleAddEdit()}>
            <Plus className="mr-2 h-4 w-4" /> Add Product
          </Button>
        </div>
      </div>

      {renderProductGroups()}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
          </DialogHeader>
          <ProductForm
            product={currentProduct}
            productCategories={productCategoryList}
            onSave={handleSave}
            carrierId={carrier.id}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={feedbackDialog.isOpen} onOpenChange={(isOpen) => setFeedbackDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{feedbackDialog.title}</DialogTitle>
          </DialogHeader>
          <p>{feedbackDialog.message}</p>
          <DialogFooter>
            <Button onClick={() => setFeedbackDialog(prev => ({ ...prev, isOpen: false }))}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteConfirmDialog.isOpen} onOpenChange={(isOpen) => setDeleteConfirmDialog(prev => ({ ...prev, isOpen }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmDialog({ isOpen: false, productId: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const ProductForm = ({ product, productCategories, onSave, carrierId }: { product: any, productCategories: any, onSave: any, carrierId: string }) => {
  const [formData, setFormData] = useState(product || {
    name: '',
    productcategoryId: '',
    FYC: '',
    overrideCarrierBonus: '',
    carrierId: carrierId,
    isActive: true
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Product Name"
        readOnly={!!product}
      />
      <Select
        name="productcategoryId"
        value={formData.productcategoryId}
        onValueChange={(value) => handleChange({ target: { name: 'productcategoryId', value } })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          {productCategories.map((category: any) => (
            <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        name="FYC"
        type="number"
        value={formData.FYC}
        onChange={handleChange}
        placeholder="FYC"
      />
      <Input
        name="overrideCarrierBonus"
        type="number"
        value={formData.overrideCarrierBonus}
        onChange={handleChange}
        placeholder="Override Carrier Bonus"
      />
      <Button type="submit">Save</Button>
    </form>
  );
};

export default InsuranceProducts;