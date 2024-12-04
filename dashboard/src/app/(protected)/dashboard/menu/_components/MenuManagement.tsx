'use client'
import React, { useEffect, useState } from 'react';
import MenuManager from './MenuManager';
import { getMenu, updateMenu } from './../_actions/menuActions';

const MenuManagementPage = () => {
  const [menuData, setMenuData] = useState([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const data = await getMenu();
      if (data) {
        setMenuData(data);
      }
    };

    fetchMenu();
  }, []);

  const handleSaveChanges = async (newData: any) => {
    const confirmed = confirm('Are you sure you want to save these changes?');
    if (confirmed) {
      const response = await updateMenu(newData);
      if (response) {
        alert('Menu updated successfully.');
      } else {
        alert('Failed to update the menu.');
      }
    }
  };
  console.log(menuData)
  return (
    <div>
      <MenuManager menuData={menuData} onSaveChanges={handleSaveChanges} />
    </div>
  );
};

export default MenuManagementPage;
