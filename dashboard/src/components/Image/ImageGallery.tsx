import React, { useState } from 'react';
import {PopupComponent} from '@/components/Popup';
import { CgAttachment } from "react-icons/cg";
import { ToolTip } from '../Common';

interface ImageItem {
  url: string;
  id: number;
  description?: string;
  name?: string;
}

interface ImageGalleryProps {
  images: ImageItem[];
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images }) => {
  const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null);

  const openPopup = (item: ImageItem) => {
    setSelectedItem(item);
  };

  const closePopup = () => {
    setSelectedItem(null);
  };

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {images.map((item) => (
        <div key={item.id} className="max-w-xs cursor-pointer space-x-4" onClick={() => openPopup(item)}>
         <CgAttachment className="w-full h-8 rounded-lg shadow-md" />
        </div>
      ))}

      {/* Popup for displaying iframe content */}
      <PopupComponent isVisible={!!selectedItem} onClose={closePopup} className="fixed top-0 left-0 right-0 bottom-0">
        <span className='h-[1rem]'>{selectedItem?.name}</span>
        {selectedItem && (
          <iframe
            src={selectedItem.url}
            frameBorder="0"
            allowFullScreen
            className="w-full h-full absolute"
          ></iframe>
        )}
      </PopupComponent>
    </div>
  );
};

export default ImageGallery;



// <PanelContainer header='Original Statement' className='aspect-video relative'>
// <iframe className={`w-full h-full absolute pt-[2rem] pr-[3rem] `}
//   src={originalStatement[0]?.url}
//   allowFullScreen
// ></iframe>
// </PanelContainer>