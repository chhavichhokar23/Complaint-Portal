import EmployeePerformance from "@/components/dashboard/EmployeePerformance"
export default function EmployeesPage() {
  return (
    <div className="p-8 space-y-6">

      <h1 className="text-2xl font-semibold">
        Employee Performance
      </h1>

      <EmployeePerformance />

    </div>
  )
}