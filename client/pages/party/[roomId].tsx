import { useEffect, useState } from 'react';
import { SERVER_URL } from '@/config';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import io from 'socket.io-client';
import axios, { AxiosError } from 'axios';

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;

  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socket = io(`${SERVER_URL}/chat`);
    socket.on('connect', () => {
      const userId = Math.random().toString(36).substring(2, 8);
      console.log('SOCKET CONNECTED!', socket.id);
      socket.emit('join room', { roomId, userId });
    });

    // update chat on new message dispatched
    socket.on('message', (message) => {
      console.log('메시지', message);
    });

    // socket disconnect on component unmount if exists
    return () => {
      socket.disconnect();
    };
  }, [roomId]);

  return <div>hello</div>;
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
