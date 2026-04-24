import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const [trucks, setTrucks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrucks()
    const subscription = supabase
      .channel('trucks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trucks' }, fetchTrucks)
      .subscribe()
    return () => supabase.removeChannel(subscription)
  }, [])

  async function fetchTrucks() {
    const { data } = await supabase
      .from('trucks')
      .select('*')
      .order('Scan_Time', { ascending: false })
    setTrucks(data || [])
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-center mb-6">🏭 Warehouse Phraputthabath</h1>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button onClick={() => navigate('/driver')} className="bg-blue-500 text-white p-4 rounded-xl text-center font-bold">🚛 คนขับ</button>
        <button onClick={() => navigate('/lg')} className="bg-green-500 text-white p-4 rounded-xl text-center font-bold">📋 LG</button>
        <button onClick={() => navigate('/picking')} className="bg-yellow-500 text-white p-4 rounded-xl text-center font-bold">✅ Picking</button>
        <button onClick={() => navigate('/qc')} className="bg-purple-500 text-white p-4 rounded-xl text-center font-bold">🌡️ QC</button>
        <button onClick={() => navigate('/loading-bay')} className="bg-orange-500 text-white p-4 rounded-xl text-center font-bold">🏗️ ลานโหลด</button>
        <button onClick={() => navigate('/planner')} className="bg-red-500 text-white p-4 rounded-xl text-center font-bold">📊 วางแผน</button>
      </div>
      <h2 className="text-xl font-bold mb-4">รถในโรงงานวันนี้</h2>
      <div className="space-y-3">
        {trucks.map(truck => (
          <div key={truck.ID} className="bg-white rounded-xl p-4 shadow">
            <div className="font-bold text-lg">{truck.Truck_Plate}</div>
            <div className="text-gray-500 text-sm">{truck.Truck_Type}</div>
            <div className="text-sm mt-1">สถานะ: <span className="font-semibold">{truck.Status}</span></div>
            <div className="text-sm">ลาน: {truck.Loading_Bay || '-'}</div>
          </div>
        ))}
        {trucks.length === 0 && <div className="text-center text-gray-400">ยังไม่มีรถเข้าโรงงานวันนี้</div>}
      </div>
    </div>
  )
}
