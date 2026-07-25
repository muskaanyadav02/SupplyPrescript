function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-gray-900 text-white p-5">
      <h1 className="text-2xl font-bold mb-10">Dashboard</h1>

      <ul className="space-y-5">
        <li className="cursor-pointer hover:text-blue-400">Home</li>
        <li className="cursor-pointer hover:text-blue-400">Analytics</li>
        <li className="cursor-pointer hover:text-blue-400">Users</li>
        <li className="cursor-pointer hover:text-blue-400">Settings</li>
      </ul>
    </div>
  );
}

export default Sidebar;