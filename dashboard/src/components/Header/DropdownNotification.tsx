import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getNotifications, markNotificationsAsRead } from './_actions/notification';
import { Separator } from "@/components/ui/separator";

type Notification = {
  id: string;
  title: string;
  message: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
};

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);
  const [refresh, setRefresh] = useState(false);

  const trigger = useRef<HTMLButtonElement>(null);
  const dropdown = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [page, isOpen]);



  useEffect(() => {
    if (notifications.length === 0) return;
    const allRead = notifications.every(notification => notification.isRead);
    setNotifying(!allRead);
  }, [notifications, refresh]);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      if (!dropdown.current || !trigger.current) return;
      if (
        !isOpen &&
        !dropdown.current.contains(event.target as Node) &&
        !trigger.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, [isOpen]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications(page);
      setNotifications(response.data);
      setHasMore(response.meta.pagination.pageCount > page);
      
      // Mark notifications as read when opened
      if (response.data.length > 0) {
        const ids = response.data.map((notification: any) => notification.id);
        // console.log('ids', ids);
        await markNotificationsAsRead(ids);
        setNotifications(prevNotifications => 
          prevNotifications.map(notification => ({ ...notification, isRead: true }))
        );
      }
      setRefresh(!refresh);
      // setNotifying(false);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handlePrevious = () => {
    if (page > 1) setPage(page - 1);
  };

  const handleNext = () => {
    if (hasMore) setPage(page + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };
  // console.log('notifiying', notifying);
  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            ref={trigger}
            variant="outline" 
            size="icon" 
            className="relative w-8 h-8 rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white hover:bg-gray hover:border-transparent focus:border-transparent active:border-transparent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Bell className="h-[0.9rem] w-[0.9rem]"/>
            {(notifying) && (
              <span className="absolute -top-0.5 -right-0.5 z-1 h-2 w-2 rounded-full bg-meta-1">
                <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75"></span>
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent ref={dropdown} className="w-96 p-0">
          <Card className="p-4 border-0 shadow-none">
            <h2 className="text-lg font-semibold mb-4">Notifications</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="pb-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.message}</h3>
                      <span className="text-xs text-gray-400 ml-2">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 flex justify-between items-start">
                      {/* <span>
                        {notification.message.length > 50
                          ? `${notification.message.substring(0, 50)}...`
                          : notification.message}
                      </span> */}
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-sm text-blue-500 hover:underline whitespace-nowrap"
                        >
                          View details
                        </a>
                      )}
                    </p>
                  </div>
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              <Button
                onClick={handlePrevious}
                disabled={page === 1}
                variant="outline"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={!hasMore}
                variant="outline"
                size="sm"
              >
                Next
              </Button>
            </div>
          </Card>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}