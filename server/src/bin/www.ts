const PORT = process.env.PORT || '5000';

import server from '../app';
import { io } from '../lib/socket';

server.listen(PORT, () => {
  console.log(`Server is running on port${PORT}`);
});

io.listen(server);
