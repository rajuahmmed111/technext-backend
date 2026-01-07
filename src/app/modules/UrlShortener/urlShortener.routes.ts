import { Router } from 'express';
import { UrlShortenerController } from './urlShortener.controller';
import auth from '../../middlewares/auth';

const router = Router();

// URL shortening routes
router.post('/shorten', auth(), UrlShortenerController.createShortUrl);
router.get('/my-urls', auth(), UrlShortenerController.getUserUrls);
router.delete('/:shortCode', auth(), UrlShortenerController.deleteUrl);
// router.get('/:shortCode/analytics', auth(), UrlShortenerController.getUrlAnalytics);

// Public redirect route (no auth required)
router.get('/:shortCode', UrlShortenerController.redirectUrl);

export const urlShortenerRoutes = router;
