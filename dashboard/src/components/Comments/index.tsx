import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { getComments, postComment } from './_actions/comments';
import { motion } from 'framer-motion';
import { ProfileIcon } from '@/components/Icons';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, X } from 'lucide-react';

type Comment = {
    createdAt: string;
    content: string;
    author: {
        id: string;
        name: string;
        email: string;
    };
}

type Props = {
    collectionType: string;
    id: string;
    isOpen: boolean;
    onClose: () => void;
    recipientIds?: number[];
    link?: string;
}

const CommentsBox = ({ collectionType, id, isOpen, onClose, recipientIds, link }: Props) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState<string>('');

    useEffect(() => {
        if (isOpen) {
            getComments(collectionType, id)
                .then(response => {
                    setComments(response.data || []);
                })
                .catch(error => console.error('Error fetching comments:', error));
        }
    }, [id, collectionType, isOpen]);

    const handleCommentSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            const commentData = {
                content: newComment,
                user: 'user-id'
            };
            let notify = false;
            if (recipientIds) {
                notify = true;
            }
            const newCommentData = await postComment(collectionType, id, commentData, link, notify, recipientIds );
            if (newCommentData) {
                setComments(prevComments => [
                    ...prevComments,
                    { ...newCommentData, createdAt: new Date().toISOString() }
                ]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Remarks</DialogTitle>
                    {/* <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-4 top-4">
                        <X className="h-4 w-4" />
                    </Button> */}
                </DialogHeader>
                <div className="flex flex-col h-[60vh]">
                    <ScrollArea className="flex-grow pr-4">
                        {comments.map((comment, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="mb-4 p-3 bg-gray-100 rounded-lg"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <p className="text-sm text-gray-600">{new Date(comment.createdAt).toLocaleString()}</p>
                                    <ProfileIcon profileId={comment?.author?.id} className='w-8 h-8' menuEnable={false} />
                                </div>
                                <p className='text-md'>{comment.content}</p>
                            </motion.div>
                        ))}
                    </ScrollArea>
                    <form onSubmit={handleCommentSubmit} className="mt-4">
                        <div className="flex items-center space-x-2">
                            <Textarea
                                placeholder="Write a note..."
                                value={newComment}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
                                className="flex-grow"
                            />
                            <Button type="submit" size="icon">
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CommentsBox;