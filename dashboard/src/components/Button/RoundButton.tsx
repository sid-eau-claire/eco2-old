import { ToolTip } from "@/components/Common/ToolTip";
import { IconType } from 'react-icons'; // This is used for typing the icons from react-icons
import { twMerge } from "tailwind-merge";
import React, { MouseEventHandler } from 'react';

interface RoundButtonProps {
  icon: IconType;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined; // Function or null
  hint?: string | undefined; // Optional tooltip message
  hintHPos?: string | undefined; // Optional tooltip message
  hintVPos?: string | undefined; // Optional tooltip message
  title?: string | undefined; // Optional title
  iconSize?: number | '30'; // Optional size, with default value
  className?: string | undefined; // Optional class name
  disabled?: boolean | undefined; // Optional disable state
  isEditable?: boolean | undefined; // Optional editable state
  type?: 'button' | 'submit' | 'reset' | undefined; // Optional type
}

const RoundButton: React.FC<RoundButtonProps> = ({
  icon: Icon,
  onClick,
  hint  = '',
  hintHPos = '80%',
  hintVPos = '100%',
  title = '',
  iconSize = 36,
  className = '',
  disabled = false,
  isEditable = true,
  type
}) => {
  return (
    <ToolTip message={hint} hintHPos={hintHPos} hintVPos={hintVPos}>
      <button
        className={twMerge(`bg-white text-dark rounded-full cursor-pointer hover:scale-110`, className,  !isEditable ? 'text-form-strokedark/30' : '')}
        onClick={onClick}
        title={title}
        disabled={disabled || !isEditable}
        type={type}
      >
        <Icon size={iconSize} />
      </button>
    </ToolTip>
  );
};

export default RoundButton;
