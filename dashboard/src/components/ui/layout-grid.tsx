import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from 'lucide-react';

type Card = {
  id: number;
  component: React.ComponentType<any>;
  className: string;
  thumbnail: React.ComponentType<any>;
  backgroundImage: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  const [selected, setSelected] = useState<Card | null>(null);
  const [lastSelected, setLastSelected] = useState<Card | null>(null);

  const handleClick = (card: Card) => {
    setLastSelected(selected);
    setSelected(card);
  };

  const handleClose = () => {
    setLastSelected(selected);
    setSelected(null);
  };

  return (
    <div className="w-full h-full p-0 grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4 ">
      {cards.map((card) => (
        <div key={card.id} className={cn(card.className, "h-[200px] md:h-[300px]")}>
          <motion.div
            layoutId={`card-${card.id}`}
            onClick={() => handleClick(card)}
            className={cn(
              "relative overflow-hidden bg-cover bg-center rounded-xl cursor-pointer",
              selected?.id === card.id
                ? "fixed inset-0 z-50 w-full h-full md:w-2/3 md:h-2/3 m-auto"
                : "h-full w-full"
            )}
            style={{ backgroundImage: `url(${card.backgroundImage})` }}
            transition={{ duration: 0.3 }}
          >
            {selected?.id === card.id ? (
              <SelectedCard selected={card} onClose={handleClose} />
            ) : (
              <ThumbnailWrapper card={card} />
            )}
          </motion.div>
        </div>
      ))}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 bg-slate-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.9 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const ThumbnailWrapper = ({ card }: { card: Card }) => {
  const Thumbnail = card.thumbnail;
  return (
    <motion.div className="w-full h-full flex items-center justify-center">
      <Thumbnail />
    </motion.div>
  );
};

const SelectedCard = ({ selected, onClose }: { selected: Card; onClose: () => void }) => {
  const Component = selected.component;
  return (
    <motion.div className="w-full h-full rounded-lg shadow-2xl flex flex-col justify-end relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-2 right-2 bg-white text-black rounded-full p-1 hover:bg-gray-200 transition-colors z-10"
      >
        <X size={24} />
      </button>
      <div className="relative flex-grow flex items-center justify-center p-4 bg-black bg-opacity-50">
        <Component />
      </div>
    </motion.div>
  );
};