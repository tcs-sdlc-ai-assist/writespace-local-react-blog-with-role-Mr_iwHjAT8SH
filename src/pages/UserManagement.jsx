import { useState, useCallback } from 'react';
import { Navbar } from '../components/Navbar.jsx';
import { UserRow } from '../components/UserRow.jsx';
import { getSession } from '../utils/auth.js';
import { getUsers, addUser, deleteUser } from '../utils/storage.js';

/**
 * Admin-only user management page component.
 * Displays all users in a responsive table (desktop) / card list (mobile) using UserRow.
 * Includes a create user form with display name, username, password, and role fields.
 * Enforces username uniqueness. Admin can delete users except default admin and self.
 * Uses Navbar.
 *
 * @returns {JSX.Element}
 */
export function UserManagement() {
  const session = getSession();

  const [users, setUsers] = useState(() => {
    const stored = getUsers();
    return [...stored].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  });

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const hardCodedAdmin = {
    id: '__admin__',
    username: 'admin',
    displayName: 'Admin',
    role: 'admin',
    createdAt: null,
  };

  const allUsers = [hardCodedAdmin, ...users];

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username.trim()) {
      setError('Username is required.');
      return;
    }

    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }

    if (!password.trim()) {
      setError('Password is required.');
      return;
    }

    if (password.trim().length < 3) {
      setError('Password must be at least 3 characters.');
      return;
    }

    const trimmedUsername = username.trim();

    if (trimmedUsername === 'admin') {
      setError('Username is already taken.');
      return;
    }

    const existing = users.find((u) => u.username === trimmedUsername);
    if (existing) {
      setError('Username is already taken.');
      return;
    }

    setLoading(true);

    try {
      const newUser = addUser({
        username: trimmedUsername,
        password: password.trim(),
        displayName: displayName.trim() || trimmedUsername,
        role,
      });

      setUsers((prev) => [newUser, ...prev]);
      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setSuccess(`User "${newUser.username}" created successfully.`);
      setLoading(false);
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  const handleDelete = useCallback(
    (userId) => {
      const confirmed = window.confirm('Are you sure you want to delete this user?');
      if (!confirmed) return;

      const success = deleteUser(userId);
      if (success) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    },
    []
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar session={session} />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage platform users. Create new accounts or remove existing ones.
          </p>
        </div>

        {/* Create User Form */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm mb-10">
          <h2 className="text-xl font-bold text-gray-900">
            Create New User
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Add a new user to the platform.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700"
              >
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Enter display name"
                autoComplete="name"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Choose a username"
                autoComplete="username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                placeholder="Create a password"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors ${
                  loading
                    ? 'opacity-75 cursor-not-allowed'
                    : 'hover:bg-indigo-700'
                }`}
              >
                {loading ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </div>

        {/* Users List */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                All Users
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {allUsers.length} {allUsers.length === 1 ? 'user' : 'users'} on the platform.
              </p>
            </div>
          </div>

          {allUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 px-6 text-center shadow-sm">
              <span className="text-5xl mb-4">👥</span>
              <h2 className="text-xl font-bold text-gray-900">
                No users found
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md">
                Create the first user using the form above.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                        Joined
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((user) => (
                      <UserRow
                        key={user.id}
                        user={user}
                        session={session}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {allUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    session={session}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default UserManagement;