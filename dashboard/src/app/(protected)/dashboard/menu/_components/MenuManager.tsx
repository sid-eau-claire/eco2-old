import React, { useState } from 'react';
import { PanelContainer, ColContainer, RowContainer } from '@/components/Containers';
import { Input, Select } from '@/components/Input';
import { LoadingButtonNP } from '@/components/Button';

// Define a type for the menu item
type MenuItem = {
  id: number;
  name: string;
  href: string;
  roles: string[]; // Assuming roles is an array of strings
  children: MenuItem[]; // Assuming nested structure for children
};

// Props type definition
type MenuManagerProps = {
  menuData: MenuItem[];
  onSaveChanges: (data: MenuItem[]) => void;
};

const MenuManager: React.FC<MenuManagerProps> = ({ menuData, onSaveChanges }) => {
  const [data, setData] = useState<MenuItem[]>(menuData);

  const handleAddItem = () => {
    // Adding a new menu item logic here
    setData([...data, { id: Date.now(), name: '', href: '', roles: [], children: [] }]);
  };

  const handleDeleteItem = (id: number) => {
    setData(data.filter(item => item.id !== id));
  };

  const handleChange = (id: number, field: keyof MenuItem, value: any) => {
    const newData = data.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setData(newData);
  };

  const renderMenuItems = () => {
    return data.map((item) => (
      <RowContainer key={item.id}>
        <Input label="Name" name="name" defaultValue={item.name} onChange={e => handleChange(item.id, 'name', e.target.value)} />
        <Input label="URL" name="label" defaultValue={item.href} onChange={e => handleChange(item.id, 'href', e.target.value)} />
        <LoadingButtonNP onClick={() => handleDeleteItem(item.id)}>{'Delete'}</LoadingButtonNP>
      </RowContainer>
    ));
  };

  return (
    <ColContainer>
      {renderMenuItems()}
      <LoadingButtonNP onClick={handleAddItem}>{'Add Menu Item'}</LoadingButtonNP>
      <LoadingButtonNP onClick={() => onSaveChanges(data)}>{'Save Changes'}</LoadingButtonNP>
    </ColContainer>
  );
};

export default MenuManager;
