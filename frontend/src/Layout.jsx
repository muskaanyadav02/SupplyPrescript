import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-gray-100 min-h-screen">

        <Navbar />

        <main className="p-6">

          <h1 className="text-3xl font-bold">
            Welcome 👋
          </h1>

          <p className="mt-3 text-gray-600">
            This is the dashboard content area.
          </p>

        </main>

      </div>

    </div>
  );
}

export default Layout;