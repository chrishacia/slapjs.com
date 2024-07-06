import express from 'express';
import { redisClient } from './rateLimit';
import { HttpStatusCode, HttpStatusDescription } from './types/http-status.types';

const adminRouter = express.Router();

const handleError = (res: express.Response, err: unknown) => {
  let errorMessage: HttpStatusDescription | string = HttpStatusDescription.INTERNAL_SERVER_ERROR;

  if (err instanceof Error) {
    errorMessage = err.message;
  } else if (typeof err === 'string') {
    errorMessage = err;
  } else if (err && typeof err === 'object') {
    errorMessage = JSON.stringify(err);
  }

  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR).json({
    error: errorMessage
  });
};

// Route to unblock an IP
adminRouter.post('/unblock', async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ error: HttpStatusDescription.BAD_REQUEST });
  }

  try {
    await redisClient.del(`rate-limit:${ip}`);
    await redisClient.del(`permanent-block:${ip}`);
    res.status(HttpStatusCode.OK).json({ message: `IP ${ip} has been unblocked.` });
  } catch (err) {
    handleError(res, err);
  }
});

// Route to permanently block an IP
adminRouter.post('/permanent-block', async (req, res) => {
  const { ip } = req.body;
  if (!ip) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ error: HttpStatusDescription.BAD_REQUEST });
  }

  try {
    await redisClient.set(`permanent-block:${ip}`, 'blocked');
    res.status(HttpStatusCode.OK).json({ message: `IP ${ip} has been permanently blocked.` });
  } catch (err) {
    handleError(res, err);
  }
});

// Route to check if an IP is permanently blocked
adminRouter.get('/check-block', async (req, res) => {
  const { ip } = req.query;
  if (!ip) {
    return res.status(HttpStatusCode.BAD_REQUEST).json({ error: HttpStatusDescription.BAD_REQUEST });
  }

  try {
    const isBlocked = await redisClient.get(`permanent-block:${ip}`);
    if (isBlocked) {
      res.status(HttpStatusCode.OK).json({ message: `IP ${ip} is permanently blocked.` });
    } else {
      res.status(HttpStatusCode.OK).json({ message: `IP ${ip} is not permanently blocked.` });
    }
  } catch (err) {
    handleError(res, err);
  }
});

export default adminRouter;
