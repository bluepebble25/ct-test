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
  const [isJumped, setIsJumped] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  let intervalId: ReturnType<typeof setInterval> | null = null;

  const trackTimeInterval = () => {
    if (player) {
      const intervalId = setInterval(() => {
        setCurrentTime(player.getCurrentTime());
      }, 1000);
      return intervalId;
    } else {
      return null;
    }
  };

  useEffect(() => {
    player && setCurrentTime(player.getCurrentTime());

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

    socket.on('jump', (data: DetectVideoEventData<'jump'>) => {
      if (player && socket.id !== data.socketId) {
        const { time } = data;
        player.seekTo(time);
        setIsJumped(true);
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

    // 동영상의 어느 지점을 플레이하고 있는지 1초마다 업데이트
    intervalId = trackTimeInterval();
  };

  const onPlay = (event: any) => {
    if (!isPlaying) {
      setIsPlaying(true);
      sendVideoEvent('play', { roomId, userId });
    }
    intervalId = trackTimeInterval();
  };

  const onPause = (event: any) => {
    // socket.on에 의해 멈춘 다음 onPause로 진입하기 전에 이미 isPlaying이 false가 되었기 때문에 신호 보내지 않음.
    // 무한루프 방지
    if (isPlaying) {
      setIsPlaying(false);
      sendVideoEvent('pause', { roomId, userId });
    }

    intervalId && clearInterval(intervalId);
    intervalId = null;
  };

  const onStateChange = (event: any) => {
    console.log(event);
    let newTime = player.getCurrentTime();
    console.log(`이전지점: ${currentTime}, jump 지점: ${newTime}`);
    if (Math.abs(currentTime - newTime) > 2) {
      if (!isJumped) {
        // 본인이 점프하게 만든 주체라면
        sendVideoEvent('jump', { roomId, userId, time: newTime });
      } else {
        // 다른 사용자에 의해 jump하게 되었다면 이벤트 전송 건너뛰고, 다시 원래 상태인 false로 되돌린다.
        setIsJumped(false);
      }
    }
  };

  return (
    <YouTube
      videoId={videoLink}
      onReady={onReady}
      onPlay={onPlay}
      onPause={onPause}
      onStateChange={onStateChange}
      opts={{
        playerVars: {
          start: 1, // 1초 지점에서 동영상 시작 (이미 봤던 동영상인 경우 모두에게 점프 이벤트 전송하지 못하도록. 0초면 옵션 안먹음)
          autoplay: 1, // 자동재생
        },
      }}
    />
  );
}

export default VideoPlayer;
