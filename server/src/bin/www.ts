const PORT = process.env.PORT || '5000';

import server from '../app';

server.listen(PORT, () => {
  console.log(`Server is running on port${PORT}`);
});
