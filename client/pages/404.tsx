import { useRouter } from 'next/router';

function NotFound() {
  const router = useRouter();

  let errorMessage = '페이지를 찾을 수 없습니다.';

  return <h2>404 Error: {errorMessage}</h2>;
}

export default NotFound;
