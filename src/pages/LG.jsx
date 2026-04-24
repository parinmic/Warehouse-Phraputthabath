import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function LG() {
  const [trucks, setTrucks] = useState([])
  const [selectedTruck, setSelectedTruck] = useState('')
  const [loadingBay, setLoadingBay] = useState('')
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks() {
    const { data } = await supabase
      .from('trucks')
      .select('*')
      .eq('Status', 'waiting')
      .eq('Que_Date', new Date().toISOString().split('T')[0])
    setTrucks(data || [])
  }

  async function handleAssign() {
    if (!selectedTruck || !loadingBay) {
      setMessage('กรุณาเลือกข้อมูลให้ครบ')
      return
    }
    const { error } = await supabase
      .from('trucks')
      .update({ Loading_Bay: loadingBay, Status: 'assigned' })
      .eq('Truck_Plate', selectedTruck)
    if (error) {
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } else {
      setMessage('✅ กำหนดลานโหลดสำเร็จ')
      setSelectedTruck('')
      setLoadingBay('')
      fetchTrucks()
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button onClick={() => navigate('/')} className="mb-4 text-blue-500">← กลับ</button>
      <h1 className="text-2xl font-bold text-center mb-6">📋 LG จัดคิวรถ</h1>
      <div className="bg-white rounded-xl p-4 shadow space-y-4">
        <div>
          <label className="block text-sm font-bold mb-1">เลือกทะเบียนรถ</label>
          <select
            className="w-full border rounded-lg p-2"
            value={selectedTruck}
            onChange={e => setSelectedTruck(e.target.value)}
          >
            <option value="">เลือกรถ</option>
            {trucks.map(truck => (
              <option key={truck.ID} value={truck.Truck_Plate}>
                {truck.Truck_Plate} - {truck.Truck_Type}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">กำหนดลานโหลด</label>
          <select
            className="w-full border rounded-lg p-2"
            value={loadingBay}
            onChange={e => setLoadingBay(e.target.value)}
          >
            <option value="">เลือกลาน</option>
            <option value="ลานชิ้นส่วน">ลานชิ้นส่วน</option>
            <option value="ลานหัวเครื่องใน">ลานหัวเครื่องใน</option>
            <option value="ลานหมูซีก">ลานหมูซีก</option>
          </select>
        </div>
        {message && <div className="text-center font-semibold text-green-600">{message}</div>}
        <button
          onClick={handleAssign}
          className="w-full bg-green-500 text-white p-3 rounded-xl font-bold"
        >
          ยืนยันการจัดคิว
        </button>
      </div>
    </div>
  )
}
