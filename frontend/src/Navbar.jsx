function Navbar() {
  return (
    <div className="bg-white shadow-md h-16 flex items-center justify-between px-6">

      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <input
          type="text"
          placeholder="Search..."
          className="border rounded-md px-3 py-2"
        />

        <img
          src="https://i.pravatar.cc/40"
          alt="profile"
          className="rounded-full"
        />

      </div>

    </div>
  );
}

export default Navbar;