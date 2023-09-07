import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleClick = () => {};

  return (
    <div>
      <h3>Youtube Party</h3>
      <button onClick={handleClick}>방 생성</button>
      <div>
        <input type="text" placeholder="코드 혹은 링크 붙여넣기" />{' '}
        <button>참여</button>
      </div>
    </div>
  );
}
