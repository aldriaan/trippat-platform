'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin,
  Clock,
  Users,
  DollarSign,
  Star,
  Eye,
  Calendar,
  Loader,
  Check,
  X,
  Image,
  ExternalLink
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { getApiUrl } from '@/lib/api';

interface Activity {
  _id: string;
  title: string;
  title_ar?: string;
  slug: string;
  description: string;
  description_ar?: string;
  destination: string;
  destination_ar?: string;
  city: string;
  city_ar?: string;
  country?: string;
  category: string;
  basePrice: number;
  currency: string;
  duration: number;
  difficultyLevel: string;
  maxParticipants: number;
  minParticipants: number;
  status: string;
  isPublished: boolean;
  featured: boolean;
  averageRating: number;
  totalReviews: number;
  views: number;
  bookings: number;
  primaryImage?: string;
  images: string[];
  highlights?: string[];
  highlights_ar?: string[];
  inclusions?: string[];
  inclusions_ar?: string[];
  exclusions?: string[];
  exclusions_ar?: string[];
  requirements?: string[];
  requirements_ar?: string[];
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  cancellationPolicy: string;
  instantConfirmation: boolean;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  createdBy: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ActivityDetailPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchActivity();
    }
  }, [id, isAuthenticated]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${getApiUrl()}/activities/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setActivity(data.data.activity);
      } else {
        setError(data.message || 'Failed to fetch activity');
      }
    } catch (error) {
      console.error('Fetch activity error:', error);
      setError('Failed to fetch activity');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this activity? This action cannot be undone.')) {
      return;
    }

    try {
      setDeleteLoading(true);
      const response = await fetch(`${getApiUrl()}/activities/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        router.push('/activities');
      } else {
        alert(data.message || 'Failed to delete activity');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete activity');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getDifficultyBadge = (difficulty: string) => {
    const difficultyClasses = {
      easy: 'bg-blue-100 text-blue-800',
      moderate: 'bg-yellow-100 text-yellow-800',
      challenging: 'bg-orange-100 text-orange-800',
      extreme: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${difficultyClasses[difficulty as keyof typeof difficultyClasses]}`}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </span>
    );
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? `${mins}m` : ''}`;
    }
    return `${mins}m`;
  };

  if (!isAuthenticated) {
    return <div>Please log in to view activities.</div>;
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader className="animate-spin" />
            <span>Loading activity...</span>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !activity) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error || 'Activity not found'}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/activities"
              className="flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2" />
              Back to Activities
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{activity.title}</h1>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href={`/activities/edit/${activity._id}`}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              <Edit className="mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="mr-2" />
              {deleteLoading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Activity Images */}
            {activity.images && activity.images.length > 0 && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="relative">
                  <img
                    src={activity.primaryImage || activity.images[0]}
                    alt={activity.title}
                    className="w-full h-80 object-cover"
                  />
                  {activity.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Featured
                      </span>
                    </div>
                  )}
                  {activity.images.length > 1 && (
                    <div className="absolute bottom-4 right-4">
                      <span className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                        +{activity.images.length - 1} more
                      </span>
                    </div>
                  )}
                </div>
                {activity.images.length > 1 && (
                  <div className="p-4">
                    <div className="grid grid-cols-4 gap-2">
                      {activity.images.slice(1, 5).map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${activity.title} ${index + 2}`}
                          className="w-full h-20 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 mb-4">{activity.description}</p>
                {activity.description_ar && (
                  <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-2">Arabic Description</h3>
                    <p className="text-gray-700" dir="rtl">{activity.description_ar}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activity Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Details</h2>
              
              {activity.highlights && activity.highlights.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">Highlights</h3>
                  <ul className="space-y-2">
                    {activity.highlights.map((highlight, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.inclusions && activity.inclusions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">What's Included</h3>
                  <ul className="space-y-2">
                    {activity.inclusions.map((inclusion, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="text-green-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{inclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.exclusions && activity.exclusions.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-medium text-gray-900 mb-2">What's Not Included</h3>
                  <ul className="space-y-2">
                    {activity.exclusions.map((exclusion, index) => (
                      <li key={index} className="flex items-start">
                        <X className="text-red-500 mt-1 mr-2 flex-shrink-0" />
                        <span className="text-gray-700">{exclusion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activity.requirements && activity.requirements.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Requirements</h3>
                  <ul className="space-y-2">
                    {activity.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 mt-1 mr-2 flex-shrink-0">•</span>
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status & Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  {getStatusBadge(activity.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Published:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.isPublished ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Featured:</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.featured ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.featured ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div className="flex items-center text-gray-700">
                  <MapPin className="mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{activity.city}, {activity.destination}</div>
                    {activity.country && (
                      <div className="text-sm text-gray-500">{activity.country}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <DollarSign className="mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{activity.currency} {activity.basePrice}</div>
                    <div className="text-sm text-gray-500">Base price</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Clock className="mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">{formatDuration(activity.duration)}</div>
                    <div className="text-sm text-gray-500">Duration</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <Users className="mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">
                      {activity.minParticipants} - {activity.maxParticipants} people
                    </div>
                    <div className="text-sm text-gray-500">Group size</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <span className="mr-3 text-gray-400">🎯</span>
                  <div>
                    <div className="font-medium">{getDifficultyBadge(activity.difficultyLevel)}</div>
                    <div className="text-sm text-gray-500 mt-1">Difficulty level</div>
                  </div>
                </div>

                <div className="flex items-center text-gray-700">
                  <span className="mr-3 text-gray-400">📂</span>
                  <div>
                    <div className="font-medium capitalize">{activity.category.replace('_', ' ')}</div>
                    <div className="text-sm text-gray-500">Category</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Eye className="mr-2 text-gray-400" />
                    <span className="text-gray-600">Views</span>
                  </div>
                  <span className="font-medium">{activity.views.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-400" />
                    <span className="text-gray-600">Bookings</span>
                  </div>
                  <span className="font-medium">{activity.bookings}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="mr-2 text-gray-400" />
                    <span className="text-gray-600">Rating</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{activity.averageRating.toFixed(1)}</div>
                    <div className="text-xs text-gray-500">({activity.totalReviews} reviews)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Instant Confirmation</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    activity.instantConfirmation ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {activity.instantConfirmation ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Cancellation Policy</span>
                  <span className="text-sm font-medium capitalize">
                    {activity.cancellationPolicy.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Coordinates */}
            {activity.coordinates && (activity.coordinates.latitude || activity.coordinates.longitude) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
                <div className="space-y-2">
                  {activity.coordinates.latitude && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Latitude</span>
                      <span className="font-mono text-sm">{activity.coordinates.latitude}</span>
                    </div>
                  )}
                  {activity.coordinates.longitude && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Longitude</span>
                      <span className="font-mono text-sm">{activity.coordinates.longitude}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Meta Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Meta Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-gray-600">Created by:</span>
                  <div className="font-medium">{activity.createdBy.name}</div>
                  <div className="text-gray-500">{activity.createdBy.email}</div>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="font-medium">
                    {new Date(activity.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <div className="font-medium">
                    {new Date(activity.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Activity ID:</span>
                  <div className="font-mono text-xs">{activity._id}</div>
                </div>
                <div>
                  <span className="text-gray-600">Slug:</span>
                  <div className="font-mono text-xs">{activity.slug}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}