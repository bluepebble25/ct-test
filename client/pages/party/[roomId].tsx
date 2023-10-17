import { useEffect, useState, useRef, ChangeEvent, FormEvent } from 'react';
import { SERVER_URL } from '@/config';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import io, { Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { Message, ServerMessage } from '@/types/message';
import VideoPlayer from '@/components/VideoPlayer';

const initialMessage: (Message | ServerMessage)[] = [];

export default function Room() {
  const router = useRouter();
  const roomId = router.query.roomId as string;

  const [socket, setSocket] = useState<Socket>();
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessage);
  const [videoLink, setVideoLink] = useState('');
  const linkRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io(`${SERVER_URL}/chat`);
    setSocket(newSocket);
    newSocket.on('connect', () => {
      const userId = Math.random().toString(36).substring(2, 8);
      setUserId(userId);
      console.log('SOCKET CONNECTED!', newSocket.id);
      newSocket.emit('joinRoom', { roomId, userId });
    });

    newSocket.on('message', (message) => {
      console.log('메시지', message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('newVideo', (data) => {
      setVideoLink(data.videoId);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId]);

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const message = e.target.value;
    setMessage(message);
  };

  const handleMessageSubmit = (e: FormEvent) => {
    e.preventDefault();
    const data = {
      roomId,
      user: {
        userId,
      },
      content: message,
    };
    socket?.emit('message', data);
    setMessage('');
  };

  const handleSubmitVideoLink = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const youtubeLinkRegex =
      /(?:youtube\.com\/watch\?v\=|youtube\.com\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    const link = linkRef.current?.value;
    if (link) {
      const match = link.match(youtubeLinkRegex);
      if (match && socket) {
        const videoId = match[1];
        setVideoLink(videoId);
        socket.emit('newVideo', { roomId, userId, videoId });
      } else {
        alert('유효한 유튜브 링크가 아닙니다.');
      }
    }
  };

  return (
    <div className="container">
      <div className="video-container">
        <div className="video-toolbar">
          <form onSubmit={handleSubmitVideoLink}>
            <input type="text" ref={linkRef} />
            <button type="submit">확인</button>
          </form>
        </div>
        <div className="youtube-area">
          {videoLink && socket && roomId && (
            <VideoPlayer
              videoLink={videoLink}
              socket={socket}
              roomId={roomId}
              userId={userId}
            />
          )}
        </div>
      </div>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index}>
              {!msg.hasOwnProperty('user')
                ? `[Server] ${msg.content}`
                : `${(msg as Message).user.userId}: ${msg.content}`}
            </div>
          ))}
        </div>
        <form onSubmit={handleMessageSubmit}>
          <textarea
            name="chat-input"
            onChange={handleMessageChange}
            value={message}
          ></textarea>
          <button type="submit">전송</button>
        </form>
      </div>
      <style>
        {`
            .container {
              --background-color: #202124;
              display: flex;
              justify-content: space-between;
              min-height: 100vh;
              background: var(--background-color);
              color: white;
            }
            .video-container {
              display: flex;
              flex-direction: column;
              width: 65%;
            }
            .youtube-area {
              position: relative;
              width: 100%;
              padding-top: 56.25%;
            }
            .youtube-area iframe {
              width: 100%;
              height: 100%;
              position: absolute;
              top: 0;
            }
            .chat-container {
              width: 25%;
            }
          `}
      </style>
    </div>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const { roomId } = ctx.query;
  // API 요청해서 방 존재하는지 유효성 검사하고 찾지 못해 status 404면 리디렉션
  try {
    const res = await axios.get(`${SERVER_URL}/api/rooms/${roomId}`);
    return {
      props: {},
    };
  } catch (e: any) {
    const { response } = e as unknown as AxiosError;

    if (response?.status === 404) {
      return {
        redirect: {
          destination: '/oops?reason=room-not-found',
          permanent: false,
        },
      };
    }
    return {
      props: {},
    };
  }
}
