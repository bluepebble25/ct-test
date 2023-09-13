import { useRouter } from 'next/router';
import axios from 'axios';

export default function Home() {
  const router = useRouter();

  const handleClick = async () => {
    const { data } = await axios.post('/api/rooms');
    const { roomId } = data;
    router.push(`/party/${roomId}`);
  };

  return (
    <div>
      <h3>Youtube Party</h3>
      <button onClick={handleClick}>방 생성</button>
      <div>
        <input type="text" placeholder="코드 혹은 링크 붙여넣기" />{' '}
        <button>입장</button>
      </div>
    </div>
  );
}
