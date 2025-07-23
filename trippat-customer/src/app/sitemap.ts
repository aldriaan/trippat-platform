import { MetadataRoute } from 'next'
import { generatePackageSlug } from '@/utils/slugUtils'

async function getPackages() {
  try {
    const response = await fetch('http://localhost:5001/api/packages', {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch packages');
    }
    
    const data = await response.json();
    return data.success ? data.data.packages : [];
  } catch (error) {
    console.error('Error fetching packages for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const packages = await getPackages();
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://trippat.com' 
    : 'http://localhost:3000';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
      alternates: {
        languages: {
          en: `${baseUrl}/en`,
          ar: `${baseUrl}/ar`,
        },
      },
    },
    {
      url: `${baseUrl}/en/packages`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
      alternates: {
        languages: {
          en: `${baseUrl}/en/packages`,
          ar: `${baseUrl}/ar/packages`,
        },
      },
    },
    {
      url: `${baseUrl}/en/auth/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}/en/auth/login`,
          ar: `${baseUrl}/ar/auth/login`,
        },
      },
    },
    {
      url: `${baseUrl}/en/auth/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
      alternates: {
        languages: {
          en: `${baseUrl}/en/auth/register`,
          ar: `${baseUrl}/ar/auth/register`,
        },
      },
    },
  ];

  // Dynamic package routes
  const packageRoutes: MetadataRoute.Sitemap = packages.map((pkg: any) => {
    const slug = generatePackageSlug(pkg.title, pkg.destination, pkg._id);
    
    return {
      url: `${baseUrl}/en/packages/${slug}`,
      lastModified: new Date(pkg.updatedAt || pkg.createdAt || new Date()),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      alternates: {
        languages: {
          en: `${baseUrl}/en/packages/${slug}`,
          ar: `${baseUrl}/ar/packages/${slug}`,
        },
      },
    };
  });

  return [...staticRoutes, ...packageRoutes];
}