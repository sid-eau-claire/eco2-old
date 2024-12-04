import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { getFundCategoryTypes, getInvestmentFeeTypes, createInvestmentFeeType, updateInvestmentFeeType } from '../_actions/InvestmentProducts';
import { canAccess } from '@/lib/isAuth';

const InvestmentProduct = ({ carrier }: { carrier: any }) => {
  const [fundCategoryTypes, setFundCategoryTypes] = useState<any[]>([]);
  const [investmentFeeTypes, setInvestmentFeeTypes] = useState<any[]>([]);
  const [groupedInvestmentFeeTypes, setGroupedInvestmentFeeTypes] = useState<{ [key: string]: any[] }>({});
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentInvestmentFeeType, setCurrentInvestmentFeeType] = useState(null);
  const [feedbackDialog, setFeedbackDialog] = useState({ isOpen: false, title: '', message: '' });
  const [selectedFundCategoryType, setSelectedFundCategoryType] = useState<string>('all');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ isOpen: false, investmentFeeTypeId: null });
  const [isEditable, setIsEditable] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const editable = await canAccess(['Superuser', 'Poweruser'], []);
      setIsEditable(editable);
    };
    checkAccess();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const fetchedFundCategoryTypes = await getFundCategoryTypes(carrier.id);
      const fetchedInvestmentFeeTypes = await getInvestmentFeeTypes(carrier.id);
      setFundCategoryTypes(fetchedFundCategoryTypes);
      setInvestmentFeeTypes(fetchedInvestmentFeeTypes);
      groupInvestmentFeeTypesByCategory(fetchedInvestmentFeeTypes, fetchedFundCategoryTypes);
    };
    fetchData();
  }, [carrier]);

  const groupInvestmentFeeTypesByCategory = (feeTypes: any[], categories: any[]) => {
    const grouped = feeTypes.reduce((acc, feeType) => {
      const categoryId = feeType.fundCategoryTypeId?.id?.toString() || 'uncategorized';
      if (!acc[categoryId]) {
        acc[categoryId] = [];
      }
      acc[categoryId].push(feeType);
      return acc;
    }, {});

    if (selectedFundCategoryType === 'all') {
      setGroupedInvestmentFeeTypes(grouped);
    } else {
      const filteredGrouped = {
        [selectedFundCategoryType]: grouped[selectedFundCategoryType] || []
      };
      setGroupedInvestmentFeeTypes(filteredGrouped);
    }

    setExpandedCategories(Object.keys(grouped).reduce((acc: any, categoryId) => {
      acc[categoryId] = false;
      return acc;
    }, {}));
  };

  useEffect(() => {
    groupInvestmentFeeTypesByCategory(investmentFeeTypes, fundCategoryTypes);
  }, [selectedFundCategoryType, investmentFeeTypes, fundCategoryTypes]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleAddEdit = (feeType = null) => {
    setCurrentInvestmentFeeType(feeType);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = (feeTypeId: any) => {
    setDeleteConfirmDialog({ isOpen: true, investmentFeeTypeId: feeTypeId });
  };

  const handleDelete = async () => {
    const feeTypeId = deleteConfirmDialog.investmentFeeTypeId;
    if (feeTypeId) {
      try {
        await updateInvestmentFeeType(feeTypeId, { isActive: false });
        setInvestmentFeeTypes(prevFeeTypes => prevFeeTypes.filter(f => f.id !== feeTypeId));
        setFeedbackDialog({
          isOpen: true,
          title: "Investment Fee Type Deleted",
          message: "The investment fee type has been successfully deleted."
        });
      } catch (error) {
        console.error('Failed to delete investment fee type:', error);
        setFeedbackDialog({
          isOpen: true,
          title: "Error",
          message: "Failed to delete the investment fee type. Please try again."
        });
      }
    }
    setDeleteConfirmDialog({ isOpen: false, investmentFeeTypeId: null });
  };

  const handleSave = async (feeTypeData: any) => {
    try {
      let savedFeeType;
      if (feeTypeData.id) {
        savedFeeType = await updateInvestmentFeeType(feeTypeData.id, feeTypeData);
      } else {
        savedFeeType = await createInvestmentFeeType(feeTypeData);
      }
      setIsDialogOpen(false);
      setFeedbackDialog({
        isOpen: true,
        title: feeTypeData.id ? "Investment Fee Type Updated" : "Investment Fee Type Created",
        message: `Successfully ${feeTypeData.id ? 'updated' : 'created'} investment fee type: ${savedFeeType.name}`,
      });
      // Refresh the investment fee types
      const fetchedInvestmentFeeTypes = await getInvestmentFeeTypes(carrier.id);
      setInvestmentFeeTypes(fetchedInvestmentFeeTypes);
    } catch (error) {
      console.error('Failed to save investment fee type:', error);
      setFeedbackDialog({
        isOpen: true,
        title: "Error",
        message: `Failed to ${feeTypeData.id ? 'update' : 'create'} investment fee type. Please try again.`,
      });
    }
  };

  const handleFundCategoryTypeChange = (value: string) => {
    setSelectedFundCategoryType(value);
  };

  const renderInvestmentFeeTypeGroups = () => {
    const sortedEntries = Object.entries(groupedInvestmentFeeTypes).sort(([aId, a], [bId, b]) => {
      const aCategory = fundCategoryTypes.find(cat => cat.id === aId);
      const bCategory = fundCategoryTypes.find(cat => cat.id === bId);
      if (aId === 'uncategorized') return 1;
      if (bId === 'uncategorized') return -1;
      if (!aCategory) return 1;
      if (!bCategory) return -1;
      return aCategory.name.localeCompare(bCategory.name);
    });

    return sortedEntries.map(([categoryId, categoryFeeTypes]) => {
      const category = fundCategoryTypes.find(cat => cat.id == categoryId);
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
                  <TableHead>Fee Percentage (%)</TableHead>
                  {isEditable && <TableHead>Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryFeeTypes.map((feeType: any) => (
                  <TableRow key={feeType.id}>
                    <TableCell>{feeType.name}</TableCell>
                    <TableCell>{(parseFloat(feeType.feePercentage) * 100).toFixed(2)}%</TableCell>
                    {isEditable && (
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleAddEdit(feeType)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteConfirm(feeType.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
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
        <h2 className="text-lg font-bold">Investment Fee Types</h2>
        <div className="flex items-center space-x-2">
          <Select
            value={selectedFundCategoryType}
            onValueChange={handleFundCategoryTypeChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by Fund Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Fund Categories</SelectItem>
              {fundCategoryTypes.map((category) => (
                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {isEditable && (
            <Button onClick={() => handleAddEdit()}>
              <Plus className="mr-2 h-4 w-4" /> Add Fee Type
            </Button>
          )}
        </div>
      </div>

      {renderInvestmentFeeTypeGroups()}

      {isEditable && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{currentInvestmentFeeType ? 'Edit Investment Fee Type' : 'Add Investment Fee Type'}</DialogTitle>
              </DialogHeader>
              <InvestmentFeeTypeForm
                feeType={currentInvestmentFeeType}
                fundCategoryTypes={fundCategoryTypes}
                onSave={handleSave}
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
                Are you sure you want to delete this investment fee type? This action cannot be undone.
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteConfirmDialog({ isOpen: false, investmentFeeTypeId: null })}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
};

const InvestmentFeeTypeForm = ({ feeType, fundCategoryTypes, onSave }: { feeType: any, fundCategoryTypes: any, onSave: any }) => {
  const [formData, setFormData] = useState({
    id: feeType?.id || '',
    name: feeType?.name || '',
    feePercentage: feeType?.feePercentage ? (parseFloat(feeType.feePercentage) * 100).toFixed(2) : '',
    fundCategoryTypeId: feeType?.fundCategoryTypeId?.id || '',
  });

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleFundCategoryChange = (value: string) => {
    setFormData((prev: any) => ({ ...prev, fundCategoryTypeId: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      feePercentage: (parseFloat(formData.feePercentage) / 100).toString()
    };
    onSave(submissionData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Fee Type Name"
        readOnly={!!feeType}
      />
      <Input
        name="feePercentage"
        type="number"
        step="0.01"
        value={formData.feePercentage}
        onChange={handleChange}
        placeholder="Fee Percentage (%)"
      />
      <Select
        value={formData.fundCategoryTypeId}
        onValueChange={handleFundCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a Fund Category" />
        </SelectTrigger>
        <SelectContent>
          {fundCategoryTypes.map((category: any) => (
            <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button type="submit">Save</Button>
    </form>
  );
};

export default InvestmentProduct;