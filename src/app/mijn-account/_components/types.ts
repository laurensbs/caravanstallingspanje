export interface CustomerData { name: string; email: string; phone: string; customer_number: string; referral_token?: string; }
export interface CaravanItem { id: number; brand: string; model: string; license_plate: string; status: string; location_name: string; spot_label: string; insurance_expiry: string; apk_expiry: string; }
export interface Invoice { id: number; invoice_number: string; description: string; total: number; status: string; due_date: string; }
export interface Contract { id: number; contract_number: string; start_date: string; end_date: string; monthly_rate: number; status: string; auto_renew: boolean; }
