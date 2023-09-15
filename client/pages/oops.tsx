import { useRouter } from 'next/router';

function Oops() {
  const router = useRouter();
  const { query } = router;

  let errorMessage = '페이지를 찾을 수 없습니다.';
  if (query.reason === 'room-not-found') {
    errorMessage = '유효하지 않은 방 코드입니다.';
  }
  return <h2>404 Error: {errorMessage}</h2>;
}

export default Oops;
