import UserListClient from "@/components/admin/UserListClient";

export default function AdminUsersPage() {
  return (
    <div className="flex-1 space-y-4 p-1 md:p-8 pt-2">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">User Management</h2>
      </div>
      <UserListClient />
    </div>
  );
}