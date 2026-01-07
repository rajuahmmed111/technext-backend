import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const CODE_LENGTH = 6;

const generateShortCode = (): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const generateUniqueShortCode = async (): Promise<string> => {
  let shortCode: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 100;

  do {
    shortCode = generateShortCode();
    const existing = await prisma.shortenedUrl.findUnique({
      where: { shortCode }
    });
    
    if (!existing) {
      isUnique = true;
    }
    
    attempts++;
  } while (!isUnique && attempts < maxAttempts);

  if (!isUnique) {
    throw new Error('Failed to generate unique short code after multiple attempts');
  }

  return shortCode!;
};

// create short url
const createShortUrl = async (originalUrl: string, userId: string) => {
  // Validate URL
  try {
    new URL(originalUrl);
  } catch {
    throw new Error('Invalid URL format');
  }

  const shortCode = await generateUniqueShortCode();
  const shortUrl = `${BASE_URL}/${shortCode}`;

  const shortenedUrl = await prisma.shortenedUrl.create({
    data: {
      originalUrl,
      shortCode,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      }
    }
  });

  return {
    ...shortenedUrl,
    shortUrl,
  };
};

const getUrlByShortCode = async (shortCode: string) => {
  const urlRecord = await prisma.shortenedUrl.findUnique({
    where: { shortCode },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      }
    }
  });

  if (!urlRecord) {
    throw new Error('Short URL not found');
  }

  return urlRecord;
};

const incrementClicks = async (shortCode: string) => {
  return await prisma.shortenedUrl.update({
    where: { shortCode },
    data: { clicks: { increment: 1 } },
  });
};

const getUserUrls = async (userId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [urls, total] = await Promise.all([
    prisma.shortenedUrl.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          }
        }
      }
    }),
    prisma.shortenedUrl.count({
      where: { userId }
    })
  ]);

  return {
    urls: urls.map(url => ({
      ...url,
      shortUrl: `${BASE_URL}/${url.shortCode}`
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

const deleteUrl = async (shortCode: string, userId: string) => {
  const url = await prisma.shortenedUrl.findFirst({
    where: { shortCode, userId }
  });

  if (!url) {
    throw new Error('URL not found or you do not have permission to delete it');
  }

  return await prisma.shortenedUrl.delete({
    where: { shortCode }
  });
};

const getUrlAnalytics = async (shortCode: string, userId: string) => {
  const url = await prisma.shortenedUrl.findFirst({
    where: { shortCode, userId },
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          email: true,
        }
      }
    }
  });

  if (!url) {
    throw new Error('URL not found or you do not have permission to access it');
  }

  return {
    ...url,
    shortUrl: `${BASE_URL}/${shortCode}`,
    clicks: url.clicks,
    createdAt: url.createdAt,
  };
};

export const UrlShortenerService = {
  createShortUrl,
  getUrlByShortCode,
  incrementClicks,
  getUserUrls,
  deleteUrl,
  getUrlAnalytics,
};
