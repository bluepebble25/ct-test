import { SERVER_URL } from '@/config';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import axios, { AxiosError } from 'axios';

export default function Room() {
  const router = useRouter();
  const { roomId } = router.query;

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
