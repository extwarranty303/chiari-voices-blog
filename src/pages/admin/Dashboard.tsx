import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="container mx-auto mt-8">
      <h1 className="mb-8 text-4xl font-bold text-white">Admin Dashboard</h1>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Link to="/admin/posts" className="p-8 bg-gray-800 rounded-lg shadow-lg hover:bg-gray-700">
          <h2 className="text-2xl font-bold text-white">Manage Posts</h2>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
