import React, { useEffect, useRef } from 'react';
import Player from '@vimeo/player';

interface VimeoVideoProps {
  videoId: string;
  width?: string;
  height?: string;
}

const VimeoVideo: React.FC<VimeoVideoProps> = ({
  videoId,
  width = "640",
  height = "360",
}) => {
  const playerContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (playerContainerRef.current) {
      // Initialize Vimeo Player with the videoId
      const player = new Player(playerContainerRef.current, {
        id: parseInt(videoId, 10),
        width: parseInt(width, 10),
        height: parseInt(height, 10),
      });

      // You can add event listeners here
      player.on('play', function() {
        console.log('Played the video');
      });

      return () => {
        player.destroy();
      };
    }
  }, [videoId, width, height]);

  return <div ref={playerContainerRef} className="vimeo-video-container" />;
};

export default VimeoVideo;
