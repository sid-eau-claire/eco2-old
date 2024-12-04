import React, { use } from 'react';
import {motion} from "framer-motion";
const VideoModal = ({
  videoLink,
  videoDetails,
  otherVideos,
  onClose,
}: {
  videoLink: string | null;
  videoDetails: any; // You might want to define a more specific type based on the data structure you're expecting
  otherVideos: { title: string; thumbnail_url: string; link: string }[];
  onClose: () => void;
}) => {
  if (!videoLink) return null;
  const [playLink, setPlayLink] = React.useState(videoLink);
  const [embedUrl, setEmbedUrl] = React.useState(`https://player.vimeo.com/video/${videoLink}`);



  // const embedUrl = `https://player.vimeo.com/video/${videoLink}`;

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0  bg-black bg-opacity-50 z-9999">
      <motion.div className="flex justify-center items-center h-full w-full"
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1}}
        transition={{ duration: 0.8 }}
      >
        <div className="bg-white rounded-lg overflow-hidden shadow-xl max-h-full w-full flex flex-col md:flex-row p-4">
          {/* Left Column */}
          <div className="md:flex-1 flex flex-col p-4">
            {/* Video Player Div */}
            <div className="flex-grow">
              <iframe src={embedUrl} width="100%" height="100%" style={{ minHeight: '400px' }} frameBorder="0" allowFullScreen></iframe>
            </div>
            {/* Vimeo Data Display Div */}
            <div className="p-4">
              <h3 className="text-lg font-semibold">{videoDetails.title}</h3>
              <p>{videoDetails.description}</p>
              {/* Display other data as needed */}
            </div>
            <button onClick={onClose} className="p-2 bg-body  max-w-[6rem]  text-whiten  rounded-lg hover:bg-red-700 focus:outline-none">
              <span>Close</span>
            </button>            
          </div>
          {/* Right Column */}
          <div className="md:flex-1 flex flex-col overflow-y-auto">
            {otherVideos.map((video, index) => (
              <motion.div key={index} className="flex flex-row items-center p-4 border-b border-gray-200"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.3, duration: 0.8 }}
                onClick={() => {setPlayLink(video.link); setEmbedUrl(`https://player.vimeo.com/video/${video.link}`)}}
              >
                <motion.img src={video.thumbnail_url} alt={video.title} className="w-[12rem] mr-4 rounded" 
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                />
                <div>
                  <h4 className="text-md font-semibold">{video.title}</h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VideoModal
