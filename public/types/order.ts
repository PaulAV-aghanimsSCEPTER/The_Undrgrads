export interface Order {
  id: number
  name: string
  phone?: string
  facebook?: string
  chapter?: string
  address?: string
  color: string
  size: string
  design: string
  qty?: number
  price: number
  payment_status: string
  created_at?: string
  deleted_at?: string
  is_deleted?: boolean
  is_trashed?: boolean
  is_defective?: boolean
  isDefective?: boolean
  defective_note?: string
  defectiveNote?: string
  batch?: string
  batch_folder?: string
}