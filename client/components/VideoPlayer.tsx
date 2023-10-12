import React, { useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Socket } from 'socket.io-client';

interface VideoPlayerProps {
  videoLink: string;
  socket: Socket;
  roomId: string;
  userId: string;
}

type VideoEvent = 'newVideo' | 'play' | 'pause' | 'jump';

type VideoEventData = {
  newVideo: { roomId: string; userId: string; videoId: string };
  play: { roomId: string; userId: string };
  pause: { roomId: string; userId: string };
  jump: { roomId: string; userId: string; time: number }; // 시간은 초 단위 - ex) 1:56초 지점은 60 * 1 + 56 =  116
};

type DetectVideoEventData<T extends VideoEvent> = VideoEventData[T] & {
  socketId: string;
};

function VideoPlayer({ videoLink, socket, roomId, userId }: VideoPlayerProps) {
  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    socket.on('play', (data: DetectVideoEventData<'play'>) => {
      if (player && socket.id !== data.socketId) {
        player.playVideo();
        setIsPlaying(true);
      }
    });

    socket.on('pause', (data: DetectVideoEventData<'pause'>) => {
      if (player && socket.id !== data.socketId) {
        player.pauseVideo();
        setIsPlaying(false);
      }
    });
  }, [player, socket]);

  function sendVideoEvent<T extends VideoEvent>(
    event: T,
    data: VideoEventData[T]
  ) {
    socket.emit(event, data);
  }

  const onReady = (event: any) => {
    const player = event.target;
    setPlayer(player);
  };

  const onPlay = (event: any) => {
    if (!isPlaying) {
      setIsPlaying(true);
      sendVideoEvent('play', { roomId, userId });
    }
  };

  const onPause = (event: any) => {
    // socket.on에 의해 멈춘 다음 onPause로 진입하기 전에 이미 isPlaying이 false가 되었기 때문에 신호 보내지 않음.
    // 무한루프 방지
    if (isPlaying) {
      setIsPlaying(false);
      sendVideoEvent('pause', { roomId, userId });
    }
  };

  return (
    <YouTube
      videoId={videoLink}
      onReady={onReady}
      onPlay={onPlay}
      onPause={onPause}
      opts={{
        playerVars: {
          autoplay: 1, // 자동재생
        },
      }}
    />
  );
}

export default VideoPlayer;
