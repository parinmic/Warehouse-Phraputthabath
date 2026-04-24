import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function QC() {
  const [trucks, setTrucks] = useState([])
  const [selectedTruck, setSelectedTruck] = useState('')
  const [temperature, setTemperature] = useState('')
  const [loadingBay, setLoadingBay] = useState('')
  const [photo, setPhoto] = useState(null)
  const [message, setMessage] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTrucks()
  }, [])

  async function fetchTrucks() {
    const { data } = await supabase
      .from('trucks')
      .select('*')
      .eq('Que_Date', new Date().toISOString().split('T')[0])
    setTrucks(data || [])
  }

  async function handleSubmit() {
    if (!selectedTruck || !temperature || !loadingBay || !photo) {
      setMessage('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    const fileName = `${Date.now()}_${photo.name}`
    const { error: uploadError } = await supabase.storage
      .from('qc-photos')
      .upload(fileName, photo)
    if (uploadError) {
      setMessage('อัปโหลดรูปไม่สำเร็จ')
      return
    }
    const { data: urlData } = supabase.storage
      .from('qc-photos')
      .getPublicUrl(fileName)
    const { error } = await supabase.from('qc_records').insert({
      truck_plate: selectedTruck,
      temperature: parseFloat(temperature),
      loading_bay: loadingBay,
      photo_url: urlData.publicUrl
    })
    if (error) {
      setMessage('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } else {
      setMessage('✅ บันทึก QC สำเร็จ')
      setSelectedTruck('')
      setTemperature('')
      setLoadingBay('')
      setPhoto(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <button onClick={() => navigate('/')} className="mb-4 text-blue-500">← กลับ</button>
      <h1 className="text-2xl font-bold text-center mb-6">🌡️ QC ตรวจรถ</h1>
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
          <label className="block text-sm font-bold mb-1">อุณหภูมิ (°C)</label>
          <input
            className="w-full border rounded-lg p-2"
            placeholder="เช่น -18"
            type="number"
            value={temperature}
            onChange={e => setTemperature(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">ลานโหลด</label>
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
        <div>
          <label className="block text-sm font-bold mb-1">ถ่ายรูปอุณหภูมิ</label>
          <input
            className="w-full border rounded-lg p-2"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={e => setPhoto(e.target.files[0])}
          />
        </div>
        {message && <div className="text-center font-semibold text-green-600">{message}</div>}
        <button
          onClick={handleSubmit}
          className="w-full bg-purple-500 text-white p-3 rounded-xl font-bold"
        >
          บันทึก QC
        </button>
      </div>
    </div>
  )
}
