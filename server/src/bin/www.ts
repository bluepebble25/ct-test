const PORT = process.env.PORT || '5000';

var server = require('../app.ts');

server.listen(PORT, () => {
  console.log(`Server is running on port${PORT}`);
});
