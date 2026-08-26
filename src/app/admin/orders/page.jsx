'use client'
import OrderTable from '../../../components/admin/OrderTable'

export default function AdminOrdersPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-cursive text-3xl font-bold text-[#3B0764]">Order Management</h1>
        <p className="font-sans text-sm text-[#C084FC] mt-1">View and update all customer orders</p>
      </div>
      <OrderTable />
    </div>
  )
}
