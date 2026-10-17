import app from './app';
import connectDB from './config/db';
import env from './config/env';

const startServer = async (): Promise<void> => {
  await connectDB();

  const port = parseInt(env.PORT, 10);
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
};

startServer();
