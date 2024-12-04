import { ReactNode, useState } from 'react';


interface SidebarLinkGroupProps {
  children: (handleClick: () => void, open: boolean) => ReactNode;
  activeCondition: boolean;
  isOpen: boolean;
  onToggle: () => void;
}

const SidebarLinkGroup = ({
  children,
  activeCondition,
  isOpen,
  onToggle,
}: SidebarLinkGroupProps ) => {
  const [open, setOpen] = useState<boolean>(activeCondition);

  const handleClick = () => {
    setOpen(!open);
    onToggle();
  };

  // return <li>{children(handleClick, open)}</li>;
  return <li>{children(handleClick, isOpen)}</li>;
};

export default SidebarLinkGroup;
