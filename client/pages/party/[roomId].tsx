import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { SERVER_URL } from '@/config';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import io, { Socket } from 'socket.io-client';
import axios, { AxiosError } from 'axios';
import { Message, ServerMessage } from '@/types/message';

const initialMessage: (Message | ServerMessage)[] = [];

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;

  const [socket, setSocket] = useState<Socket>();
  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState(initialMessage);

  useEffect(() => {
    const newSocket = io(`${SERVER_URL}/chat`);
    setSocket(newSocket);
    newSocket.on('connect', () => {
      const userId = Math.random().toString(36).substring(2, 8);
      setUserId(userId);
      console.log('SOCKET CONNECTED!', newSocket.id);
      newSocket.emit('join room', { roomId, userId });
    });

    // update chat on new message dispatched
    newSocket.on('message', (message) => {
      console.log('메시지', message);
      setMessages((prev) => [...prev, message]);
    });

    // socket disconnect on component unmount if exists
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

  return (
    <div className="container">
      <div className="chat-container">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index}>
              {(msg as ServerMessage).isServerMessage
                ? `[Server] ${msg.content}`
                : `${(msg as Message).user.userId} ${msg.content}`}
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
