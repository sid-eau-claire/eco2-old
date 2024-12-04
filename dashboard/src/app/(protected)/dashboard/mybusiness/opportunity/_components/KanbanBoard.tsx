"use client";
import React, { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import Link from "next/link";
import { FaStar } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import CreateEditOpportunity from "./CreateEditOpportunity";
import { updateOpportunity } from "../_actions/opportunities";
import Drag from "@/js/drag";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KanbanBoard = ({ opportunities, profileId, stage, setRefreshData }: { opportunities: any[], profileId: string, stage: string, setRefreshData: any }) => {
  const [showEditOpportunity, setShowEditOpportunity] = useState(false);
  const [selectedTask, setSelectedTask] = useState<{ id: string } | null>(null);
  const shouldShowIntentIcons = stage !== "Prospect" && stage !== "In the Mill";
  
  const updateOpportunityStatus = async (opportunityId: string, newStatus: string) => {
    try {
      await updateOpportunity(opportunityId, { status: newStatus });
    } catch (error) {
      console.error("Error updating opportunity status:", error);
    }
  };

  useEffect(() => {
    Drag(updateOpportunityStatus);
  }, [opportunities]);

  const handleDoubleClick = (task: any) => {
    setSelectedTask(task);
    setShowEditOpportunity(true);
  };

  const getAmountLabel = (task: any) => {
    if (task.type === 'Insurance') {
      return 'MPE';
    } else if (task.type === 'Investment') {
      return 'AUM';
    } else {
      return 'Amount';
    }
  };

  const getDisplayContent = (task: any) => {
    if (stage === "Business Development") {
      return task.planningOptions ? task.planningOptions.join(", ") : "No planning options";
    }
    return task.description;
  };

  return (
    <>
      {opportunities.map((task, index) => (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.3, duration: 0.5, ease: 'easeInOut' }}
          exit={{ opacity: 0 }}
          key={index}
          draggable="true"
          onClick={() => handleDoubleClick(task)}
          className="task"
          data-id={task.id}
        >
          <Card className="cursor-pointer h-[140px]">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              {stage === "Prospect" ? (
                <motion.div
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.3, duration: 0.5, ease: 'easeInOut' }}
                  exit={{ opacity: 0 }}
                  className="h-auto flex flex-col justify-between items-start space-y-2"
                >
                  <h5 className="text-lg font-medium break-words">
                    {task?.clientId?.firstName} {task?.clientId?.lastName}
                  </h5>
                  <p className="text-sm text-gray-500">
                    {task?.clientId?.email}
                  </p>
                  <p className="text-sm text-gray-500">
                    {task?.clientId?.homePhone}
                  </p>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h5 className="text-lg font-medium break-words w-[11rem]">
                      {getDisplayContent(task)}
                    </h5>
                    <div className="flex flex-col items-end">
                      <p className="text-lg text-gray-500 text-right">
                        ${task.estAmount}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {getAmountLabel(task)}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant="outline" className="mb-2">
                    {stage}
                  </Badge>
                </>
              )}
              <div className="flex justify-between items-center mt-auto">
                {stage !== "Prospect" && (
                  <Link href={`/dashboard/myclient/${profileId}/${task?.clientId?.id}`} className="cursor-pointer text-primary/50">
                    <p className="text-sm font-semibold">
                      {task?.clientId?.firstName} {task?.clientId?.lastName}
                    </p>
                  </Link>
                )}
                {shouldShowIntentIcons && (
                  <>
                    {task?.intent === 'Good' && (
                      <FaStar className="text-green-400" size={24}/>
                    )}
                    {task?.intent === 'Stuck' && (
                      <MdBlock className="text-red-400" size={24}/>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      <Dialog open={showEditOpportunity} onOpenChange={setShowEditOpportunity} >
        <DialogContent className="max-w-full max-h-screen h-screen overflow-y-auto flex flex-col justify-start">
          <DialogTitle/><DialogDescription/>
          <CreateEditOpportunity 
            profileId={profileId} 
            opportunityId={selectedTask?.id}
            setShowAddRecord={setShowEditOpportunity}
            setRefreshData={setRefreshData}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanBoard;