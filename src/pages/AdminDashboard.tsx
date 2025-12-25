
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart, LineChart, PieChart } from '../components/charts';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Post } from '../lib/types';
import PostEditor from '../components/PostEditor';
import { Button } from '../components/ui/Button';

const AdminDashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isPostEditorOpen, setIsPostEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      const postsCollection = collection(db, 'posts');
      const postSnapshot = await getDocs(postsCollection);
      const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post));
      setPosts(postList);
    };
    fetchPosts();
  }, []);

  const handleCreateNewPost = () => {
    setEditingPost(null);
    setIsPostEditorOpen(true);
  };

  const handleEditPost = (post: Post) => {
    setEditingPost(post);
    setIsPostEditorOpen(true);
  };

  const handleClosePostEditor = () => {
    setIsPostEditorOpen(false);
    setEditingPost(null);
  };
  
  const onSave = (post: Post) => {
    console.log('Post saved', post);
  };

  // Aggregate data for charts
  const postsByStatus = posts.reduce((acc, post) => {
    acc[post.status] = (acc[post.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const postsByAuthor = posts.reduce((acc, post) => {
    const author = post.authorName || 'Unknown';
    acc[author] = (acc[author] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const postsOverTime = posts.reduce((acc, post) => {
    if (post.createdAt) {
      const date = new Date((post.createdAt as any).toDate()).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const pieChartData = {
    labels: Object.keys(postsByStatus),
    datasets: [
      {
        data: Object.values(postsByStatus),
        backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
      },
    ],
  };

  const barChartData = {
    labels: Object.keys(postsByAuthor),
    datasets: [
      {
        label: 'Posts by Author',
        data: Object.values(postsByAuthor),
        backgroundColor: '#3F51B5',
      },
    ],
  };

  const lineChartData = {
    labels: Object.keys(postsOverTime).sort((a, b) => new Date(a).getTime() - new Date(b).getTime()),
    datasets: [
      {
        label: 'Posts Over Time',
        data: Object.values(postsOverTime),
        borderColor: '#2196F3',
        fill: false,
      },
    ],
  };

  const totalPosts = posts.length;
  const publishedPosts = posts.filter(post => post.status === 'published').length;
  const draftPosts = posts.filter(post => post.status === 'draft').length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={handleCreateNewPost}>Create New Post</Button>
      </div>

      {isPostEditorOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-gray-800 p-8 rounded-lg w-full max-w-4xl h-full overflow-y-auto">
            <PostEditor post={editingPost} onClose={handleClosePostEditor} onSave={onSave} />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Published Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{publishedPosts}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Draft Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{draftPosts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Posts by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={pieChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Posts by Author</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={barChartData} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Posts Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={lineChartData} />
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-gray-900 divide-y divide-gray-700">
                  {posts.slice(0, 5).map(post => (
                    <tr key={post.id}>
                      <td className="px-6 py-4">{post.title}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{post.authorName}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${post.status === 'published' ? 'bg-green-800 text-green-100' : 'bg-yellow-800 text-yellow-100'}`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{post.createdAt ? new Date((post.createdAt as any).toDate()).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(post)}>Edit</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
